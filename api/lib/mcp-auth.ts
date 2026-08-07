/**
 * MCP Bearer auth + monthly quota (hard cap).
 */
import { getBillingConfig } from "./config";
import { getKv, KV_PREFIX } from "./kv";
import { hashApiKey, isApiKeyFormat } from "./keys";

export type CustomerRecord = {
  email: string;
  status: "active" | "inactive" | "past_due" | "canceled";
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  keyHash: string;
  callsUsed: number;
  includedCalls: number;
  periodStart?: string;
  periodEnd?: string;
  createdAt?: string;
};

export type AuthOk = {
  ok: true;
  customerId: string;
  customer: CustomerRecord;
  callsUsed: number;
};

export type AuthFail = {
  ok: false;
  status: 401 | 429;
  error: string;
};

export type AuthResult = AuthOk | AuthFail;

function extractBearer(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

function callsKey(customerId: string): string {
  return `${KV_PREFIX.customer}${customerId}:calls`;
}

export async function authenticateMcpRequest(req: Request): Promise<AuthResult> {
  const cfg = getBillingConfig();
  const token = extractBearer(req);

  if (!token || !isApiKeyFormat(token)) {
    return { ok: false, status: 401, error: "Missing or invalid API key" };
  }

  const keyHash = hashApiKey(token);
  const kv = getKv();
  const customerId = await kv.get<string>(`${KV_PREFIX.keyHash}${keyHash}`);
  if (!customerId) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  const customer = await kv.get<CustomerRecord>(`${KV_PREFIX.customer}${customerId}`);
  if (!customer || customer.status !== "active") {
    return { ok: false, status: 401, error: "Subscription inactive" };
  }

  if (customer.keyHash && customer.keyHash !== keyHash) {
    return { ok: false, status: 401, error: "Invalid API key" };
  }

  const included = customer.includedCalls || cfg.includedCallsPerMonth;
  const counterKey = callsKey(customerId);
  const usedBeforeRaw = await kv.get<number | string>(counterKey);
  const usedBefore = Number(usedBeforeRaw ?? customer.callsUsed ?? 0);
  if (usedBefore >= included) {
    return { ok: false, status: 429, error: "Monthly request limit reached (1000)" };
  }

  const nextUsed = await kv.incr(counterKey);
  await kv.set(`${KV_PREFIX.customer}${customerId}`, {
    ...customer,
    callsUsed: nextUsed,
    includedCalls: included,
  });

  if (nextUsed > included) {
    return { ok: false, status: 429, error: "Monthly request limit reached (1000)" };
  }

  return {
    ok: true,
    customerId,
    customer: { ...customer, callsUsed: nextUsed, includedCalls: included },
    callsUsed: nextUsed,
  };
}

export function authErrorResponse(result: AuthFail): Response {
  return new Response(JSON.stringify({ error: result.error }), {
    status: result.status,
    headers: {
      "content-type": "application/json",
      ...(result.status === 401 ? { "WWW-Authenticate": "Bearer" } : {}),
    },
  });
}

/** When MCP_AUTH_REQUIRED is false, allow open access (legacy). */
export async function gateMcpRequest(
  req: Request
): Promise<AuthResult | { ok: true; bypass: true }> {
  const required = String(process.env.MCP_AUTH_REQUIRED || "").toLowerCase() === "true";
  if (!required) return { ok: true, bypass: true };
  return authenticateMcpRequest(req);
}

export async function setCustomerCallsUsed(customerId: string, callsUsed: number): Promise<void> {
  const kv = getKv();
  const customer = await kv.get<CustomerRecord>(`${KV_PREFIX.customer}${customerId}`);
  if (customer) {
    await kv.set(`${KV_PREFIX.customer}${customerId}`, { ...customer, callsUsed });
  }
  await kv.set(callsKey(customerId), callsUsed);
}
