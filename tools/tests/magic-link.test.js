/**
 * Phase 3: magic link KV path + rotate + manage-access page.
 * Run: node --test tools/tests/magic-link.test.js
 */
require("dotenv").config({ override: true, quiet: true });

const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac, randomBytes } = require("crypto");
const { Redis } = require("@upstash/redis");
const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");
const { skipWithoutEnv } = require("./helpers/env.js");

const REQUIRED_ENV = [
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "AUTH_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];

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

function generateToken(n = 32) {
  return randomBytes(n).toString("base64url");
}

describe("magic-link", skipWithoutEnv(REQUIRED_ENV), () => {
  const cleanup = [];
  let redis;
  let customerId;
  let email;
  let keyHash;

  after(async () => {
    if (!redis) return;
    for (const k of cleanup) {
      try {
        await redis.del(k);
      } catch {
        /* ignore */
      }
    }
  });

  it("creates and consumes a magic token from KV", async () => {
    redis = new Redis({
      url: requireEnv("KV_REST_API_URL"),
      token: requireEnv("KV_REST_API_TOKEN"),
    });

    email = `magic-test-${Date.now()}@agenticaf.io`;
    customerId = `cus_magic_${Date.now()}`;
    const apiKey = generateApiKey();
    keyHash = hashApiKey(apiKey);

    await redis.set(`aaf:customer:${customerId}`, {
      email,
      status: "active",
      stripeCustomerId: customerId,
      keyHash,
      callsUsed: 3,
      includedCalls: 1000,
    });
    await redis.set(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`, 3);
    await redis.set(`aaf:key:${keyHash}`, customerId);
    await redis.set(`aaf:email:${email}`, customerId);
    cleanup.push(
      `aaf:customer:${customerId}`,
      `aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`,
      `aaf:key:${keyHash}`,
      `aaf:email:${email}`
    );

    const token = generateToken();
    await redis.set(`aaf:magic:${token}`, { email, customerId }, { ex: 900 });
    cleanup.push(`aaf:magic:${token}`);

    const data = await redis.get(`aaf:magic:${token}`);
    assert.equal(data.customerId, customerId);
    await redis.del(`aaf:magic:${token}`);
    assert.equal(await redis.get(`aaf:magic:${token}`), null);
  });

  it("rotates API key and issues one-time reveal", async () => {
    const oldHash = keyHash;
    const newKey = generateApiKey();
    const newHash = hashApiKey(newKey);
    const customer = await redis.get(`aaf:customer:${customerId}`);
    await redis.del(`aaf:key:${oldHash}`);
    await redis.set(`aaf:customer:${customerId}`, { ...customer, keyHash: newHash });
    await redis.set(`aaf:key:${newHash}`, customerId);
    cleanup.push(`aaf:key:${newHash}`);

    const revealToken = generateToken(24);
    await redis.set(
      `aaf:reveal:${revealToken}`,
      { customerId, apiKey: newKey, reused: false },
      { ex: 3600 }
    );
    const revealed = await redis.get(`aaf:reveal:${revealToken}`);
    assert.equal(revealed.apiKey, newKey);
    await redis.del(`aaf:reveal:${revealToken}`);
    assert.equal(await redis.get(`aaf:reveal:${revealToken}`), null);

    // Old key hash must not resolve
    assert.equal(await redis.get(`aaf:key:${oldHash}`), null);
  });

  it("Resend client accepts API key (send smoke optional)", async () => {
    const resend = new Resend(requireEnv("RESEND_API_KEY"));
    assert.ok(resend);
    const from = requireEnv("RESEND_FROM_EMAIL");
    assert.ok(from.endsWith("@agenticaf.io"));

    // Subject locked in source
    const src = fs.readFileSync(
      path.join(__dirname, "../../api/auth/request-link.ts"),
      "utf8"
    );
    assert.match(src, /AAF MAGIC LINK FOR SIGN IN/);

    // Optional live send — skipped unless MAGIC_LINK_SEND_TEST=1
    if (process.env.MAGIC_LINK_SEND_TEST === "1") {
      const result = await resend.emails.send({
        from: `AAF <${from}>`,
        to: email,
        subject: "AAF MAGIC LINK FOR SIGN IN",
        text: "Phase 3 automated test — ignore.",
      });
      assert.equal(result.error, undefined);
    }
  });

  it("manage-access page exists and tools links to it", () => {
    const manage = path.join(__dirname, "../../website/src/pages/manage-access.js");
    assert.ok(fs.existsSync(manage));
    const tools = fs.readFileSync(
      path.join(__dirname, "../../website/src/pages/tools.js"),
      "utf8"
    );
    assert.match(tools, /Manage access/);
    assert.match(tools, /\/manage-access/);
  });
});
