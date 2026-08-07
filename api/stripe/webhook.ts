/**
 * POST /api/stripe/webhook — subscription lifecycle → KV access records.
 */
import { getBillingConfig } from "../lib/config";
import { getStripe } from "../lib/stripe";
import { activateSubscription, deactivateSubscription } from "../lib/access";

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: Request): Promise<Buffer> {
  const ab = await req.arrayBuffer();
  return Buffer.from(ab);
}

export async function POST(req: Request): Promise<Response> {
  const cfg = getBillingConfig();
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, sig, cfg.stripeWebhookSecret);
  } catch (e: any) {
    return new Response(`Webhook Error: ${e.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        if (session.mode !== "subscription") break;
        const customerId = String(session.customer || "");
        const subscriptionId = String(session.subscription || "");
        const email = String(session.customer_details?.email || session.customer_email || "").toLowerCase();
        if (!customerId || !email) break;

        const result = await activateSubscription({
          email,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        });

        // Stash reveal token against checkout session for success page fallback
        const { getKv, KV_PREFIX } = await import("../lib/kv");
        const kv = getKv();
        await kv.set(
          `${KV_PREFIX.reveal}session:${session.id}`,
          { revealToken: result.revealToken, customerId: result.customerId },
          { ex: 3600 }
        );
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as any;
        const customerId = String(sub.customer || "");
        if (customerId) await deactivateSubscription(customerId);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const customerId = String(sub.customer || "");
        if (!customerId) break;
        if (sub.status === "active" || sub.status === "trialing") {
          // leave active; key already minted on checkout
        } else if (["canceled", "unpaid", "incomplete_expired"].includes(sub.status)) {
          await deactivateSubscription(customerId);
        }
        break;
      }
      default:
        break;
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
