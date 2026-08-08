/**
 * Activate a paid subscriber: mint API key, store hash in KV, one-time reveal token.
 */
import { getBillingConfig } from "./config";
import { getKv, KV_PREFIX } from "./kv";
import { generateApiKey, generateToken, hashApiKey } from "./keys";
import { callsKey } from "./mcp-auth";
import type { CustomerRecord } from "./mcp-auth";

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
      { customerId, apiKey: null, reused: true },
      { ex: 3600 }
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
    { customerId, apiKey, reused: false },
    { ex: 3600 }
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
  const data = await kv.get<{ customerId: string; apiKey: string | null; reused?: boolean }>(key);
  if (!data) return null;
  await kv.del(key);
  return {
    customerId: data.customerId,
    apiKey: data.apiKey,
    reused: !!data.reused,
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
    { ex: 3600 }
  );
}
