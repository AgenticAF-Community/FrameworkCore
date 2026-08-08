/**
 * GET /api/access/reveal?token=... | ?session_id=...
 * Consumes one-time reveal token and returns API key JSON (once).
 *
 * session_id path requires the HttpOnly checkout bind cookie set when
 * Checkout was started, so a leaked cs_… URL alone cannot mint/reveal a key.
 */
import {
  CHECKOUT_BIND_COOKIE,
  activateSubscription,
  bindCheckoutSessionReveal,
  consumeRevealToken,
  takeCheckoutSessionReveal,
  verifyCheckoutBindSecret,
} from "../lib/access";
import { parseCookies } from "../lib/magic";
import { checkoutEmail, isPaidCheckoutSession } from "../lib/payments";
import { getStripe } from "../lib/stripe";

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    const sessionId = url.searchParams.get("session_id");

    if (!token && sessionId) {
      const cookies = parseCookies(req);
      const bindOk = await verifyCheckoutBindSecret(
        sessionId,
        cookies[CHECKOUT_BIND_COOKIE]
      );
      if (!bindOk) {
        return json(
          {
            error:
              "Checkout session is not bound to this browser. Open Manage access to rotate a key.",
          },
          403
        );
      }

      let mapped = await takeCheckoutSessionReveal(sessionId);

      // Webhook race: activate from Stripe if KV map not ready yet
      if (!mapped?.revealToken) {
        mapped = await activateFromCheckoutSession(sessionId);
      }

      if (mapped?.revealToken) {
        token = mapped.revealToken;
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
      message: "Copy this key now. It will not be shown again.",
    });
  } catch (e: any) {
    return json({ error: e?.message || "Reveal failed" }, 500);
  }
}

async function activateFromCheckoutSession(
  sessionId: string
): Promise<{ revealToken: string; customerId: string } | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!isPaidCheckoutSession(session)) return null;

  const customerId = String(session.customer || "");
  const subscriptionId = String(session.subscription || "");
  const email = checkoutEmail(session);
  if (!customerId || !email) return null;

  // Prefer an active/trialing subscription when Stripe has attached one.
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      if (!["active", "trialing"].includes(String(sub.status))) return null;
    } catch {
      return null;
    }
  }

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
  return { revealToken: result.revealToken, customerId: result.customerId };
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
