/**
 * Phase 1: MCP auth + quota tests (real KV).
 * Run: MCP_AUTH_REQUIRED=true node --test tools/tests/mcp-auth.test.js
 */
require("dotenv").config({ override: true, quiet: true });

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac, randomBytes } = require("crypto");
const { Redis } = require("@upstash/redis");

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

function isApiKeyFormat(value) {
  return typeof value === "string" && value.startsWith("aaf_live_") && value.length > 20;
}

async function authenticateMcpRequest(req, redis) {
  const required = String(process.env.MCP_AUTH_REQUIRED || "").toLowerCase() === "true";
  if (!required) return { ok: true, bypass: true };

  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  const token = m ? m[1].trim() : null;
  if (!token || !isApiKeyFormat(token)) {
    return { ok: false, status: 401, error: "Missing or invalid API key" };
  }

  const keyHash = hashApiKey(token);
  const customerId = await redis.get(`aaf:key:${keyHash}`);
  if (!customerId) return { ok: false, status: 401, error: "Invalid API key" };

  const customer = await redis.get(`aaf:customer:${customerId}`);
  if (!customer || customer.status !== "active") {
    return { ok: false, status: 401, error: "Subscription inactive" };
  }

  const included = customer.includedCalls || 1000;
  const period = new Date().toISOString().slice(0, 7);
  const counterKey = `aaf:customer:${customerId}:calls:${period}`;
  const usedBefore = Number((await redis.get(counterKey)) ?? 0);
  if (usedBefore >= included) {
    return { ok: false, status: 429, error: "Monthly request limit reached (1000)" };
  }

  const nextUsed = await redis.incr(counterKey);
  await redis.set(`aaf:customer:${customerId}`, { ...customer, callsUsed: nextUsed, includedCalls: included });

  if (nextUsed > included) {
    return { ok: false, status: 429, error: "Monthly request limit reached (1000)" };
  }

  return { ok: true, customerId, callsUsed: nextUsed };
}

describe("mcp-auth", () => {
  /** @type {import('@upstash/redis').Redis} */
  let redis;
  let customerId;
  let apiKey;
  let keyHash;

  before(async () => {
    process.env.MCP_AUTH_REQUIRED = "true";
    redis = new Redis({
      url: requireEnv("KV_REST_API_URL"),
      token: requireEnv("KV_REST_API_TOKEN"),
    });
    apiKey = generateApiKey();
    keyHash = hashApiKey(apiKey);
    customerId = `test:mcp-auth:${Date.now()}`;
    await redis.set(`aaf:customer:${customerId}`, {
      email: "mcp-auth-test@agenticaf.io",
      status: "active",
      stripeCustomerId: "cus_test",
      keyHash,
      callsUsed: 0,
      includedCalls: 1000,
    });
    await redis.set(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`, 0);
    await redis.set(`aaf:key:${keyHash}`, customerId);
  });

  after(async () => {
    if (!redis || !customerId) return;
    await redis.del(`aaf:customer:${customerId}`);
    await redis.del(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`);
    await redis.del(`aaf:key:${keyHash}`);
  });

  it("returns 401 with no bearer", async () => {
    const req = new Request("https://example.com/api/mcp");
    const r = await authenticateMcpRequest(req, redis);
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
  });

  it("returns 401 with bad key", async () => {
    const req = new Request("https://example.com/api/mcp", {
      headers: { Authorization: "Bearer aaf_live_notarealkey0123456789abcd" },
    });
    const r = await authenticateMcpRequest(req, redis);
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
  });

  it("allows seeded key and increments counter", async () => {
    const req = new Request("https://example.com/api/mcp", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const r1 = await authenticateMcpRequest(req, redis);
    assert.equal(r1.ok, true);
    assert.equal(r1.callsUsed, 1);
    const r2 = await authenticateMcpRequest(req, redis);
    assert.equal(r2.ok, true);
    assert.equal(r2.callsUsed, 2);
  });

  it("returns 429 when callsUsed is at cap", async () => {
    const period = new Date().toISOString().slice(0, 7);
    await redis.set(`aaf:customer:${customerId}:calls:${period}`, 1000);
    const customer = await redis.get(`aaf:customer:${customerId}`);
    await redis.set(`aaf:customer:${customerId}`, { ...customer, callsUsed: 1000 });
    const req = new Request("https://example.com/api/mcp", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const r = await authenticateMcpRequest(req, redis);
    assert.equal(r.ok, false);
    assert.equal(r.status, 429);
  });

  it("returns 401 when subscription inactive", async () => {
    const period = new Date().toISOString().slice(0, 7);
    await redis.set(`aaf:customer:${customerId}:calls:${period}`, 0);
    const customer = await redis.get(`aaf:customer:${customerId}`);
    await redis.set(`aaf:customer:${customerId}`, { ...customer, status: "inactive", callsUsed: 0 });
    const req = new Request("https://example.com/api/mcp", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const r = await authenticateMcpRequest(req, redis);
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
  });
});
