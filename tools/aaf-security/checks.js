/**
 * Security checks organised by CIA triad dimension.
 * Each check scans file content and paths, returning findings with
 * severity, CIA dimension, location, evidence, and an actionable recommendation.
 */

const SECRET_PATTERNS = [
  { re: /AKIA[0-9A-Z]{16}/g, label: "AWS Access Key" },
  { re: /\bsk-[a-zA-Z0-9]{20,}/g, label: "OpenAI-style API key" },
  { re: /\bsk_live_[a-zA-Z0-9]+/g, label: "Stripe live key" },
  { re: /ghp_[a-zA-Z0-9]{36}/g, label: "GitHub personal access token" },
  { re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, label: "Private key" },
  { re: /password\s*[:=]\s*["'][^"']{4,}/gi, label: "Hardcoded password" },
  { re: /secret\s*[:=]\s*["'][^"']{4,}/gi, label: "Hardcoded secret" },
];

const INJECTION_PATTERNS = [
  { re: /\bexec\s*\(/g, label: "exec() call" },
  { re: /\bexecSync\s*\(/g, label: "execSync() call" },
  { re: /child_process/g, label: "child_process import" },
  { re: /\beval\s*\(/g, label: "eval() call" },
  { re: /subprocess\.run|os\.system|os\.popen/g, label: "Shell execution (Python)" },
];

const BROAD_PERMISSION_PATTERNS = [
  { re: /["'](\*|admin|root|superuser)["']/g, label: "Wildcard or admin permission" },
  { re: /permissions?\s*[:=]\s*\[?\s*["']\*["']/gi, label: "Wildcard permission grant" },
  { re: /full_access|FullAccess/g, label: "Full access grant" },
];

function findLineNumber(text, index) {
  return text.substring(0, index).split("\n").length;
}

function scanContent(contentEntries, patterns, label, severity, cia, recommendation) {
  const findings = [];
  for (const [filePath, text] of contentEntries) {
    for (const { re, label: patternLabel } of patterns) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(text)) !== null) {
        const line = findLineNumber(text, match.index);
        findings.push({
          severity,
          cia_dimension: cia,
          check: label,
          location: `${filePath}:${line}`,
          evidence: patternLabel,
          recommendation,
        });
      }
    }
  }
  return findings;
}

function checkAbsence(contentEntries, paths, positivePatterns, positivePathPatterns) {
  for (const [, text] of contentEntries) {
    const lower = text.toLowerCase();
    for (const p of positivePatterns) {
      if (lower.includes(p.toLowerCase())) return true;
    }
  }
  if (positivePathPatterns) {
    const lowerPaths = paths.map((p) => p.toLowerCase());
    for (const pattern of positivePathPatterns) {
      if (lowerPaths.some((p) => new RegExp(pattern, "i").test(p))) return true;
    }
  }
  return false;
}

/**
 * Run all security checks against scanned content.
 * @param {{ paths: string[], content: Map<string,string> }} scanResult
 * @returns {{ findings: object[], summary: object }}
 */
export function runSecurityChecks(scanResult) {
  const { paths, content } = scanResult;
  const entries = [...content.entries()];
  const findings = [];

  // --- CONFIDENTIALITY ---

  findings.push(...scanContent(
    entries, SECRET_PATTERNS,
    "Hardcoded secrets",
    "critical", "confidentiality",
    "Move this secret to a vault or environment variable. Never store secrets in source code. See AAF Security Pillar 5.5: Secrets Management."
  ));

  if (!checkAbsence(entries, paths, ["vault", "secret manager", "getsecret", "keyvault"], ["vault", "secret"])) {
    findings.push({
      severity: "high", cia_dimension: "confidentiality",
      check: "No vault or secrets manager detected",
      location: "(project-wide)",
      evidence: "No references to vault, secret manager, or getSecret patterns",
      recommendation: "Introduce a secrets manager (e.g. HashiCorp Vault, AWS Secrets Manager, environment variables at minimum). Fetch secrets just-in-time per tool call. See AAF Security Pillar 5.5.",
    });
  }

  // --- INTEGRITY ---

  findings.push(...scanContent(
    entries, INJECTION_PATTERNS,
    "Unsandboxed code execution",
    "high", "integrity",
    "Wrap this execution in a sandbox or use an allowlist for permitted commands. Validate all inputs before execution. See AAF Security Pillar 5.4: Tool Safety."
  ));

  findings.push(...scanContent(
    entries, BROAD_PERMISSION_PATTERNS,
    "Overly broad permissions",
    "high", "integrity",
    "Replace wildcard/admin permissions with narrowly scoped, least-privilege grants per tool and action class. See AAF Security Pillar 5.3: Privilege Separation."
  ));

  if (!checkAbsence(entries, paths, ["gateway", "tool_gateway", "toolgateway", "epistemic gate", "policy gate"], ["gateway"])) {
    findings.push({
      severity: "high", cia_dimension: "integrity",
      check: "No tool gateway pattern detected",
      location: "(project-wide)",
      evidence: "No references to a gateway, policy gate, or epistemic gate enforcing tool access",
      recommendation: "Implement a non-bypassable Tool Gateway that evaluates every tool invocation against policy, budgets, and risk class before execution. See AAF Security Pillar 5.4.",
    });
  }

  if (!checkAbsence(entries, paths, ["instruction hierarchy", "system prompt", "data boundary", "content label", "role: system"])) {
    findings.push({
      severity: "medium", cia_dimension: "integrity",
      check: "No prompt injection mitigation detected",
      location: "(project-wide)",
      evidence: "No references to instruction hierarchy, system prompt separation, or content labelling",
      recommendation: "Enforce instruction hierarchy: system instructions must not be overridable by user/retrieved content. Label external content as data, not instructions. See AAF Security Pillar 5.6.",
    });
  }

  if (!checkAbsence(entries, paths, ["verify", "definition of done", "evidence", "assert", "check"], ["verify", "validation"])) {
    findings.push({
      severity: "medium", cia_dimension: "integrity",
      check: "No action verification pattern detected",
      location: "(project-wide)",
      evidence: "No references to verification, evidence-based completion, or assertion patterns",
      recommendation: "Add evidence-based verification after write actions. Confirm the action succeeded before proceeding. See AAF Security Pillar 5.4: Evidence-based definition of done.",
    });
  }

  // --- AVAILABILITY ---

  if (!checkAbsence(entries, paths, ["rate limit", "throttle", "ratelimit", "rate-limit", "quota"], ["rate.limit", "throttle"])) {
    findings.push({
      severity: "medium", cia_dimension: "availability",
      check: "No rate limiting detected",
      location: "(project-wide)",
      evidence: "No references to rate limiting, throttling, or quotas",
      recommendation: "Add rate limiting at agent entry points to prevent abuse, resource starvation, and runaway loops. See AAF Security Pillar 5.2: Rate limiting and abuse controls.",
    });
  }

  if (!checkAbsence(entries, paths, ["budget", "max_steps", "max_tokens", "max_tool", "step_limit"])) {
    findings.push({
      severity: "medium", cia_dimension: "availability",
      check: "No budget enforcement detected",
      location: "(project-wide)",
      evidence: "No references to step budgets, token limits, or tool call limits",
      recommendation: "Enforce runtime budgets (steps, tokens, tool calls, spend) to prevent unbounded loops and cost overruns. See AAF Cost Pillar and Autonomy Governance.",
    });
  }

  if (!checkAbsence(entries, paths, ["fallback", "graceful degrad", "failover", "circuit breaker"])) {
    findings.push({
      severity: "low", cia_dimension: "availability",
      check: "No graceful degradation for model unavailability",
      location: "(project-wide)",
      evidence: "No references to fallback, graceful degradation, failover, or circuit breaker patterns",
      recommendation: "Design fallback behaviour for when the LLM provider is unavailable. The model is a critical dependency — if it's offline, the agent cannot reason. See AAF Security Pillar 5.2.",
    });
  }

  const summary = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    by_cia: {
      integrity: findings.filter((f) => f.cia_dimension === "integrity").length,
      confidentiality: findings.filter((f) => f.cia_dimension === "confidentiality").length,
      availability: findings.filter((f) => f.cia_dimension === "availability").length,
    },
  };

  return { findings, summary };
}
