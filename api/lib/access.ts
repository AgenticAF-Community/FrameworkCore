/**
 * Activate a paid subscriber: mint API key, store hash in KV, one-time reveal token.
 * Reveal records store encrypted plaintext only (short TTL); consume is atomic (GETDEL).
 */
import { createHash, timingSafeEqual } from "crypto";
import { getBillingConfig } from "./config";
import { getKv, kvGetDel, KV_PREFIX } from "./kv";
import { generateApiKey, generateToken, hashApiKey } from "./keys";
import { callsKey } from "./mcp-auth";
import type { CustomerRecord } from "./mcp-auth";
import { encryptApiKey, decryptApiKey, type EncryptedReveal } from "./reveal-crypto";

/** One-time reveal TTL (seconds). Keep short — key is shown once on success page. */
export const REVEAL_TTL_SEC = 15 * 60;
/** Checkout bind cookie TTL — covers Stripe redirect round-trip. */
export const CHECKOUT_BIND_TTL_SEC = 2 * 60 * 60;

export const CHECKOUT_BIND_COOKIE = "aaf_cs_bind";

export type ActivateInput = {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  periodStart?: string;
  periodEnd?: string;
};

export type ActivateResult = {
  customerId: string;
  revealToken: string;
  apiKey: string;
  reused?: boolean;
};

type RevealRecord = {
  customerId: string;
  reused?: boolean;
  /** Encrypted API key (preferred). */
  enc?: EncryptedReveal;
  /** Legacy plaintext — decrypted path still accepts briefly during rollout. */
  apiKey?: string | null;
};

export async function activateSubscription(input: ActivateInput): Promise<ActivateResult> {
  const cfg = getBillingConfig();
  const kv = getKv();
  const email = input.email.trim().toLowerCase();
  const customerId = input.stripeCustomerId;

  const existing = await kv.get<CustomerRecord>(`${KV_PREFIX.customer}${customerId}`);
  if (existing?.keyHash && existing.status === "active") {
    // Idempotent replay: do not mint a new key; no plaintext available
    const revealToken = generateToken(24);
    await kv.set(
      `${KV_PREFIX.reveal}${revealToken}`,
      { customerId, reused: true } satisfies RevealRecord,
      { ex: REVEAL_TTL_SEC }
    );
    return { customerId, revealToken, apiKey: "", reused: true };
  }

  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const record: CustomerRecord = {
    email,
    status: "active",
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    keyHash,
    callsUsed: 0,
    includedCalls: cfg.includedCallsPerMonth,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    createdAt: new Date().toISOString(),
  };

  if (existing?.keyHash) {
    await kv.del(`${KV_PREFIX.keyHash}${existing.keyHash}`);
  }

  await kv.set(`${KV_PREFIX.customer}${customerId}`, record);
  await kv.set(callsKey(customerId), 0);
  await kv.set(`${KV_PREFIX.keyHash}${keyHash}`, customerId);
  await kv.set(`${KV_PREFIX.email}${email}`, customerId);

  const revealToken = generateToken(24);
  await kv.set(
    `${KV_PREFIX.reveal}${revealToken}`,
    { customerId, reused: false, enc: encryptApiKey(apiKey) } satisfies RevealRecord,
    { ex: REVEAL_TTL_SEC }
  );

  return { customerId, revealToken, apiKey, reused: false };
}

export async function deactivateSubscription(stripeCustomerId: string): Promise<void> {
  const kv = getKv();
  const customer = await kv.get<CustomerRecord>(`${KV_PREFIX.customer}${stripeCustomerId}`);
  if (!customer) return;
  await kv.set(`${KV_PREFIX.customer}${stripeCustomerId}`, {
    ...customer,
    status: "inactive",
  });
}

export async function consumeRevealToken(
  token: string
): Promise<{ apiKey: string | null; reused: boolean; customerId: string } | null> {
  const kv = getKv();
  const key = `${KV_PREFIX.reveal}${token}`;
  const data = await kvGetDel<RevealRecord>(key);
  if (!data) return null;

  let apiKey: string | null = null;
  if (data.enc) {
    try {
      apiKey = decryptApiKey(data.enc);
    } catch {
      apiKey = null;
    }
  } else if (typeof data.apiKey === "string" && data.apiKey) {
    apiKey = data.apiKey;
  }

  return {
    customerId: data.customerId,
    apiKey,
    reused: !!data.reused || !apiKey,
  };
}

/** Map checkout session → reveal token for success page. */
export async function bindCheckoutSessionReveal(
  sessionId: string,
  revealToken: string,
  customerId: string
): Promise<void> {
  const kv = getKv();
  await kv.set(
    `${KV_PREFIX.reveal}session:${sessionId}`,
    { revealToken, customerId },
    { ex: REVEAL_TTL_SEC }
  );
}

/** Bind a browser-only secret to a Checkout session (set as HttpOnly cookie). */
export async function storeCheckoutBindSecret(
  sessionId: string,
  bindSecret: string
): Promise<void> {
  const kv = getKv();
  await kv.set(`${KV_PREFIX.reveal}bind:${sessionId}`, bindSecret, {
    ex: CHECKOUT_BIND_TTL_SEC,
  });
}

export async function verifyCheckoutBindSecret(
  sessionId: string,
  presented: string | undefined | null
): Promise<boolean> {
  if (!presented) return false;
  const kv = getKv();
  const expected = await kv.get<string>(`${KV_PREFIX.reveal}bind:${sessionId}`);
  if (!expected || typeof expected !== "string") return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(expected).digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Atomically take session→reveal mapping (GETDEL). */
export async function takeCheckoutSessionReveal(
  sessionId: string
): Promise<{ revealToken: string; customerId: string } | null> {
  const key = `${KV_PREFIX.reveal}session:${sessionId}`;
  const data = await kvGetDel<{
    revealToken: string;
    customerId: string;
  }>(key);
  if (!data?.revealToken) return null;
  return data;
}

export function checkoutBindCookieHeader(bindSecret: string, secure: boolean): string {
  const parts = [
    `${CHECKOUT_BIND_COOKIE}=${encodeURIComponent(bindSecret)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${CHECKOUT_BIND_TTL_SEC}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
