/**
 * Shared security pattern constants used by both the CLI checks and MCP tool.
 * Single source of truth — edit here, both consumers stay in sync.
 */

export const SECRET_PATTERNS = [
  { re: /AKIA[0-9A-Z]{16}/g, label: "AWS Access Key" },
  { re: /\bsk-[a-zA-Z0-9]{20,}/g, label: "OpenAI-style API key" },
  { re: /\bsk_live_[a-zA-Z0-9]+/g, label: "Stripe live key" },
  { re: /ghp_[a-zA-Z0-9]{36}/g, label: "GitHub personal access token" },
  { re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, label: "Private key" },
  { re: /password\s*[:=]\s*["'][^"']{4,}/gi, label: "Hardcoded password" },
  { re: /secret\s*[:=]\s*["'][^"']{4,}/gi, label: "Hardcoded secret" },
];

export const INJECTION_PATTERNS = [
  { re: /\bexec\s*\(/g, label: "exec() call" },
  { re: /\bexecSync\s*\(/g, label: "execSync() call" },
  { re: /child_process/g, label: "child_process import" },
  { re: /\beval\s*\(/g, label: "eval() call" },
  { re: /subprocess\.run|os\.system|os\.popen/g, label: "Shell execution (Python)" },
];

export const BROAD_PERMISSION_PATTERNS = [
  { re: /["'](\*|admin|root|superuser)["']/g, label: "Wildcard or admin permission" },
  { re: /permissions?\s*[:=]\s*\[?\s*["']\*["']/gi, label: "Wildcard permission grant" },
  { re: /full_access|FullAccess/g, label: "Full access grant" },
];

export const POSITIVE_PATTERNS = {
  vault: ["vault", "secret manager", "getsecret", "keyvault"],
  gateway: ["gateway", "tool_gateway", "toolgateway", "epistemic gate", "policy gate"],
  injectionMitigation: ["instruction hierarchy", "system prompt", "data boundary", "content label", "role: system"],
  verification: ["verify", "definition of done", "evidence", "assert", "check"],
  rateLimit: ["rate limit", "throttle", "ratelimit", "rate-limit", "quota"],
  budget: ["budget", "max_steps", "max_tokens", "max_tool", "step_limit"],
  fallback: ["fallback", "graceful degrad", "failover", "circuit breaker"],
};
