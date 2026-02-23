/**
 * Heuristic checks per pillar. Each returns { status: 'found'|'not_found'|'unclear', evidence?: string } per question.
 * Heuristics are keyed by question text (not index) so they survive question reordering.
 * Evidence is a short string (e.g. file path or snippet) for "found" or "unclear".
 */
import { PILLARS } from "./pillars.js";

function hasPattern(contentMap, patterns) {
  for (const [rel, text] of contentMap) {
    const lower = text.toLowerCase();
    for (const p of patterns) {
      if (lower.includes(p.toLowerCase())) return { status: "found", evidence: rel };
    }
  }
  return { status: "not_found" };
}

function hasPath(paths, pathPatterns) {
  const lowerPaths = paths.map((p) => p.toLowerCase());
  for (const pattern of pathPatterns) {
    const re = new RegExp(pattern, "i");
    const match = lowerPaths.find((p) => re.test(p));
    if (match) return { status: "found", evidence: match };
  }
  return { status: "not_found" };
}

/**
 * Heuristic registry: pillarId -> questionText -> checker function.
 * Each checker receives (contentList, paths) and returns { status, evidence? }.
 */
const HEURISTICS = {
  security: {
    "Are all entry points authenticated and authorized?": (cl, paths) => {
      const r = hasPattern(cl, ["auth", "authorize", "authenticate", "middleware", "bearer", "api_key", "api-key"]);
      return r.status === "not_found" ? hasPath(paths, ["auth", "middleware", "guard"]) : r;
    },
    "Are tool scopes least privilege?": (cl, paths) => {
      const r = hasPattern(cl, ["least privilege", "scope", "permission", "allowlist"]);
      return r.status === "not_found" ? hasPath(paths, ["gateway", "gate"]) : r;
    },
    "Are write actions gated and verified?": (cl, paths) => {
      const r = hasPattern(cl, ["gate", "approval", "irreversible", "confirm", "verify"]);
      return r.status === "not_found" ? hasPath(paths, ["gateway", "approval"]) : r;
    },
    "Are untrusted inputs (including retrieved content) treated as hostile?": (cl) =>
      hasPattern(cl, ["untrusted", "sanitize", "validate", "hostile", "injection", "user input"]),
    "Are secrets externalized (no hardcoded keys, tokens, or passwords)?": (cl) =>
      hasPattern(cl, ["AKIA", "sk-", "sk_live", "password=", "secret=", "token="]).status === "found"
        ? { status: "not_found", evidence: "Possible hardcoded secret detected" }
        : hasPattern(cl, ["vault", "secret manager", "getSecret", "env(", "process.env"]),
    "Are rate limits and abuse controls in place?": (cl, paths) => {
      const r = hasPattern(cl, ["rate limit", "throttle", "rateLimit", "rate-limit", "quota"]);
      return r.status === "not_found" ? hasPath(paths, ["rate.limit", "throttle", "quota"]) : r;
    },
    "Is prompt injection mitigated (instruction hierarchy, content labelling)?": (cl) =>
      hasPattern(cl, ["system prompt", "instruction hierarchy", "content label", "data boundary", "role.*system"]),
    "Are permissions narrowly scoped (no wildcard or admin grants)?": (cl) =>
      hasPattern(cl, ["\"*\"", "'*'", "admin.*all", "full_access", "superuser"]).status === "found"
        ? { status: "not_found", evidence: "Overly broad permission detected" }
        : hasPattern(cl, ["scope", "permission", "role"]),
  },

  reliability: {
    "Is success defined as a verifiable end state?": (cl) =>
      hasPattern(cl, ["definition of done", "verif", "done", "acceptance", "evidence"]),
    "Are tool failures expected and handled?": (cl) =>
      hasPattern(cl, ["tool fail", "retry", "fallback", "catch", "error handl"]),
    "Are actions idempotent or checkpointed?": (cl) =>
      hasPattern(cl, ["idempotent", "checkpoint", "idempotency"]),
    "Are retries safe?": (cl) =>
      hasPattern(cl, ["retry", "backoff", "reconnect"]),
  },

  cost: {
    "Are budgets enforced at runtime?": (cl) =>
      hasPattern(cl, ["budget", "max_steps", "max_tokens", "max_tool", "limit"]),
    "Is model routing explicit by phase and risk?": (cl) =>
      hasPattern(cl, ["model rout", "routing", "phase", "planner", "executor"]),
    "Is context budgeted (no uncontrolled prompt accumulation)?": (cl) =>
      hasPattern(cl, ["context budget", "context limit", "token budget", "max_tokens"]),
    "Are caching and early stopping designed in?": (cl, paths) => {
      const r = hasPattern(cl, ["cache", "early stop", "stop condition"]);
      return r.status === "not_found" ? hasPath(paths, ["cache"]) : r;
    },
  },

  "operational-excellence": {
    "Is the full control loop observable (Trigger → Decide → Act → Verify), with observability traces (intent → plan → act → verify) captured?": (cl) =>
      hasPattern(cl, ["observe", "decide", "act", "verify", "trace", "span", "observability", "telemetry"]),
    "Is there an evaluation harness and regression suite?": (cl, paths) => {
      const r = hasPath(paths, ["test", "spec", "eval", "e2e", "regression"]);
      return r.status === "not_found" ? hasPattern(cl, ["eval", "regression", "harness"]) : r;
    },
    "Is rollout staged with rollback?": (cl) =>
      hasPattern(cl, ["rollback", "canary", "staged", "blue green"]),
    "Are skills/tools versioned and reviewed?": (cl, paths) => {
      const r = hasPattern(cl, ["version", "versioned", "changelog"]);
      return r.status === "not_found" ? hasPath(paths, ["changelog", "version"]) : r;
    },
  },

  performance: {
    "Is topology justified by task structure (single-agent by default; orchestration only where it helps)?": (cl) =>
      hasPattern(cl, ["single agent", "topology", "orchestrat", "multi agent"]),
    "Are tool round trips minimized?": (cl) =>
      hasPattern(cl, ["round trip", "batch", "minimiz"]),
    "Is work partitioned into interactive vs batch?": (cl) =>
      hasPattern(cl, ["interactive", "batch", "async", "queue"]),
  },

  sustainability: {
    "Is usage measured and visible?": (cl) =>
      hasPattern(cl, ["usage", "metric", "measure", "dashboard", "monitor"]),
    "Are efficiency levers used as defaults (minimal context, concise outputs, cached prefixes, bounded loops)?": (cl) =>
      hasPattern(cl, ["minimal context", "concise", "efficiency", "bounded loop"]),
  },

  "context-optimization": {
    "Is context separated from memory (task-scoped vs durable)?": (cl) =>
      hasPattern(cl, ["context", "memory", "task-scoped", "ephemeral", "durable", "separate"]),
    "Is context budgeted per task/step with explicit allocations?": (cl) =>
      hasPattern(cl, ["context budget", "context limit", "allocation", "token budget"]),
    "Is provenance tracked (trusted policy vs untrusted data)?": (cl) =>
      hasPattern(cl, ["provenance", "trusted", "untrusted", "attribution"]),
    "Is retrieval/context construction minimal and explainable?": (cl) =>
      hasPattern(cl, ["retrieval", "minimal context", "explainable", "curated"]),
  },

  "autonomy-governance": {
    "Is autonomy level declared (assistive, delegated, bounded autonomous, supervisory)?": (cl) =>
      hasPattern(cl, ["autonomy", "assistive", "delegated", "autonomous", "supervisory", "orchestrat"]),
    "Is there a Definition of Done with acceptance checks and evidence per task class?": (cl) =>
      hasPattern(cl, ["definition of done", "acceptance", "evidence", "DoD"]),
    "Are budgets (steps/tools/tokens/time/spend) enforced and visible?": (cl) =>
      hasPattern(cl, ["budget", "max_steps", "max_tokens", "enforced", "visible"]),
    "Are escalation triggers and degraded modes defined?": (cl) =>
      hasPattern(cl, ["escalation", "degraded", "rollback", "approval required"]),
  },
};

/**
 * Run all pillar checks.
 * @param {{ paths: string[], content: Map<string, string> }} scanResult
 * @returns {Record<string, { question: string, status: string, evidence?: string }[]>}
 */
export function runChecks(scanResult) {
  const { paths, content } = scanResult;
  const contentList = [...content.entries()].map(([p, t]) => [p, t]);
  const report = {};

  for (const pillar of PILLARS) {
    const pillarHeuristics = HEURISTICS[pillar.id] || {};
    report[pillar.id] = pillar.questions.map((question) => {
      const checker = pillarHeuristics[question];
      if (!checker) {
        return { question, status: "unclear", evidence: "No automated signal (no heuristic registered)" };
      }
      const result = checker(contentList, paths);
      return { question, status: result.status, evidence: result.evidence };
    });
  }

  return report;
}
