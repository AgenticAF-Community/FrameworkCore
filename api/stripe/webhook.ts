/**
 * POST /api/stripe/webhook — subscription lifecycle → KV access records.
 */
import { getBillingConfig } from "../lib/config";
import { getStripe } from "../lib/stripe";
import {
  activateSubscription,
  bindCheckoutSessionReveal,
  deactivateSubscription,
} from "../lib/access";
import { checkoutEmail, isPaidCheckoutSession } from "../lib/payments";

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: Request): Promise<Buffer> {
  const ab = await req.arrayBuffer();
  return Buffer.from(ab);
}

async function activateFromPaidSession(session: any): Promise<void> {
  if (!isPaidCheckoutSession(session)) return;

  const customerId = String(session.customer || "");
  const subscriptionId = String(session.subscription || "");
  const email = checkoutEmail(session);
  if (!customerId || !email) return;

  const result = await activateSubscription({
    email,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  await bindCheckoutSessionReveal(session.id, result.revealToken, result.customerId);
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
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await activateFromPaidSession(event.data.object);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as any;
        const customerId = String(session.customer || "");
        if (customerId) await deactivateSubscription(customerId);
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
