#!/usr/bin/env node
/**
 * Phase 0 infra check: Stripe price, KV round-trip, AUTH/Resend domain, deps.
 * Usage: node tools/scripts/verify-billing-infra.js
 */
require("dotenv").config({ override: true });

const Stripe = require("stripe");
const { Redis } = require("@upstash/redis");

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log("OK:", msg);
}

async function main() {
  // Deps
  for (const name of ["stripe", "@upstash/redis", "resend", "dotenv"]) {
    try {
      require.resolve(name);
      ok(`dep ${name}`);
    } catch {
      fail(`missing dep ${name}`);
    }
  }

  const auth = process.env.AUTH_SECRET || "";
  if (auth.length < 16) fail("AUTH_SECRET missing or too short");
  else ok("AUTH_SECRET present");

  const from = process.env.RESEND_FROM_EMAIL || "";
  if (!from.endsWith("@agenticaf.io")) fail("RESEND_FROM_EMAIL must end with @agenticaf.io");
  else ok(`RESEND_FROM_EMAIL=${from}`);

  if (!process.env.RESEND_API_KEY) fail("RESEND_API_KEY missing");
  else ok("RESEND_API_KEY present");

  if (!process.env.APP_BASE_URL || !process.env.APP_BASE_URL.startsWith("http")) {
    fail("APP_BASE_URL missing or invalid");
  } else ok(`APP_BASE_URL=${process.env.APP_BASE_URL}`);

  // Stripe
  try {
    const sk = process.env.STRIPE_SECRET_KEY || "";
    if (!sk.startsWith("sk_test_") && !sk.startsWith("sk_live_")) {
      fail("STRIPE_SECRET_KEY missing or not a Stripe secret key");
    } else {
      const stripe = new Stripe(sk);
      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId) fail("STRIPE_PRICE_ID missing");
      else {
        const price = await stripe.prices.retrieve(priceId);
        ok(
          `Stripe price ${price.id} ${price.currency} ${(price.unit_amount || 0) / 100} active=${price.active}`
        );
      }
    }
  } catch (e) {
    fail(`Stripe: ${e.message}`);
  }

  // KV
  try {
    const url = process.env.KV_REST_API_URL || "";
    const token = process.env.KV_REST_API_TOKEN || "";
    if (!url.startsWith("https://")) fail("KV_REST_API_URL must start with https://");
    else if (!token) fail("KV_REST_API_TOKEN missing");
    else {
      const redis = new Redis({ url, token });
      const k = `aaf:verify:${Date.now()}`;
      await redis.set(k, "ok", { ex: 60 });
      const v = await redis.get(k);
      await redis.del(k);
      if (v !== "ok") fail(`KV round-trip unexpected value: ${JSON.stringify(v)}`);
      else ok("KV set/get/del round-trip");
    }
  } catch (e) {
    fail(`KV: ${e.message}`);
  }

  if (process.exitCode) {
    console.error("\nverify-billing-infra: FAILED");
    process.exit(1);
  }
  console.log("\nverify-billing-infra: PASSED");
}

main();
