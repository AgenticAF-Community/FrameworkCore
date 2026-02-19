/**
 * Heuristic checks per pillar. Each returns { status: 'found'|'not_found'|'unclear', evidence?: string } per question index.
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
 * Run all pillar checks.
 * @param {{ paths: string[], content: Map<string, string> }} scanResult
 * @returns {Record<string, { question: string, status: string, evidence?: string }[]>}
 */
export function runChecks(scanResult) {
  const { paths, content } = scanResult;
  const contentList = [...content.entries()].map(([p, t]) => [p, t]);
  const report = {};

  for (const pillar of PILLARS) {
    report[pillar.id] = pillar.questions.map((question, qIdx) => {
      let result = { status: "unclear", evidence: "No automated signal" };

      if (pillar.id === "security") {
        if (qIdx === 0) { result = hasPattern(contentList, ["auth", "authorize", "authenticate", "middleware", "bearer", "api_key", "api-key"]); if (result.status === "not_found") result = hasPath(paths, ["auth", "middleware", "guard"]); }
        else if (qIdx === 1) { result = hasPattern(contentList, ["least privilege", "scope", "permission", "allowlist", "allowlist"]); if (result.status === "not_found") result = hasPath(paths, ["gateway", "gate"]); }
        else if (qIdx === 2) { result = hasPattern(contentList, ["gate", "approval", "irreversible", "confirm", "verify"]); if (result.status === "not_found") result = hasPath(paths, ["gateway", "approval"]); }
        else if (qIdx === 3) result = hasPattern(contentList, ["untrusted", "sanitize", "validate", "hostile", "injection", "user input"]);
      } else if (pillar.id === "reliability") {
        if (qIdx === 0) result = hasPattern(contentList, ["definition of done", "verif", "done", "acceptance", "evidence"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["tool fail", "retry", "fallback", "catch", "error handl"]);
        else if (qIdx === 2) result = hasPattern(contentList, ["idempotent", "checkpoint", "idempotency"]);
        else if (qIdx === 3) result = hasPattern(contentList, ["retry", "backoff", "reconnect"]);
      } else if (pillar.id === "cost") {
        if (qIdx === 0) result = hasPattern(contentList, ["budget", "max_steps", "max_tokens", "max_tool", "limit"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["model rout", "routing", "phase", "planner", "executor"]);
        else if (qIdx === 2) result = hasPattern(contentList, ["context budget", "context limit", "token budget", "max_tokens"]);
        else if (qIdx === 3) { result = hasPattern(contentList, ["cache", "early stop", "stop condition"]); if (result.status === "not_found") result = hasPath(paths, ["cache"]); }
      } else if (pillar.id === "operational-excellence") {
        if (qIdx === 0) result = hasPattern(contentList, ["observe", "decide", "act", "verify", "trace", "span", "observability", "telemetry"]);
        else if (qIdx === 1) { result = hasPath(paths, ["test", "spec", "eval", "e2e", "regression"]); if (result.status === "not_found") result = hasPattern(contentList, ["eval", "regression", "harness"]); }
        else if (qIdx === 2) result = hasPattern(contentList, ["rollback", "canary", "staged", "blue green"]);
        else if (qIdx === 3) { result = hasPattern(contentList, ["version", "versioned", "changelog"]); if (result.status === "not_found") result = hasPath(paths, ["changelog", "version"]); }
      } else if (pillar.id === "performance") {
        if (qIdx === 0) result = hasPattern(contentList, ["single agent", "topology", "orchestrat", "multi agent"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["round trip", "batch", "minimiz"]);
        else if (qIdx === 2) result = hasPattern(contentList, ["interactive", "batch", "async", "queue"]);
      } else if (pillar.id === "sustainability") {
        if (qIdx === 0) result = hasPattern(contentList, ["usage", "metric", "measure", "dashboard", "monitor"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["minimal context", "concise", "efficiency", "bounded loop"]);
      } else if (pillar.id === "context-optimization") {
        if (qIdx === 0) result = hasPattern(contentList, ["context", "memory", "task-scoped", "ephemeral", "durable", "separate"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["context budget", "context limit", "allocation", "token budget"]);
        else if (qIdx === 2) result = hasPattern(contentList, ["provenance", "trusted", "untrusted", "attribution"]);
        else if (qIdx === 3) result = hasPattern(contentList, ["retrieval", "minimal context", "explainable", "curated"]);
      } else if (pillar.id === "autonomy-governance") {
        if (qIdx === 0) result = hasPattern(contentList, ["autonomy", "assistive", "delegated", "autonomous", "supervisory", "orchestrat"]);
        else if (qIdx === 1) result = hasPattern(contentList, ["definition of done", "acceptance", "evidence", "DoD"]);
        else if (qIdx === 2) result = hasPattern(contentList, ["budget", "max_steps", "max_tokens", "enforced", "visible"]);
        else if (qIdx === 3) result = hasPattern(contentList, ["escalation", "degraded", "rollback", "approval required"]);
      }

      return { question, status: result.status, evidence: result.evidence };
    });
  }

  return report;
}
