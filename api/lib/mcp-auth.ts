/**
 * MCP Bearer auth + monthly quota (hard cap).
 * Usage counters are keyed by calendar month (UTC).
 * Only JSON-RPC tools/call counts toward the 1000 tool-call quota.
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

export function currentPeriodId(d = new Date()): string {
  return d.toISOString().slice(0, 7); // YYYY-MM UTC
}

export function callsKey(customerId: string, periodId = currentPeriodId()): string {
  return `${KV_PREFIX.customer}${customerId}:calls:${periodId}`;
}

/** Production-like hosts must enforce MCP auth. */
export function isProductionLike(): boolean {
  if (String(process.env.VERCEL_ENV || "").toLowerCase() === "production") return true;
  const base = String(process.env.APP_BASE_URL || "").toLowerCase();
  return base.includes("agenticaf.io");
}

/** True when production would otherwise open-bypass MCP. */
export function mcpAuthMisconfigured(): boolean {
  if (!isProductionLike()) return false;
  return String(process.env.MCP_AUTH_REQUIRED || "").toLowerCase() !== "true";
}

/** Whether this request should consume a quota unit (tools/call only). */
export async function requestCountsTowardQuota(req: Request): Promise<boolean> {
  if (req.method !== "POST") return false;
  try {
    const clone = req.clone();
    const text = await clone.text();
    if (!text) return false;
    // Streamable MCP may be JSON or SSE-wrapped; try JSON first
    const trimmed = text.trim();
    if (trimmed.startsWith("{")) {
      const body = JSON.parse(trimmed);
      return body?.method === "tools/call";
    }
    // SSE data lines
    for (const line of text.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload.startsWith("{")) continue;
      try {
        const body = JSON.parse(payload);
        if (body?.method === "tools/call") return true;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* non-JSON body — do not count */
  }
  return false;
}

export async function authenticateMcpRequest(
  req: Request,
  opts?: { meterToolCall?: boolean }
): Promise<AuthResult> {
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
  const periodId = currentPeriodId();
  const counterKey = callsKey(customerId, periodId);
  const usedBeforeRaw = await kv.get<number | string>(counterKey);
  const usedBefore = Number(usedBeforeRaw ?? 0);

  const shouldMeter = opts?.meterToolCall !== false;

  if (!shouldMeter) {
    return {
      ok: true,
      customerId,
      customer: { ...customer, callsUsed: usedBefore, includedCalls: included },
      callsUsed: usedBefore,
    };
  }

  if (usedBefore >= included) {
    return { ok: false, status: 429, error: "Monthly tool-call limit reached (1000)" };
  }

  const nextUsed = await kv.incr(counterKey);
  await kv.set(`${KV_PREFIX.customer}${customerId}`, {
    ...customer,
    callsUsed: nextUsed,
    includedCalls: included,
    periodStart: `${periodId}-01`,
  });

  if (nextUsed > included) {
    return { ok: false, status: 429, error: "Monthly tool-call limit reached (1000)" };
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

/**
 * Gate MCP requests.
 * - Production-like: MCP_AUTH_REQUIRED must be true (else caller returns 503).
 * - Local/preview: MCP_AUTH_REQUIRED=false allows open bypass for development only.
 * - Quota: only tools/call increments the monthly counter.
 */
export async function gateMcpRequest(
  req: Request
): Promise<AuthResult | { ok: true; bypass: true }> {
  const required = String(process.env.MCP_AUTH_REQUIRED || "").toLowerCase() === "true";
  if (!required) {
    if (isProductionLike()) {
      // Caller should have blocked via mcpAuthMisconfigured; keep fail-closed here too.
      return { ok: false, status: 401, error: "MCP auth required in production" };
    }
    return { ok: true, bypass: true };
  }

  const meterToolCall = await requestCountsTowardQuota(req);
  return authenticateMcpRequest(req, { meterToolCall });
}

export async function setCustomerCallsUsed(customerId: string, callsUsed: number): Promise<void> {
  const kv = getKv();
  const customer = await kv.get<CustomerRecord>(`${KV_PREFIX.customer}${customerId}`);
  if (customer) {
    await kv.set(`${KV_PREFIX.customer}${customerId}`, { ...customer, callsUsed });
  }
  await kv.set(callsKey(customerId), callsUsed);
}

export async function getCustomerCallsUsed(customerId: string): Promise<number> {
  const kv = getKv();
  const raw = await kv.get<number | string>(callsKey(customerId));
  return Number(raw ?? 0);
}
