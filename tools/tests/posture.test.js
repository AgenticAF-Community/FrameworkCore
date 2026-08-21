/**
 * Posture scanner tests.
 * Run: node --test tools/tests/posture.test.js
 *
 * These lock in the behaviour that the scanner previously got wrong:
 * documentation counted as implementation, and substring matching passed
 * checks on unrelated words.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runChecks, HEURISTICS } from "../aaf-posture/checks.js";
import { PILLARS } from "../aaf-posture/pillars.js";
import { classifyFile, partitionByClass } from "../aaf-posture/classify.js";
import { SIGNALS, PATH_SIGNALS } from "../aaf-posture/signals.js";

/** Run the scanner over an in-memory file map. */
function check(files) {
  return runChecks({ paths: Object.keys(files), content: new Map(Object.entries(files)) });
}

function tally(report) {
  const counts = { found: 0, asserted: 0, not_found: 0, unclear: 0 };
  for (const items of Object.values(report)) {
    for (const item of items) counts[item.status]++;
  }
  return counts;
}

function question(report, pillarId, needle) {
  const item = report[pillarId].find((q) => q.question.includes(needle));
  assert.ok(item, `No question in "${pillarId}" containing "${needle}"`);
  return item;
}

// ─── Registry drift ────────────────────────────────────────────────────────
//
// pillars.js is generated from docs/ by tools/scripts/sync-from-docs.js.
// Rewording a question there silently orphans its heuristic here. That already
// happened once: four security heuristics became unreachable.

describe("posture heuristic registry", () => {
  const declared = new Set(PILLARS.flatMap((p) => p.questions));

  it("registers a heuristic for every question in pillars.js", () => {
    const missing = [];
    for (const pillar of PILLARS) {
      for (const q of pillar.questions) {
        if (!HEURISTICS[pillar.id]?.[q]) missing.push(`${pillar.id}: ${q}`);
      }
    }
    assert.deepEqual(missing, [], `Questions with no heuristic:\n${missing.join("\n")}`);
  });

  it("has no heuristic keyed to a question that no longer exists", () => {
    const orphans = [];
    for (const [pillarId, questions] of Object.entries(HEURISTICS)) {
      for (const q of Object.keys(questions)) {
        if (!declared.has(q)) orphans.push(`${pillarId}: ${q}`);
      }
    }
    assert.deepEqual(
      orphans,
      [],
      `Heuristics keyed to questions absent from pillars.js — they never run:\n${orphans.join("\n")}`
    );
  });

  it("references only signal keys that exist", () => {
    for (const questions of Object.values(HEURISTICS)) {
      for (const [q, spec] of Object.entries(questions)) {
        const [signalKey, opts] = spec;
        assert.ok(SIGNALS[signalKey], `"${q}" references unknown signal "${signalKey}"`);
        if (opts?.negative) {
          assert.ok(SIGNALS[opts.negative], `"${q}" references unknown negative signal "${opts.negative}"`);
        }
        if (opts?.pathKey) {
          assert.ok(PATH_SIGNALS[opts.pathKey], `"${q}" references unknown path key "${opts.pathKey}"`);
        }
      }
    }
  });
});

// ─── Signal hygiene ────────────────────────────────────────────────────────

describe("posture signals", () => {
  it("uses real regular expressions, not regex-shaped strings", () => {
    for (const [key, signals] of Object.entries(SIGNALS)) {
      for (const signal of signals) {
        assert.ok(signal.re instanceof RegExp, `SIGNALS.${key} has a non-regex pattern: ${signal.label}`);
      }
    }
  });

  it("has no signal short enough to match inside unrelated words", () => {
    // "act" once matched "contactForm". Word boundaries plus a length floor
    // keep that from recurring.
    for (const [key, signals] of Object.entries(SIGNALS)) {
      for (const { re, label } of signals) {
        assert.ok(
          re.source.includes("\\b") || re.source.includes("["),
          `SIGNALS.${key} pattern "${label}" is not anchored to a word boundary`
        );
        assert.ok(label.length >= 4, `SIGNALS.${key} label "${label}" is too short to be specific`);
      }
    }
  });

  it("does not match a substring of an unrelated identifier", () => {
    const report = check({ "app.js": "export const contactForm = 1;\nconst character = 'x';\n" });
    const observability = question(
      report,
      "operational-excellence",
      "Is the full control loop observable"
    );
    assert.equal(observability.status, "not_found");
  });
});

// ─── File classification ───────────────────────────────────────────────────

describe("posture file classification", () => {
  it("classifies by extension and by bare filename", () => {
    assert.equal(classifyFile("src/agent.ts"), "code");
    assert.equal(classifyFile("src/agent.py"), "code");
    assert.equal(classifyFile("config/app.yaml"), "config");
    assert.equal(classifyFile("Dockerfile"), "config");
    assert.equal(classifyFile("infra/main.tf"), "config");
    assert.equal(classifyFile("README.md"), "docs");
    assert.equal(classifyFile("docs/notes.txt"), "docs");
    assert.equal(classifyFile("LICENSE"), "docs");
  });

  it("routes docs away from the evidence set", () => {
    const { evidence, docs } = partitionByClass([
      ["a.js", "x"],
      ["README.md", "y"],
      ["k8s.yaml", "z"],
    ]);
    assert.deepEqual(evidence.map((e) => e[0]), ["a.js", "k8s.yaml"]);
    assert.deepEqual(docs.map((e) => e[0]), ["README.md"]);
  });
});

