/**
 * Resolve the public app base URL for redirects/links.
 * Prefer the incoming request host for localhost / Preview; fall back to APP_BASE_URL.
 */
export function resolveAppBaseUrl(req: Request): string {
  const envBase = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
  const xfHost = (req.headers.get("x-forwarded-host") || "").split(",")[0].trim();
  const host = xfHost || (req.headers.get("host") || "").trim();
  const xfProto = (req.headers.get("x-forwarded-proto") || "").split(",")[0].trim();

  if (host) {
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const isPreview = host.includes(".vercel.app");
    if (isLocal || isPreview) {
      const proto = xfProto || (isLocal ? "http" : "https");
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }

  if (envBase) return envBase;

  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`.replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

export function isHttpsBase(baseUrl: string): boolean {
  return baseUrl.startsWith("https://");
}
