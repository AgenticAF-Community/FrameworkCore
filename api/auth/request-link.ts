/**
 * POST /api/auth/request-link — email a magic link (subject locked).
 */
import { Resend } from "resend";
import { getBillingConfig } from "../lib/config";
import { createMagicLink } from "../lib/magic";
import { getKv } from "../lib/kv";
import { resolveAppBaseUrl } from "../lib/urls";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return json({ error: "Email required" }, 400);

    const kv = getKv();
    const rlKey = `aaf:rl:magic:${email}`;
    const recent = await kv.get(rlKey);
    if (recent) return json({ error: "Please wait a minute before requesting another link" }, 429);
    await kv.set(rlKey, "1", { ex: 60 });

    const appBase = resolveAppBaseUrl(req);
    const created = await createMagicLink(email, appBase);
    if (!created.ok) {
      return json({ ok: true, message: "If that email has MCP access, a link is on the way." });
    }

    const cfg = getBillingConfig();
    const resend = new Resend(cfg.resendApiKey);
    await resend.emails.send({
      from: `AAF <${cfg.resendFromEmail}>`,
      to: email,
      subject: "AAF MAGIC LINK FOR SIGN IN",
      text: `Sign in to manage your AAF MCP access:\n\n${created.link}\n\nThis link expires in 15 minutes. If you did not request it, ignore this email.`,
    });

    return json({ ok: true, message: "If that email has MCP access, a link is on the way." });
  } catch (e: any) {
    return json({ error: e?.message || "Failed to send link" }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
