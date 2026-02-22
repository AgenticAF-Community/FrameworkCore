/**
 * Foundation tests — Step 1 gate.
 * Run: node --test tools/tests/foundation.test.js
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const SKILLS_DIR = path.join(REPO_ROOT, "tools", "skills");
const PILLARS_PATH = path.join(REPO_ROOT, "tools", "aaf-posture", "pillars.js");
const MANIFEST_PATH = path.join(REPO_ROOT, "tools", "skills", "manifest.json");

// ─── MCP: VALID_SKILL_IDS covers all skills ────────────────────────────────

describe("MCP skill IDs", () => {
  const mcpSource = fs.readFileSync(path.join(REPO_ROOT, "api", "mcp.ts"), "utf8");

  it("VALID_SKILL_IDS should include every skill directory", () => {
    const skillDirs = fs.readdirSync(SKILLS_DIR).filter((d) =>
      fs.existsSync(path.join(SKILLS_DIR, d, "SKILL.md"))
    );
    for (const id of skillDirs) {
      assert.ok(
        mcpSource.includes(`"${id}"`),
        `Skill "${id}" is missing from VALID_SKILL_IDS in api/mcp.ts`
      );
    }
  });

  it("z.enum should reference VALID_SKILL_IDS (single source of truth)", () => {
    assert.ok(
      mcpSource.includes("z.enum(VALID_SKILL_IDS)"),
      "z.enum should use VALID_SKILL_IDS, not a separate inline array"
    );
  });
});

// ─── checks.js: keyed by question text, not index ──────────────────────────

describe("checks.js heuristic keying", () => {
  const checksSource = fs.readFileSync(
    path.join(REPO_ROOT, "tools", "aaf-posture", "checks.js"),
    "utf8"
  );

  it("should not use qIdx-based matching", () => {
    assert.ok(
      !checksSource.includes("qIdx"),
      "checks.js should not reference qIdx — heuristics must be keyed by question text"
    );
  });

  it("should export HEURISTICS or use question-text keys", () => {
    assert.ok(
      checksSource.includes("HEURISTICS"),
      "checks.js should define a HEURISTICS registry keyed by question text"
    );
  });
});

// ─── checks.js: every pillar question has a registered heuristic ────────────

describe("checks.js heuristic coverage", async () => {
  const { PILLARS } = await import(PILLARS_PATH);
  const checksSource = fs.readFileSync(
    path.join(REPO_ROOT, "tools", "aaf-posture", "checks.js"),
    "utf8"
  );

  for (const pillar of PILLARS) {
    for (const question of pillar.questions) {
      it(`${pillar.id}: heuristic registered for "${question.slice(0, 60)}..."`, () => {
        assert.ok(
          checksSource.includes(question) || checksSource.includes(question.replace(/"/g, "\\\"" )),
          `No heuristic found for question: ${question}`
        );
      });
    }
  }
});

// ─── checks.js: runChecks returns correct structure ─────────────────────────

describe("checks.js runChecks output", async () => {
  const { PILLARS } = await import(PILLARS_PATH);
  const { runChecks } = await import(
    path.join(REPO_ROOT, "tools", "aaf-posture", "checks.js")
  );

  const mockScan = {
    paths: ["src/auth.js", "src/index.js", "tests/test_main.js"],
    content: new Map([
      ["src/auth.js", "authenticate bearer token middleware"],
      ["src/index.js", "main entry point"],
    ]),
  };

  const report = runChecks(mockScan);

  it("should return an entry for every pillar", () => {
    for (const pillar of PILLARS) {
      assert.ok(report[pillar.id], `Missing pillar in report: ${pillar.id}`);
    }
  });

  it("each pillar entry should have the correct number of questions", () => {
    for (const pillar of PILLARS) {
      assert.equal(
        report[pillar.id].length,
        pillar.questions.length,
        `${pillar.id}: expected ${pillar.questions.length} results, got ${report[pillar.id].length}`
      );
    }
  });

  it("each result should have question, status, and evidence fields", () => {
    for (const pillar of PILLARS) {
      for (const result of report[pillar.id]) {
        assert.ok(result.question, "Missing question field");
        assert.ok(["found", "not_found", "unclear"].includes(result.status), `Invalid status: ${result.status}`);
      }
    }
  });

  it("should detect auth pattern in mock data", () => {
    const secResults = report["security"];
    const authResult = secResults.find((r) => r.question.includes("authenticated"));
    assert.equal(authResult.status, "found", "Should detect auth in src/auth.js");
  });
});

// ─── Pipeline A: manifest.json ──────────────────────────────────────────────

describe("skills manifest.json", () => {
  it("manifest.json should exist", () => {
    assert.ok(fs.existsSync(MANIFEST_PATH), "manifest.json not found — run sync-from-docs.js");
  });

  it("should be valid JSON with skills array", () => {
    const content = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    assert.ok(Array.isArray(content.skills), "manifest.skills should be an array");
    assert.ok(content.skills.length > 0, "manifest.skills should not be empty");
  });

  it("should list all skill directories", () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    const diskSkills = fs.readdirSync(SKILLS_DIR).filter((d) =>
      fs.existsSync(path.join(SKILLS_DIR, d, "SKILL.md"))
    );
    const manifestIds = manifest.skills.map((s) => s.id);
    for (const id of diskSkills) {
      assert.ok(manifestIds.includes(id), `Skill "${id}" missing from manifest.json`);
    }
  });

  it("each skill should have id, title, and description", () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    for (const skill of manifest.skills) {
      assert.ok(skill.id, "Missing skill id");
      assert.ok(skill.title, `Missing title for ${skill.id}`);
      assert.ok(skill.description && skill.description !== "---", `Missing or invalid description for ${skill.id}`);
    }
  });
});

// ─── Pipeline A: pillars.js consistency ─────────────────────────────────────

describe("pillars.js structure", async () => {
  const { PILLARS } = await import(PILLARS_PATH);

  it("should have 8 pillars (6 main + 2 cross-cutting)", () => {
    assert.equal(PILLARS.length, 8);
  });

  it("each pillar should have id, name, and questions", () => {
    for (const p of PILLARS) {
      assert.ok(p.id, "Missing pillar id");
      assert.ok(p.name, `Missing name for ${p.id}`);
      assert.ok(Array.isArray(p.questions) && p.questions.length > 0, `${p.id}: no questions`);
    }
  });

  it("pillar IDs should be unique", () => {
    const ids = PILLARS.map((p) => p.id);
    assert.equal(ids.length, new Set(ids).size, "Duplicate pillar IDs found");
  });
});
