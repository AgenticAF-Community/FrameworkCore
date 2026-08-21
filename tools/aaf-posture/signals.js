/**
 * Posture signals: the patterns that indicate a control is present.
 *
 * These are anchored regular expressions, not substrings. Substring matching
 * produced false passes that were hard to see: `.includes("act")` matched
 * `contactForm`, so a file containing `export const contactForm = 1` satisfied
 * "Is the full control loop observable (Trigger → Decide → Act → Verify)?".
 *
 * Rules for editing this file:
 *   - Use \b word boundaries. A bare word is almost always a substring of an
 *     unrelated one.
 *   - Keep patterns case-insensitive via the `i` flag, not by lowercasing the
 *     haystack. Lowercasing hides the intent of the pattern.
 *   - Do not add a pattern shorter than four characters. Short tokens match
 *     everything.
 *
 * This mirrors the single-source-of-truth style already used by
 * tools/aaf-security/patterns.js.
 */

/** @typedef {{ re: RegExp, label: string }} Signal */

/** Build a case-insensitive, word-bounded alternation from plain terms. */
function words(...terms) {
  return terms.map((term) => ({
    re: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s_-]*")}\\b`, "i"),
    label: term,
  }));
}

/** Build signals from explicit regular expressions. */
function patterns(...pairs) {
  return pairs.map(([re, label]) => ({ re, label }));
}

