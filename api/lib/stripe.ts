/**
 * Stripe SDK helper (test or live depending on STRIPE_SECRET_KEY).
 */
import Stripe from "stripe";
import { getBillingConfig } from "./config";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const { stripeSecretKey } = getBillingConfig();
  cached = new Stripe(stripeSecretKey);
  return cached;
}

export async function retrieveConfiguredPrice() {
  const stripe = getStripe();
  const { stripePriceId } = getBillingConfig();
  return stripe.prices.retrieve(stripePriceId);
}
