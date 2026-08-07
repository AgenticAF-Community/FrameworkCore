/**
 * GET /api/auth/me — current manage-access session + usage.
 * POST /api/auth/signout — clear cookie.
 */
import { getBillingConfig } from "../lib/config";
import { getKv, KV_PREFIX } from "../lib/kv";
import { SESSION_COOKIE, getCustomer, getSessionFromRequest } from "../lib/magic";

export async function GET(req: Request): Promise<Response> {
  const session = getSessionFromRequest(req);
  if (!session) return json({ authenticated: false }, 401);

  const customer = await getCustomer(session.customerId);
  if (!customer) return json({ authenticated: false }, 401);

  const kv = getKv();
  const calls = Number((await kv.get(`${KV_PREFIX.customer}${session.customerId}:calls`)) ?? customer.callsUsed ?? 0);
  const cfg = getBillingConfig();

  return json({
    authenticated: true,
    email: session.email,
    status: customer.status,
    callsUsed: calls,
    includedCalls: customer.includedCalls || cfg.includedCallsPerMonth,
    periodEnd: customer.periodEnd || null,
    portalUrl: cfg.stripeCustomerPortalUrl || null,
  });
}

export async function POST(req: Request): Promise<Response> {
  // sign out
  const cfg = getBillingConfig();
  const secure = cfg.appBaseUrl.startsWith("https");
  const cookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
