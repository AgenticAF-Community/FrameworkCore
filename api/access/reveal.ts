/**
 * GET /api/access/reveal?token=... | ?session_id=...
 * Consumes one-time reveal token and returns API key JSON (once).
 * If webhook is slow, session_id path can activate from Stripe Checkout Session.
 */
import { activateSubscription, bindCheckoutSessionReveal, consumeRevealToken } from "../lib/access";
import { getKv, KV_PREFIX } from "../lib/kv";
import { getStripe } from "../lib/stripe";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    const sessionId = url.searchParams.get("session_id");

    if (!token && sessionId) {
      const kv = getKv();
      let mapped = await kv.get<{ revealToken: string }>(`${KV_PREFIX.reveal}session:${sessionId}`);

      // Webhook race: activate from Stripe if KV map not ready yet
      if (!mapped?.revealToken) {
        mapped = await activateFromCheckoutSession(sessionId);
      }

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
      return json(
        {
          error: "Key was already issued. Use Manage access to rotate.",
          reused: true,
        },
        409
      );
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

async function activateFromCheckoutSession(
  sessionId: string
): Promise<{ revealToken: string } | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.mode !== "subscription") return null;
  if (session.status !== "complete" && session.payment_status !== "paid") return null;

  const customerId = String(session.customer || "");
  const subscriptionId = String(session.subscription || "");
  const email = String(
    session.customer_details?.email || session.customer_email || ""
  ).toLowerCase();
  if (!customerId || !email) return null;

  const result = await activateSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  if (result.reused || !result.apiKey) {
    // Already activated via webhook without leftover plaintext — cannot re-show key
    return null;
  }

  await bindCheckoutSessionReveal(sessionId, result.revealToken, result.customerId);
  return { revealToken: result.revealToken };
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
