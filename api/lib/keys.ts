/**
 * MCP API key generation + hashing (HMAC-SHA256 with AUTH_SECRET).
 * Plaintext keys are never stored — only hashes go in KV.
 */
import { createHmac, randomBytes } from "crypto";
import { getBillingConfig } from "./config";

const KEY_PREFIX = "aaf_live_";

export function generateApiKey(): string {
  return KEY_PREFIX + randomBytes(24).toString("base64url");
}

export function hashApiKey(plaintext: string): string {
  const { authSecret } = getBillingConfig();
  return createHmac("sha256", authSecret).update(plaintext).digest("hex");
}

export function isApiKeyFormat(value: string): boolean {
  return typeof value === "string" && value.startsWith(KEY_PREFIX) && value.length > KEY_PREFIX.length + 16;
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
