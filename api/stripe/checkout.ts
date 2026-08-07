/**
 * GET/POST /api/stripe/checkout — start £3/mo MCP subscription Checkout.
 */
import { getBillingConfig } from "../lib/config";
import { getStripe } from "../lib/stripe";

export async function GET(req: Request): Promise<Response> {
  return startCheckout(req);
}

export async function POST(req: Request): Promise<Response> {
  return startCheckout(req);
}

async function startCheckout(req: Request): Promise<Response> {
  try {
    const cfg = getBillingConfig();
    const stripe = getStripe();
    const url = new URL(req.url);
    const email = url.searchParams.get("email") || undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: cfg.stripePriceId, quantity: 1 }],
      success_url: `${cfg.appBaseUrl}/access/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cfg.appBaseUrl}/tools`,
      ...(email ? { customer_email: email } : {}),
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return new Response(JSON.stringify({ error: "Checkout session missing URL" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return Response.redirect(session.url, 303);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Checkout failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
