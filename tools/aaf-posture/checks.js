/**
 * Heuristic checks per pillar.
 *
 * Each question resolves to one of four statuses:
 *
 *   found      A signal appeared in code or config. The control is evidenced.
 *   asserted   A signal appeared only in documentation. The control is claimed
 *              but not evidenced. This is a prompt to verify, not a pass.
 *   not_found  No signal anywhere.
 *   unclear    No heuristic is registered for the question.
 *
 * The `asserted` status exists because the scanner previously treated prose as
 * proof. A directory holding one README and no code passed 21 of 29 questions.
 * Separating the claim from the evidence is the same distinction the framework
 * applies to agent output: a plausible statement is not an authoritative one.
 *
 * Heuristics are keyed by question text. `pillars.js` is generated from the
 * docs by tools/scripts/sync-from-docs.js, so a reworded question silently
 * orphans its heuristic. tools/tests/posture.test.js fails on that drift.
 */
import { PILLARS } from "./pillars.js";
import { partitionByClass } from "./classify.js";
import { SIGNALS, PATH_SIGNALS } from "./signals.js";

const MAX_SNIPPET = 120;

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function snippetAt(text, index, length) {
  const start = text.lastIndexOf("\n", index) + 1;
  const end = text.indexOf("\n", index + length);
  const raw = text.slice(start, end === -1 ? text.length : end).trim();
  return raw.length > MAX_SNIPPET ? raw.slice(0, MAX_SNIPPET - 1) + "…" : raw;
}

/**
 * Find the first signal match in a set of files.
 *
 * @param {Array<[string,string]>} entries - [relativePath, contents] pairs.
 * @param {Array<{re: RegExp, label: string}>} signals
 * @returns {{ file: string, line: number, label: string, snippet: string } | null}
 */
function firstMatch(entries, signals) {
  for (const [file, text] of entries) {
    for (const { re, label } of signals) {
      // Signals are shared module state; never rely on lastIndex.
      const match = new RegExp(re.source, re.flags.replace(/g/g, "")).exec(text);
      if (match) {
        return {
          file,
          line: lineNumberAt(text, match.index),
          label,
          snippet: snippetAt(text, match.index, match[0].length),
        };
      }
    }
  }
  return null;
}

function formatEvidence(match, note) {
  const where = `${match.file}:${match.line}`;
  const body = `${where} — ${match.label}: \`${match.snippet}\``;
  return note ? `${note} ${body}` : body;
}

/**
 * Resolve a question against code first, then documentation.
 *
 * @param {object} ctx - { evidence, docs, paths }
 * @param {string} signalKey - Key into SIGNALS.
 * @param {object} [opts] - { pathKey, negative }
 */
function resolve(ctx, signalKey, opts = {}) {
  const signals = SIGNALS[signalKey];
  if (!signals) throw new Error(`Unknown signal key: ${signalKey}`);

  // A negative signal contradicts the control outright, so it wins.
  if (opts.negative) {
    const bad = firstMatch(ctx.evidence, SIGNALS[opts.negative]);
    if (bad) {
      return { status: "not_found", evidence: formatEvidence(bad, "contradicted by") };
    }
  }

  const inCode = firstMatch(ctx.evidence, signals);
  if (inCode) return { status: "found", evidence: formatEvidence(inCode) };

  const pathKey = opts.pathKey ?? signalKey;
  const pathPatterns = PATH_SIGNALS[pathKey];
  if (pathPatterns) {
    const hit = ctx.paths.find((p) => pathPatterns.some((re) => re.test(p)));
    if (hit) return { status: "found", evidence: `${hit} — path match` };
  }

  const inDocs = firstMatch(ctx.docs, signals);
  if (inDocs) {
    return {
      status: "asserted",
      evidence: formatEvidence(inDocs, "documented only —"),
    };
  }

  return { status: "not_found" };
}

