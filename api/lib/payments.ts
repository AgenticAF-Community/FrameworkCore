/**
 * Stripe Checkout payment gating helpers.
 */
export type CheckoutSessionLike = {
  mode?: string | null;
  status?: string | null;
  payment_status?: string | null;
  customer?: string | null;
  subscription?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
};

const PAID_STATUSES = new Set(["paid", "no_payment_required"]);

/** True when Checkout completed and payment is settled (or not required). */
export function isPaidCheckoutSession(session: CheckoutSessionLike): boolean {
  if (session.mode !== "subscription") return false;
  if (session.status !== "complete") return false;
  return PAID_STATUSES.has(String(session.payment_status || ""));
}

export function checkoutEmail(session: CheckoutSessionLike): string {
  return String(
    session.customer_details?.email || session.customer_email || ""
  )
    .trim()
    .toLowerCase();
}
