#!/usr/bin/env node
/**
 * Seed a test MCP customer + API key in KV.
 * Prints plaintext key once to stdout (not committed).
 *
 * Usage: node tools/scripts/seed-test-mcp-key.js
 */
require("dotenv").config({ override: true, quiet: true });

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

async function main() {
  const redis = new Redis({
    url: requireEnv("KV_REST_API_URL"),
    token: requireEnv("KV_REST_API_TOKEN"),
  });

  const plaintext = generateApiKey();
  const keyHash = hashApiKey(plaintext);
  const customerId = `test:${Date.now()}`;
  const customer = {
    email: "test-mcp@agenticaf.io",
    status: "active",
    stripeCustomerId: "cus_test_seed",
    keyHash,
    callsUsed: 0,
    includedCalls: 1000,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`aaf:customer:${customerId}`, customer);
  await redis.set(`aaf:customer:${customerId}:calls`, 0);
  await redis.set(`aaf:key:${keyHash}`, customerId);
  await redis.set(`aaf:email:${customer.email}`, customerId);

  console.log(
    JSON.stringify(
      {
        customerId,
        email: customer.email,
        apiKey: plaintext,
        note: "Store this key now; plaintext is not in KV",
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
