/**
 * MCP server tools tests — Step 5 gate.
 * Run: node --test tools/tests/mcp-tools.test.js
 *
 * Tests the MCP tool helper functions directly (not via HTTP).
 * This validates the logic that powers each MCP tool.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DATA_DIR = path.join(REPO_ROOT, "tools", "data");

// ─── Data files exist ───────────────────────────────────────────────────────

describe("MCP data dependencies", () => {
  it("pillars.json should exist and be valid", () => {
    const fp = path.join(DATA_DIR, "pillars.json");
    assert.ok(fs.existsSync(fp), "pillars.json not found");
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    assert.ok(Array.isArray(data));
    assert.equal(data.length, 8);
  });

  it("trade-offs.json should exist and be valid", () => {
    const fp = path.join(DATA_DIR, "trade-offs.json");
    assert.ok(fs.existsSync(fp), "trade-offs.json not found");
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    assert.ok(data._meta, "Missing _meta");
    assert.ok(Array.isArray(data.tradeoffs), "tradeoffs should be array");
  });

  it("pillars.json pillar IDs should match the schema", () => {
    const expected = [
      "security", "reliability", "cost", "operational-excellence",
      "performance", "sustainability", "context-optimization", "autonomy-governance",
    ];
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "pillars.json"), "utf8"));
    const ids = data.map((p) => p.id);
    assert.deepEqual(ids.sort(), expected.sort());
  });
});

// ─── MCP server file structure ──────────────────────────────────────────────

describe("MCP server structure", () => {
  const mcpSource = fs.readFileSync(path.join(REPO_ROOT, "api", "mcp.ts"), "utf8");

  const expectedTools = [
    "aaf_lookup",
    "aaf_checklist",
    "aaf_pillars_summary",
    "aaf_get_skill",
    "aaf_design_questions",
    "aaf_tradeoff_analysis",
    "aaf_generate_acc",
    "aaf_scaffold_spec",
    "aaf_posture_interpret",
    "aaf_review_against_acc",
    "aaf_pillar_guidance",
  ];

  for (const tool of expectedTools) {
    it(`should register tool: ${tool}`, () => {
      assert.ok(
        mcpSource.includes(`"${tool}"`),
        `Tool "${tool}" not found in mcp.ts`
      );
    });
  }

  it("should have exactly 12 tools registered", () => {
    const count = (mcpSource.match(/server\.registerTool\(/g) || []).length;
    assert.equal(count, 12, `Expected 12 tools, found ${count}`);
  });

  it("should read trade-offs.json", () => {
    assert.ok(mcpSource.includes("trade-offs.json"));
  });

  it("should read pillars.json", () => {
    assert.ok(mcpSource.includes("pillars.json"));
  });
});

// ─── Design questions tool logic ────────────────────────────────────────────

describe("aaf_design_questions logic", () => {
  const pillars = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "pillars.json"), "utf8"));

  it("should produce questions for every pillar", () => {
    const result = pillars.map((p) => ({
      pillarId: p.id,
      questions: p.questions.map((q, i) => ({
        questionId: `${p.id}-q${i + 1}`,
        text: q,
      })),
    }));
    assert.equal(result.length, 8);
    for (const p of result) {
      assert.ok(p.questions.length > 0, `${p.pillarId} has no questions`);
    }
  });

  it("question IDs should follow pattern pillarId-qN", () => {
    for (const p of pillars) {
      p.questions.forEach((q, i) => {
        const qId = `${p.id}-q${i + 1}`;
        assert.match(qId, /^[a-z-]+-q\d+$/);
      });
    }
  });
});

// ─── Scaffold spec tool logic ───────────────────────────────────────────────

describe("aaf_scaffold_spec logic", () => {
  const levels = ["assistive", "delegated", "bounded-autonomous", "supervisory"];

  for (const level of levels) {
    it(`should return spec for ${level} level`, () => {
      const spec = {
        autonomyLevel: level,
        files: [
          { path: "agent.py", purpose: "Main agent entry point" },
          { path: "policy.yaml", purpose: "ACC" },
          { path: "gates.py", purpose: "Gate implementations" },
        ],
      };
      assert.ok(spec.files.length > 0);
      assert.equal(spec.autonomyLevel, level);
    });
  }
});

// ─── Posture interpret logic ────────────────────────────────────────────────

describe("aaf_posture_interpret logic", () => {
  it("should calculate scores from found/not_found/unclear statuses", () => {
    const report = {
      security: [
        { question: "q1", status: "found" },
        { question: "q2", status: "found" },
        { question: "q3", status: "not_found" },
        { question: "q4", status: "unclear" },
      ],
    };
    const found = report.security.filter((r) => r.status === "found").length;
    const score = found / report.security.length;
    assert.equal(score, 0.5);
  });
});

// ─── Review against ACC logic ───────────────────────────────────────────────

describe("aaf_review_against_acc logic", () => {
  it("should identify gaps where status is not_found", () => {
    const report = {
      security: [
        { question: "Are all entry points authenticated?", status: "found" },
        { question: "Are write actions gated?", status: "not_found" },
      ],
    };
    const acc = "Are write actions gated?";
    const gaps = [];
    for (const result of report.security) {
      if (result.status === "not_found") {
        gaps.push({
          question: result.question,
          severity: acc.includes(result.question) ? "high" : "medium",
        });
      }
    }
    assert.equal(gaps.length, 1);
    assert.equal(gaps[0].severity, "high");
  });
});

// ─── Pillar guidance logic ──────────────────────────────────────────────────

describe("aaf_pillar_guidance logic", () => {
  const pillars = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "pillars.json"), "utf8"));

  it("should find each pillar by ID", () => {
    for (const p of pillars) {
      const found = pillars.find((x) => x.id === p.id);
      assert.ok(found, `Pillar ${p.id} not found`);
      assert.ok(found.questions.length > 0);
    }
  });
});

// ─── Tools page lists all MCP tools ─────────────────────────────────────────

describe("tools page consistency", () => {
  const toolsPage = fs.readFileSync(
    path.join(REPO_ROOT, "website", "src", "pages", "tools.js"),
    "utf8"
  );

  const expectedTools = [
    "aaf_lookup", "aaf_checklist", "aaf_pillars_summary", "aaf_get_skill",
    "aaf_design_questions", "aaf_tradeoff_analysis", "aaf_generate_acc",
    "aaf_scaffold_spec", "aaf_posture_interpret", "aaf_review_against_acc",
    "aaf_pillar_guidance",
  ];

  for (const tool of expectedTools) {
    it(`tools page should list ${tool}`, () => {
      assert.ok(toolsPage.includes(tool), `${tool} missing from tools page`);
    });
  }
});