/**
 * Heuristic registry: pillarId -> questionText -> signal spec.
 *
 * Question text must match tools/aaf-posture/pillars.js exactly.
 */
const HEURISTICS = {
  security: {
    "Are all entry points authenticated and authorized?": ["auth"],
    // A wildcard grant contradicts least privilege, so it is checked first.
    "Are tool scopes least privilege?": ["leastPrivilege", { negative: "broadPermission" }],
    "Are write actions gated and verified?": ["writeGate"],
    "Are untrusted inputs (including retrieved content) treated as hostile?": ["untrustedInput"],
  },

  reliability: {
    "Is success defined as a verifiable end state?": ["verifiableDone"],
    "Are tool failures expected and handled?": ["toolFailure"],
    "Are actions idempotent or checkpointed?": ["idempotency"],
    "Are retries safe?": ["retries"],
  },

  cost: {
    "Are budgets enforced at runtime?": ["runtimeBudget"],
    "Is model routing explicit by phase and risk?": ["modelRouting"],
    "Is context budgeted (no uncontrolled prompt accumulation)?": ["contextBudget"],
    "Are caching and early stopping designed in?": ["cachingEarlyStop"],
  },

  "operational-excellence": {
    "Is the full control loop observable (Trigger → Decide → Act → Verify), with observability traces (intent → plan → act → verify) captured?": ["observability"],
    "Is there an evaluation harness and regression suite?": ["evalHarness"],
    "Is rollout staged with rollback?": ["stagedRollout"],
    "Are skills/tools versioned and reviewed?": ["versioning"],
  },

  performance: {
    "Is topology justified by task structure (single-agent by default; orchestration only where it helps)?": ["topology"],
    "Are tool round trips minimized?": ["roundTrips"],
    "Is work partitioned into interactive vs batch?": ["interactiveBatch"],
  },

  sustainability: {
    "Is usage measured and visible?": ["usageMeasured"],
    "Are efficiency levers used as defaults (minimal context, concise outputs, cached prefixes, bounded loops)?": ["efficiencyDefaults"],
  },

  "context-optimization": {
    "Is context separated from memory (task-scoped vs durable)?": ["contextVsMemory"],
    "Is context budgeted per task/step with explicit allocations?": ["contextBudget"],
    "Is provenance tracked (trusted policy vs untrusted data)?": ["provenance"],
    "Is retrieval/context construction minimal and explainable?": ["retrievalMinimal"],
  },

  "autonomy-governance": {
    "Is autonomy level declared (assistive, delegated, bounded autonomous, supervisory)?": ["autonomyDeclared"],
    "Is there a Definition of Done with acceptance checks and evidence per task class?": ["verifiableDone"],
    "Are budgets (steps/tools/tokens/time/spend) enforced and visible?": ["runtimeBudget"],
    "Are escalation triggers and degraded modes defined?": ["escalation"],
  },
};

/** Exported for the drift test in tools/tests/posture.test.js. */
export { HEURISTICS };

/**
 * Run all pillar checks.
 *
 * @param {{ paths: string[], content: Map<string, string> }} scanResult
 * @returns {Record<string, { question: string, status: string, evidence?: string }[]>}
 */
export function runChecks(scanResult) {
  const { paths, content } = scanResult;
  const entries = [...content.entries()];
  const { evidence, docs } = partitionByClass(entries);
  const ctx = { evidence, docs, paths };

  const report = {};
  for (const pillar of PILLARS) {
    const pillarHeuristics = HEURISTICS[pillar.id] || {};
    report[pillar.id] = pillar.questions.map((question) => {
      const spec = pillarHeuristics[question];
      if (!spec) {
        return { question, status: "unclear", evidence: "No automated signal (no heuristic registered)" };
      }
      const [signalKey, opts] = spec;
      const result = resolve(ctx, signalKey, opts);
      return { question, status: result.status, evidence: result.evidence };
    });
  }

  return report;
}