export const SIGNALS = {
  auth: [
    ...words("authenticate", "authorization", "authorize", "authn", "authz", "bearer token", "oauth", "session token"),
    ...patterns(
      [/\bapi[_-]?key\b/i, "api key"],
      [/\bmiddleware\b/i, "middleware"],
      [/\bverify(Token|Jwt|Signature)\b/i, "token verification"],
    ),
  ],

  leastPrivilege: [
    ...words("least privilege", "allowlist", "allow list", "permission scope", "scoped token", "readonly", "read only"),
    ...patterns(
      [/\bscopes?\s*[:=]/i, "scope assignment"],
      [/\bpermissions?\s*[:=]/i, "permission assignment"],
    ),
  ],

  // Negative signal: a broad grant contradicts least privilege.
  broadPermission: patterns(
    [/["'](\*|admin|root|superuser)["']/, "wildcard or admin grant"],
    [/\bpermissions?\s*[:=]\s*\[?\s*["']\*["']/i, "wildcard permission grant"],
    [/\bfull[_-]?access\b/i, "full access grant"],
  ),

  writeGate: [
    ...words("approval", "human in the loop", "confirmation", "irreversible", "dry run", "epistemic gate", "policy gate"),
    ...patterns(
      [/\brequire(s)?Approval\b/i, "approval requirement"],
      [/\bgate(d|way)?\b/i, "gate"],
    ),
  ],

  untrustedInput: [
    ...words("untrusted", "sanitize", "sanitise", "escape html", "prompt injection", "hostile input"),
    ...patterns(
      [/\bvalidat(e|ion)\b/i, "validation"],
      [/\bzod\b|\bjoi\b|\bpydantic\b|\bajv\b/i, "schema validation library"],
    ),
  ],

  // Trust-boundary controls specific to prompt injection.
  injectionMitigation: [
    ...words("instruction hierarchy", "content label", "data boundary", "prompt injection", "system prompt"),
    ...patterns([/\brole\s*[:=]\s*["']system["']/i, "system role separation"]),
  ],

  verifiableDone: [
    ...words("definition of done", "acceptance criteria", "postcondition", "invariant"),
    ...patterns(
      [/\bassert\w*\s*\(/i, "assertion"],
      [/\bverif(y|ies|ication)\b/i, "verification"],
      [/\bexpect\s*\(/i, "expectation"],
    ),
  ],

  toolFailure: [
    ...words("fallback", "circuit breaker", "graceful degradation", "error handler"),
    ...patterns(
      [/\bcatch\s*[({]/i, "catch block"],
      [/\bexcept\s+\w*(Error|Exception)/i, "except block"],
      [/\btry\s*[:{]/i, "try block"],
    ),
  ],

  idempotency: words("idempotent", "idempotency", "checkpoint", "resume token", "dedupe", "deduplicate", "exactly once"),

  retries: [
    ...words("backoff", "jitter", "reconnect", "max attempts"),
    ...patterns([/\bretr(y|ies|ying)\b/i, "retry"]),
  ],

  runtimeBudget: [
    ...words("max steps", "max tokens", "max iterations", "step limit", "token limit", "spend limit", "cost cap"),
    ...patterns([/\bbudget\w*\s*[:=.]/i, "budget assignment"]),
  ],

  modelRouting: [
    ...words("model routing", "route to model", "planner model", "executor model", "model selection"),
    ...patterns([/\bmodel\s*[:=]\s*["'`]/i, "explicit model choice"]),
  ],

  contextBudget: words("context budget", "context limit", "context window", "token budget", "max context", "prune context", "compaction"),

  cachingEarlyStop: [
    ...words("prompt cache", "cache hit", "memoize", "memoise", "early stop", "stop condition", "short circuit"),
    ...patterns([/\bcach(e|ing)\b/i, "cache"]),
  ],

  observability: [
    ...words("observability", "telemetry", "opentelemetry", "structured log", "trace id", "correlation id", "span"),
    ...patterns([/\btracing\b/i, "tracing"]),
  ],

  evalHarness: words("evaluation harness", "regression suite", "golden set", "benchmark", "eval set", "test suite"),

  stagedRollout: words("rollback", "canary", "blue green", "feature flag", "staged rollout", "progressive delivery", "kill switch"),

  versioning: [
    ...words("changelog", "semver", "schema version"),
    ...patterns([/\bversion\s*[:=]\s*["'\d]/i, "explicit version"]),
  ],

  topology: words("single agent", "multi agent", "orchestrator", "topology", "subagent", "sub agent", "handoff"),

  roundTrips: words("batch request", "bulk", "parallel tool", "concurrent", "round trip", "prefetch"),

  interactiveBatch: [
    ...words("background job", "worker queue", "scheduled", "cron", "streaming"),
    ...patterns([/\bqueue\b/i, "queue"]),
  ],

  usageMeasured: [
    ...words("usage metric", "dashboard", "prometheus", "metrics endpoint", "token usage", "cost tracking"),
    ...patterns([/\bmetrics?\s*[:=.]/i, "metrics"]),
  ],

  efficiencyDefaults: words("minimal context", "concise", "truncate", "compress", "cached prefix", "bounded loop", "max depth"),

  contextVsMemory: words("task scoped", "ephemeral", "durable memory", "long term memory", "short term memory", "working memory", "session state"),

  provenance: words("provenance", "attribution", "source of record", "trusted source", "untrusted source", "data lineage"),

  retrievalMinimal: [
    ...words("retrieval", "retrieve", "rerank", "reranker", "top k", "chunk", "citation", "embedding", "vector store"),
    ...patterns([/\bretrieval[\s_-]*augmented\b/i, "retrieval augmented generation"]),
  ],

  autonomyDeclared: words("autonomy level", "assistive", "delegated", "bounded autonomous", "supervisory", "human in the loop"),

  escalation: words("escalation", "escalate", "degraded mode", "safe mode", "handoff to human", "approval required"),

  rateLimit: [
    ...words("rate limit", "throttle", "quota", "leaky bucket", "token bucket"),
    ...patterns([/\bratelimit\w*/i, "rate limiter"]),
  ],
};

/** Path-shaped fallbacks, used only when content yields nothing. */
export const PATH_SIGNALS = {
  auth: [/auth/i, /middleware/i, /guard/i, /session/i],
  leastPrivilege: [/policy/i, /permission/i, /\brbac\b/i],
  writeGate: [/gateway/i, /approval/i, /\bgates?\b/i],
  cachingEarlyStop: [/cache/i],
  evalHarness: [/(^|\/)(test|tests|spec|specs|eval|evals|e2e)(\/|$)/i, /\.(test|spec)\./i],
  versioning: [/changelog/i, /migrations?/i],
  rateLimit: [/rate[-_]?limit/i, /throttle/i, /quota/i],
  observability: [/telemetry/i, /tracing/i, /metrics/i],
  interactiveBatch: [/worker/i, /queue/i, /jobs?/i],
};
