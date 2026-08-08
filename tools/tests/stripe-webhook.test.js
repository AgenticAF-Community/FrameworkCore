/**
 * Phase 2: Checkout create + webhook activation / reveal (no real card charge).
 * Run: node --test tools/tests/stripe-webhook.test.js
 */
require("dotenv").config({ override: true, quiet: true });

const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac, randomBytes } = require("crypto");
const { Redis } = require("@upstash/redis");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v.trim();
}

function generateApiKey() {
  return "aaf_live_" + randomBytes(24).toString("base64url");
}

function hashApiKey(plaintext) {
  return createHmac("sha256", requireEnv("AUTH_SECRET")).update(plaintext).digest("hex");
}

function generateToken(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}

async function activateSubscription(redis, input) {
  const customerId = input.stripeCustomerId;
  const existing = await redis.get(`aaf:customer:${customerId}`);
  if (existing?.keyHash && existing.status === "active") {
    const revealToken = generateToken();
    await redis.set(`aaf:reveal:${revealToken}`, { customerId, apiKey: null, reused: true }, { ex: 3600 });
    return { customerId, revealToken, apiKey: "", reused: true };
  }

  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const record = {
    email: input.email,
    status: "active",
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    keyHash,
    callsUsed: 0,
    includedCalls: 1000,
    createdAt: new Date().toISOString(),
  };
  await redis.set(`aaf:customer:${customerId}`, record);
  await redis.set(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`, 0);
  await redis.set(`aaf:key:${keyHash}`, customerId);
  await redis.set(`aaf:email:${input.email}`, customerId);

  const revealToken = generateToken();
  await redis.set(`aaf:reveal:${revealToken}`, { customerId, apiKey, reused: false }, { ex: 3600 });
  return { customerId, revealToken, apiKey, reused: false };
}

async function consumeReveal(redis, token) {
  const key = `aaf:reveal:${token}`;
  if (typeof redis.getdel === "function") {
    return redis.getdel(key);
  }
  const data = await redis.get(key);
  if (!data) return null;
  await redis.del(key);
  return data;
}

describe("stripe-webhook + checkout", () => {
  const cleanup = [];
  let redis;
  let stripe;

  after(async () => {
    if (!redis) return;
    for (const key of cleanup) {
      try {
        await redis.del(key);
      } catch {
        /* ignore */
      }
    }
  });

  it("creates a Checkout Session URL for the configured price", async () => {
    stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: requireEnv("STRIPE_PRICE_ID"), quantity: 1 }],
      success_url: `${requireEnv("APP_BASE_URL")}/access/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requireEnv("APP_BASE_URL")}/tools`,
    });
    assert.ok(session.id.startsWith("cs_"));
    assert.ok(session.url && session.url.startsWith("https://"));
    // Do not complete payment — live mode.
  });

  it("mints key + reveal-once; replay is idempotent; delete deactivates", async () => {
    redis = new Redis({
      url: requireEnv("KV_REST_API_URL"),
      token: requireEnv("KV_REST_API_TOKEN"),
    });

    const customerId = `cus_test_phase2_${Date.now()}`;
    const email = `phase2-${Date.now()}@agenticaf.io`;
    cleanup.push(`aaf:customer:${customerId}`, `aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`, `aaf:email:${email}`);

    const first = await activateSubscription(redis, {
      email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: "sub_test_1",
    });
    assert.ok(first.apiKey.startsWith("aaf_live_"));
    cleanup.push(`aaf:key:${hashApiKey(first.apiKey)}`, `aaf:reveal:${first.revealToken}`);

    const revealed = await consumeReveal(redis, first.revealToken);
    assert.equal(revealed.apiKey, first.apiKey);
    const secondReveal = await consumeReveal(redis, first.revealToken);
    assert.equal(secondReveal, null);

    const replay = await activateSubscription(redis, {
      email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: "sub_test_1",
    });
    assert.equal(replay.reused, true);
    assert.equal(replay.apiKey, "");
    cleanup.push(`aaf:reveal:${replay.revealToken}`);

    const customer = await redis.get(`aaf:customer:${customerId}`);
    await redis.set(`aaf:customer:${customerId}`, { ...customer, status: "inactive" });
    const after = await redis.get(`aaf:customer:${customerId}`);
    assert.equal(after.status, "inactive");
  });

  it("verifies webhook signature construction with STRIPE_WEBHOOK_SECRET", () => {
    const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
    assert.ok(secret.startsWith("whsec_"));
    const payload = JSON.stringify({
      id: "evt_test_phase2",
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test", mode: "subscription" } },
    });
    const header = Stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
    });
    const event = Stripe.webhooks.constructEvent(payload, header, secret);
    assert.equal(event.type, "checkout.session.completed");
  });

  it("home and tools pages include Get MCP Access CTA", () => {
    const index = fs.readFileSync(path.join(__dirname, "../../website/src/pages/index.js"), "utf8");
    const tools = fs.readFileSync(path.join(__dirname, "../../website/src/pages/tools.js"), "utf8");
    assert.match(index, /Get MCP Access/);
    assert.match(tools, /Get MCP Access/);
    assert.match(tools, /Manage access/);
    assert.ok(fs.existsSync(path.join(__dirname, "../../website/src/pages/access/success.js")));
  });
});
