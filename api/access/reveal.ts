/**
 * GET /api/access/reveal?token=... | ?session_id=...
 * Consumes one-time reveal token and returns API key JSON (once).
 */
import { consumeRevealToken } from "../lib/access";
import { getKv, KV_PREFIX } from "../lib/kv";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    const sessionId = url.searchParams.get("session_id");

    if (!token && sessionId) {
      const kv = getKv();
      const mapped = await kv.get<{ revealToken: string }>(`${KV_PREFIX.reveal}session:${sessionId}`);
      if (mapped?.revealToken) {
        token = mapped.revealToken;
        await kv.del(`${KV_PREFIX.reveal}session:${sessionId}`);
      }
    }

    if (!token) {
      return json({ error: "Missing token or session_id" }, 400);
    }

    const revealed = await consumeRevealToken(token);
    if (!revealed) {
      return json({ error: "Token expired or already used" }, 410);
    }

    if (revealed.reused || !revealed.apiKey) {
      return json({
        error: "Key was already issued. Use Manage access to rotate.",
        reused: true,
      }, 409);
    }

    return json({
      apiKey: revealed.apiKey,
      customerId: revealed.customerId,
      message: "Copy this key now. It will not be shown again.",
    });
  } catch (e: any) {
    return json({ error: e?.message || "Reveal failed" }, 500);
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
