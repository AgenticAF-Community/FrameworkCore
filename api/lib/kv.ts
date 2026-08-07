/**
 * Upstash Redis (Vercel KV REST) client.
 */
import { Redis } from "@upstash/redis";
import { getBillingConfig } from "./config";

let cached: Redis | null = null;

export function getKv(): Redis {
  if (cached) return cached;
  const cfg = getBillingConfig();
  cached = new Redis({
    url: cfg.kvRestApiUrl,
    token: cfg.kvRestApiToken,
  });
  return cached;
}

export const KV_PREFIX = {
  customer: "aaf:customer:",
  keyHash: "aaf:key:",
  email: "aaf:email:",
  magic: "aaf:magic:",
  reveal: "aaf:reveal:",
  session: "aaf:session:",
} as const;
