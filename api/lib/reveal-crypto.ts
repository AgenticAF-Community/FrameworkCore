/**
 * Encrypt plaintext API keys for short-lived reveal records in KV.
 * Uses AES-256-GCM with a key derived from AUTH_SECRET.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getBillingConfig } from "./config";

function derivedKey(): Buffer {
  const { authSecret } = getBillingConfig();
  return createHash("sha256").update(`aaf-reveal-v1:${authSecret}`).digest();
}

export type EncryptedReveal = {
  v: 1;
  iv: string;
  tag: string;
  ct: string;
};

export function encryptApiKey(plaintext: string): EncryptedReveal {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derivedKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    ct: ct.toString("base64url"),
  };
}

export function decryptApiKey(payload: EncryptedReveal): string {
  if (payload?.v !== 1 || !payload.iv || !payload.tag || !payload.ct) {
    throw new Error("Invalid encrypted reveal payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    derivedKey(),
    Buffer.from(payload.iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));
  const pt = Buffer.concat([
    decipher.update(Buffer.from(payload.ct, "base64url")),
    decipher.final(),
  ]);
  return pt.toString("utf8");
}
