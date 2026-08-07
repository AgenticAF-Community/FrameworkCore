/**
 * GET /api/auth/verify?token=... — consume magic link, set session cookie, redirect to manage-access.
 */
import { SESSION_COOKIE, consumeMagicToken, sessionCookieValue } from "../lib/magic";
import { isHttpsBase, resolveAppBaseUrl } from "../lib/urls";

export async function GET(req: Request): Promise<Response> {
  const appBase = resolveAppBaseUrl(req);
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.redirect(`${appBase}/manage-access?error=missing_token`, 303);
  }

  const data = await consumeMagicToken(token);
  if (!data) {
    return Response.redirect(`${appBase}/manage-access?error=expired`, 303);
  }

  const session = sessionCookieValue(data.customerId, data.email);
  const secure = isHttpsBase(appBase);
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${secure ? "; Secure" : ""}`;

  return new Response(null, {
    status: 303,
    headers: {
      Location: `${appBase}/manage-access`,
      "Set-Cookie": cookie,
    },
  });
}
