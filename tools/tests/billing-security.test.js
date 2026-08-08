/**
 * Billing security helpers: payment gating, reveal encrypt, atomic consume patterns.
 * Run: node --test tools/tests/billing-security.test.js
 */
require("dotenv").config({ override: true, quiet: true });

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createCipheriv, createDecipheriv, createHash, randomBytes } = require("crypto");

function isPaidCheckoutSession(session) {
  if (session.mode !== "subscription") return false;
  if (session.status !== "complete") return false;
  return ["paid", "no_payment_required"].includes(String(session.payment_status || ""));
}

function derivedKey(authSecret) {
  return createHash("sha256").update(`aaf-reveal-v1:${authSecret}`).digest();
}

function encryptApiKey(plaintext, authSecret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derivedKey(authSecret), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    ct: ct.toString("base64url"),
  };
}

function decryptApiKey(payload, authSecret) {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    derivedKey(authSecret),
    Buffer.from(payload.iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ct, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

describe("payment gating", () => {
  it("rejects complete but unpaid sessions", () => {
    assert.equal(
      isPaidCheckoutSession({
        mode: "subscription",
        status: "complete",
        payment_status: "unpaid",
      }),
      false
    );
  });

  it("accepts complete + paid", () => {
    assert.equal(
      isPaidCheckoutSession({
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
      }),
      true
    );
  });

  it("accepts complete + no_payment_required", () => {
    assert.equal(
      isPaidCheckoutSession({
        mode: "subscription",
        status: "complete",
        payment_status: "no_payment_required",
      }),
      true
    );
  });

  it("rejects open sessions even if payment_status paid", () => {
    assert.equal(
      isPaidCheckoutSession({
        mode: "subscription",
        status: "open",
        payment_status: "paid",
      }),
      false
    );
  });
});

describe("reveal encryption", () => {
  it("round-trips API keys", () => {
    const secret = "test-auth-secret-32chars-minimum!!";
    const key = "aaf_live_" + randomBytes(24).toString("base64url");
    const enc = encryptApiKey(key, secret);
    assert.equal(enc.v, 1);
    assert.ok(enc.ct);
    assert.equal(decryptApiKey(enc, secret), key);
  });

  it("fails closed on tampered ciphertext", () => {
    const secret = "test-auth-secret-32chars-minimum!!";
    const enc = encryptApiKey("aaf_live_abc", secret);
    enc.ct = Buffer.from("tampered").toString("base64url");
    assert.throws(() => decryptApiKey(enc, secret));
  });
});

describe("rotate response shape", () => {
  it("rotate-key source does not return revealToken in JSON", () => {
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.join(__dirname, "../../api/auth/rotate-key.ts"),
      "utf8"
    );
    assert.match(src, /revealUrl:/);
    // Must not include revealToken as a JSON response field
    assert.doesNotMatch(src, /return json\(\{[\s\S]*revealToken\s*:/);
    assert.match(src, /encodeURIComponent\(revealToken\)/);
  });

  it("reveal response does not include customerId", () => {
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.join(__dirname, "../../api/access/reveal.ts"),
      "utf8"
    );
    assert.match(src, /apiKey: revealed\.apiKey/);
    assert.doesNotMatch(src, /customerId:\s*revealed\.customerId/);
  });

  it("checkout sets bind cookie and webhook requires paid status", () => {
    const fs = require("fs");
    const path = require("path");
    const checkout = fs.readFileSync(
      path.join(__dirname, "../../api/stripe/checkout.ts"),
      "utf8"
    );
    const webhook = fs.readFileSync(
      path.join(__dirname, "../../api/stripe/webhook.ts"),
      "utf8"
    );
    const reveal = fs.readFileSync(
      path.join(__dirname, "../../api/access/reveal.ts"),
      "utf8"
    );
    assert.match(checkout, /aaf_cs_bind|CHECKOUT_BIND_COOKIE|checkoutBindCookieHeader/);
    assert.match(webhook, /isPaidCheckoutSession/);
    assert.match(reveal, /verifyCheckoutBindSecret/);
    assert.match(reveal, /isPaidCheckoutSession/);
  });
});
