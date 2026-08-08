/**
 * GET/POST /api/stripe/checkout — start £3/mo MCP subscription Checkout.
 * Sets an HttpOnly bind cookie tied to the Checkout session so only that
 * browser can later redeem /api/access/reveal?session_id=…
 */
import {
  checkoutBindCookieHeader,
  storeCheckoutBindSecret,
} from "../lib/access";
import { getBillingConfig } from "../lib/config";
import { generateToken } from "../lib/keys";
import { getStripe } from "../lib/stripe";
import { resolveAppBaseUrl } from "../lib/urls";

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
    const appBase = resolveAppBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: cfg.stripePriceId, quantity: 1 }],
      success_url: `${appBase}/access/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBase}/tools`,
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

    const bindSecret = generateToken(24);
    await storeCheckoutBindSecret(session.id, bindSecret);

    const secure = appBase.startsWith("https://");
    return new Response(null, {
      status: 303,
      headers: {
        Location: session.url,
        "Set-Cookie": checkoutBindCookieHeader(bindSecret, secure),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Checkout failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
