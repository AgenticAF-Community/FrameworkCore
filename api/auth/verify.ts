/**
 * GET /api/auth/verify?token=... — consume magic link, set session cookie, redirect to manage-access.
 */
import { getBillingConfig } from "../lib/config";
import { SESSION_COOKIE, consumeMagicToken, sessionCookieValue } from "../lib/magic";

export async function GET(req: Request): Promise<Response> {
  const cfg = getBillingConfig();
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.redirect(`${cfg.appBaseUrl}/manage-access?error=missing_token`, 303);
  }

  const data = await consumeMagicToken(token);
  if (!data) {
    return Response.redirect(`${cfg.appBaseUrl}/manage-access?error=expired`, 303);
  }

  const session = sessionCookieValue(data.customerId, data.email);
  const secure = cfg.appBaseUrl.startsWith("https");
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure ? "; Secure" : ""}`;

  return new Response(null, {
    status: 303,
    headers: {
      Location: `${cfg.appBaseUrl}/manage-access`,
      "Set-Cookie": cookie,
    },
  });
}
