/**
 * Magic-link + session helpers for manage-access.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { getBillingConfig } from "./config";
import { getKv, kvGetDel, KV_PREFIX } from "./kv";
import { generateToken } from "./keys";
import type { CustomerRecord } from "./mcp-auth";

const SESSION_COOKIE = "aaf_mcp_session";
const MAGIC_TTL_SEC = 60 * 15;
const SESSION_TTL_SEC = 60 * 60 * 24 * 7;

export { SESSION_COOKIE };

export async function createMagicLink(
  email: string,
  appBaseUrl?: string
): Promise<{ ok: true; token: string; link: string } | { ok: false; error: string }> {
  const cfg = getBillingConfig();
  const base = (appBaseUrl || cfg.appBaseUrl).replace(/\/$/, "");
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return { ok: false, error: "Invalid email" };

  const kv = getKv();
  const customerId = await kv.get<string>(`${KV_PREFIX.email}${normalized}`);
  if (!customerId) {
    return { ok: false, error: "No subscription found for that email" };
  }

  const token = generateToken(32);
  await kv.set(
    `${KV_PREFIX.magic}${token}`,
    { email: normalized, customerId },
    { ex: MAGIC_TTL_SEC }
  );

  const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;
  return { ok: true, token, link };
}

export async function consumeMagicToken(
  token: string
): Promise<{ email: string; customerId: string } | null> {
  const key = `${KV_PREFIX.magic}${token}`;
  // Atomic get-and-delete — one-time magic links cannot be raced.
  const data = await kvGetDel<{ email: string; customerId: string }>(key);
  return data || null;
}

export function signSession(payload: { customerId: string; email: string; exp: number }): string {
  const cfg = getBillingConfig();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", cfg.authSecret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string): { customerId: string; email: string } | null {
  try {
    const cfg = getBillingConfig();
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = createHmac("sha256", cfg.authSecret).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.customerId || !payload?.email || !payload?.exp) return null;
    if (Date.now() / 1000 > payload.exp) return null;
    return { customerId: payload.customerId, email: payload.email };
  } catch {
    return null;
  }
}

export function sessionCookieValue(customerId: string, email: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  return signSession({ customerId, email, exp });
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.get("cookie") || "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function getSessionFromRequest(req: Request): { customerId: string; email: string } | null {
  const cookies = parseCookies(req);
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  return verifySession(raw);
}

export async function getCustomer(customerId: string): Promise<CustomerRecord | null> {
  const kv = getKv();
  return kv.get<CustomerRecord>(`${KV_PREFIX.customer}${customerId}`);
}

export { MAGIC_TTL_SEC, SESSION_TTL_SEC };
