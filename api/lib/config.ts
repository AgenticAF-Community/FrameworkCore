/**
 * Billing/auth env config — fail closed when required vars are missing.
 */

export type BillingConfig = {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripePriceId: string;
  stripeWebhookSecret: string;
  stripeCustomerPortalUrl: string;
  kvRestApiUrl: string;
  kvRestApiToken: string;
  authSecret: string;
  appBaseUrl: string;
  resendApiKey: string;
  resendFromEmail: string;
  mcpAuthRequired: boolean;
  includedCallsPerMonth: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return String(v).trim();
}

function optionalEnv(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : fallback;
}

export function getBillingConfig(): BillingConfig {
  const resendFromEmail = requireEnv("RESEND_FROM_EMAIL");
  if (!resendFromEmail.endsWith("@agenticaf.io")) {
    throw new Error("RESEND_FROM_EMAIL must be an @agenticaf.io address");
  }

  const authSecret = requireEnv("AUTH_SECRET");
  if (authSecret.length < 16) {
    throw new Error("AUTH_SECRET must be at least 16 characters");
  }

  const kvRestApiUrl = requireEnv("KV_REST_API_URL");
  if (!kvRestApiUrl.startsWith("https://")) {
    throw new Error("KV_REST_API_URL must start with https://");
  }

  const mcpAuthRequired =
    String(process.env.MCP_AUTH_REQUIRED || "").toLowerCase() === "true";

  return {
    stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
    stripePublishableKey: optionalEnv("STRIPE_PUBLISHABLE_KEY"),
    stripePriceId: requireEnv("STRIPE_PRICE_ID"),
    stripeWebhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
    stripeCustomerPortalUrl: optionalEnv("STRIPE_CUSTOMER_PORTAL_URL"),
    kvRestApiUrl,
    kvRestApiToken: requireEnv("KV_REST_API_TOKEN"),
    authSecret,
    appBaseUrl: requireEnv("APP_BASE_URL").replace(/\/$/, ""),
    resendApiKey: requireEnv("RESEND_API_KEY"),
    resendFromEmail,
    mcpAuthRequired,
    includedCallsPerMonth: 1000,
  };
}