// ─── Documentation is a claim, not evidence ────────────────────────────────

describe("posture evidence honesty", () => {
  const ASPIRATIONAL_README = `# Our Agent

We enforce budgets and max steps. Tool scopes are least privilege.
Every write action is gated and requires approval. We sanitize untrusted
input. Retries use backoff. Actions are idempotent. We emit telemetry and
traces. Rollout is staged with rollback. Context is task scoped.
Provenance is tracked. Autonomy level is delegated. Escalation is defined.
`;

  it("never reports found for a repository that is only documentation", () => {
    const report = check({ "README.md": ASPIRATIONAL_README });
    const counts = tally(report);
    assert.equal(counts.found, 0, "Prose must never evidence a control");
    assert.ok(counts.asserted > 0, "Documented claims should surface as asserted");
  });

  it("labels a documented-only claim with its source line", () => {
    const report = check({ "README.md": ASPIRATIONAL_README });
    const budgets = question(report, "cost", "Are budgets enforced at runtime?");
    assert.equal(budgets.status, "asserted");
    assert.match(budgets.evidence, /documented only/);
    assert.match(budgets.evidence, /README\.md:\d+/);
  });

  it("prefers code over documentation when both mention a control", () => {
    const report = check({
      "README.md": "We enforce budgets.",
      "agent.js": "const budget = { max_steps: 10 };\n",
    });
    const budgets = question(report, "cost", "Are budgets enforced at runtime?");
    assert.equal(budgets.status, "found");
    assert.match(budgets.evidence, /agent\.js:\d+/);
  });

  it("does not let an aspirational README mask an unsafe implementation", () => {
    // The regression case: this scored 24 of 29 "found" before the fix.
    const report = check({
      "agent.js": "async function run(input) {\n  while (true) {\n    await act(await llm(input));\n  }\n}\n",
      "ARCHITECTURE.md": ASPIRATIONAL_README,
    });
    const counts = tally(report);
    assert.equal(counts.found, 0, `Expected no evidenced controls, got ${counts.found}`);
  });
});

// ─── Negative signals ──────────────────────────────────────────────────────

describe("posture negative signals", () => {
  it("treats a wildcard grant as contradicting least privilege", () => {
    const report = check({
      "iam.json": '{ "Effect": "Allow", "Action": "*", "Resource": "*" }',
      "app.js": "const scopes = ['read'];\n",
    });
    const leastPrivilege = question(report, "security", "Are tool scopes least privilege?");
    assert.equal(leastPrivilege.status, "not_found");
    assert.match(leastPrivilege.evidence, /contradicted by/);
    assert.match(leastPrivilege.evidence, /iam\.json:\d+/);
  });
});

// ─── Real controls are still detected ──────────────────────────────────────
//
// Stricter matching must not turn every check into a false negative.

describe("posture detects genuine controls", () => {
  it("reports found for an agent that implements the controls", () => {
    const report = check({
      "src/auth.js": "export function authorize(req) {\n  const token = bearerToken(req);\n  return verifyToken(token);\n}\n",
      "src/budget.js": "export const budget = { max_steps: 12, max_tokens: 4000 };\n",
      "src/retry.js": "export async function withRetry(fn) {\n  // exponential backoff with jitter\n}\n",
      "src/gate.js": "export function requiresApproval(action) {\n  return action.irreversible;\n}\n",
      "src/telemetry.js": "import { trace } from '@opentelemetry/api';\nexport const span = trace.getTracer('agent');\n",
      "src/memory.js": "// task scoped context vs durable memory\nexport const workingMemory = new Map();\n",
      "tests/agent.test.js": "it('works', () => { expect(1).toBe(1); });\n",
      "CHANGELOG.md": "## 1.0.0\n",
    });

    assert.equal(question(report, "security", "authenticated and authorized").status, "found");
    assert.equal(question(report, "security", "write actions gated").status, "found");
    assert.equal(question(report, "cost", "budgets enforced at runtime").status, "found");
    assert.equal(question(report, "reliability", "Are retries safe?").status, "found");
    assert.equal(question(report, "operational-excellence", "evaluation harness").status, "found");
    assert.equal(question(report, "operational-excellence", "control loop observable").status, "found");
    assert.equal(question(report, "context-optimization", "context separated from memory").status, "found");
  });

  it("returns one of the four known statuses for every question", () => {
    const report = check({ "a.js": "const x = 1;\n" });
    const valid = new Set(["found", "asserted", "not_found", "unclear"]);
    for (const [pillarId, items] of Object.entries(report)) {
      for (const item of items) {
        assert.ok(valid.has(item.status), `${pillarId} returned unknown status "${item.status}"`);
      }
    }
  });

  it("covers every pillar declared in pillars.js", () => {
    const report = check({ "a.js": "const x = 1;\n" });
    for (const pillar of PILLARS) {
      assert.ok(Array.isArray(report[pillar.id]), `Missing pillar "${pillar.id}" in report`);
      assert.equal(report[pillar.id].length, pillar.questions.length);
    }
  });
});
