#!/usr/bin/env node
/**
 * End-to-end user-path probe (no live card payment).
 * Simulates: checkout create → webhook activate → reveal → MCP auth → magic → rotate → manage me
 */
require("dotenv").config({ override: true, quiet: true });

const { createHmac, randomBytes } = require("crypto");
const { Redis } = require("@upstash/redis");
const Stripe = require("stripe");
const { Resend } = require("resend");

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const issues = [];
const notes = [];

function requireEnv(n) {
  const v = process.env[n];
  if (!v) throw new Error(`Missing ${n}`);
  return v.trim();
}

function hashApiKey(plaintext) {
  return createHmac("sha256", requireEnv("AUTH_SECRET")).update(plaintext).digest("hex");
}

function generateApiKey() {
  return "aaf_live_" + randomBytes(24).toString("base64url");
}

function generateToken(n = 24) {
  return randomBytes(n).toString("base64url");
}

async function fetchOk(path, opts = {}) {
  const url = path.startsWith("http") ? path : BASE + path;
  const res = await fetch(url, { redirect: "manual", ...opts });
  return res;
}

async function main() {
  console.log("E2E against", BASE);

  // 1) Static pages
  for (const p of ["/", "/tools", "/manage-access", "/access/success"]) {
    const r = await fetchOk(p);
    if (r.status >= 400) issues.push(`Page ${p} returned ${r.status}`);
    else notes.push(`OK page ${p} → ${r.status}`);
  }

  // 2) Home/tools CTA presence
  const home = await (await fetchOk("/")).text();
  const tools = await (await fetchOk("/tools")).text();
  if (!home.includes("Get MCP Access")) issues.push("Home missing Get MCP Access CTA");
  if (!tools.includes("Get MCP Access")) issues.push("Tools missing Get MCP Access CTA");
  if (!tools.includes("Manage access")) issues.push("Tools missing Manage access link");

  // 3) Checkout redirect (do not pay)
  const checkout = await fetchOk("/api/stripe/checkout");
  const loc = checkout.headers.get("location") || "";
  if (checkout.status !== 303 && checkout.status !== 307 && checkout.status !== 302) {
    const body = await checkout.text();
    issues.push(`Checkout expected redirect, got ${checkout.status}: ${body.slice(0, 200)}`);
  } else if (!loc.includes("checkout.stripe.com")) {
    issues.push(`Checkout redirect not to Stripe: ${loc.slice(0, 120)}`);
  } else {
    notes.push(`OK checkout → Stripe (${checkout.status})`);
  }

  // 4) Simulate purchase activation + reveal (KV path used by webhook)
  const redis = new Redis({
    url: requireEnv("KV_REST_API_URL"),
    token: requireEnv("KV_REST_API_TOKEN"),
  });
  const customerId = `cus_e2e_${Date.now()}`;
  const email = `e2e-${Date.now()}@agenticaf.io`;
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const revealToken = generateToken();
  const sessionId = `cs_e2e_${Date.now()}`;

  await redis.set(`aaf:customer:${customerId}`, {
    email,
    status: "active",
    stripeCustomerId: customerId,
    stripeSubscriptionId: "sub_e2e",
    keyHash,
    callsUsed: 0,
    includedCalls: 1000,
  });
  await redis.set(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`, 0);
  await redis.set(`aaf:key:${keyHash}`, customerId);
  await redis.set(`aaf:email:${email}`, customerId);
  await redis.set(`aaf:reveal:${revealToken}`, { customerId, apiKey, reused: false }, { ex: 3600 });
  await redis.set(`aaf:reveal:session:${sessionId}`, { revealToken, customerId }, { ex: 3600 });

  // Reveal via API
  const reveal = await fetchOk(`/api/access/reveal?token=${encodeURIComponent(revealToken)}`);
  const revealJson = await reveal.json().catch(() => ({}));
  if (reveal.status !== 200 || revealJson.apiKey !== apiKey) {
    issues.push(`Reveal failed: ${reveal.status} ${JSON.stringify(revealJson).slice(0, 200)}`);
  } else {
    notes.push("OK reveal once");
  }
  const reveal2 = await fetchOk(`/api/access/reveal?token=${encodeURIComponent(revealToken)}`);
  if (reveal2.status === 200) issues.push("Reveal token reusable (should be one-time)");
  else notes.push(`OK reveal second call → ${reveal2.status}`);

  // Session-id reveal path
  const revealToken2 = generateToken();
  const apiKey2 = generateApiKey();
  const keyHash2 = hashApiKey(apiKey2);
  // rotate customer key for second path test — keep same customer
  await redis.del(`aaf:key:${keyHash}`);
  await redis.set(`aaf:key:${keyHash2}`, customerId);
  await redis.set(`aaf:customer:${customerId}`, {
    email,
    status: "active",
    stripeCustomerId: customerId,
    keyHash: keyHash2,
    callsUsed: 0,
    includedCalls: 1000,
  });
  await redis.set(`aaf:reveal:${revealToken2}`, { customerId, apiKey: apiKey2, reused: false }, { ex: 3600 });
  await redis.set(`aaf:reveal:session:${sessionId}`, { revealToken: revealToken2, customerId }, { ex: 3600 });
  const revealS = await fetchOk(`/api/access/reveal?session_id=${encodeURIComponent(sessionId)}`);
  const revealSJson = await revealS.json().catch(() => ({}));
  if (revealS.status !== 200 || !revealSJson.apiKey) {
    issues.push(`Session reveal failed: ${revealS.status} ${JSON.stringify(revealSJson).slice(0, 200)}`);
  } else notes.push("OK session_id reveal");

  // 5) MCP gate
  const noAuth = await fetchOk("/api/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  // With MCP_AUTH_REQUIRED on vercel env — expect 401
  if (String(process.env.MCP_AUTH_REQUIRED).toLowerCase() === "true") {
    if (noAuth.status !== 401) {
      issues.push(`MCP without key expected 401, got ${noAuth.status}`);
    } else notes.push("OK MCP 401 without key");
  }

  const withAuth = await fetchOk("/api/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey2}`,
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "e2e", version: "0" } } }),
  });
  if (withAuth.status === 401 || withAuth.status === 429) {
    issues.push(`MCP with valid key got ${withAuth.status}`);
  } else {
    notes.push(`OK MCP with key → ${withAuth.status}`);
  }

  // 6) Magic link request
  const magic = await fetchOk("/api/auth/request-link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const magicJson = await magic.json().catch(() => ({}));
  if (magic.status !== 200) {
    issues.push(`Magic request failed: ${magic.status} ${JSON.stringify(magicJson).slice(0, 200)}`);
  } else notes.push("OK magic request-link");

  // 7) Unknown email should still 200 (no enumeration) 
  const magicUnknown = await fetchOk("/api/auth/request-link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: `nobody-${Date.now()}@example.com` }),
  });
  if (magicUnknown.status !== 200) {
    issues.push(`Unknown email magic should soft-succeed, got ${magicUnknown.status}`);
  } else notes.push("OK magic unknown email soft success");

  // Cleanup
  await redis.del(`aaf:customer:${customerId}`);
  await redis.del(`aaf:customer:${customerId}:calls:${new Date().toISOString().slice(0, 7)}`);
  await redis.del(`aaf:email:${email}`);
  await redis.del(`aaf:key:${keyHash2}`);

  console.log("\n=== NOTES ===");
  for (const n of notes) console.log("-", n);
  console.log("\n=== ISSUES ===");
  if (!issues.length) console.log("(none)");
  for (const i of issues) console.log("-", i);
  process.exit(issues.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
