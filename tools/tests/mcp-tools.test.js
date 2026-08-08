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

  it("mcp-playbook.json should exist with intents", () => {
    const fp = path.join(DATA_DIR, "mcp-playbook.json");
    assert.ok(fs.existsSync(fp));
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    assert.ok(data.intents.design);
    assert.ok(data.intents.design.steps.some((s) => s.tool === "aaf_list_workloads"));
    assert.ok(data.intents.review);
    assert.ok(typeof data.serverInstructions === "string" && data.serverInstructions.length > 20);
  });

  it("workloads.json should list four workloads", () => {
    const fp = path.join(DATA_DIR, "workloads.json");
    assert.ok(fs.existsSync(fp));
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    assert.equal(data.workloads.length, 4);
    const ids = data.workloads.map((w) => w.id).sort();
    assert.deepEqual(ids, [
      "customer-chatbot",
      "internal-copilot",
      "knowledge-assistant",
      "workflow-agent",
    ]);
    for (const w of data.workloads) {
      assert.ok(Array.isArray(w.dominantTrades) && w.dominantTrades.length > 0, w.id);
      assert.ok(w.doc.endsWith(".md"));
    }
  });

  it("workload-trade-offs.json should tag workloadIds", () => {
    const fp = path.join(DATA_DIR, "workload-trade-offs.json");
    assert.ok(fs.existsSync(fp));
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    assert.ok(data.tradeoffs.length >= 4);
    for (const t of data.tradeoffs) {
      assert.ok(t.workloadId, t.id);
      assert.ok(t.tension);
    }
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

describe("MCP server structure", () => {
  const mcpSource = fs.readFileSync(path.join(REPO_ROOT, "api", "mcp.ts"), "utf8");

  const expectedTools = [
    "aaf_guide",
    "aaf_list_skills",
    "aaf_list_docs",
    "aaf_get_doc",
    "aaf_list_workloads",
    "aaf_workload_guidance",
    "aaf_tradeoff_catalog",
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
    "aaf_security_scan",
  ];

  for (const tool of expectedTools) {
    it(`should register tool: ${tool}`, () => {
      assert.ok(
        mcpSource.includes(`"${tool}"`),
        `Tool "${tool}" not found in mcp.ts`
      );
    });
  }

  it("should have exactly 19 tools registered", () => {
    const count = (mcpSource.match(/server\.registerTool\(/g) || []).length;
    assert.equal(count, 19, `Expected 19 tools, found ${count}`);
  });

  it("should pass server instructions", () => {
    assert.ok(mcpSource.includes("instructions:"));
    assert.ok(mcpSource.includes("serverInstructions"));
  });

  it("should read trade-offs.json", () => {
    const contentSrc = fs.readFileSync(path.join(REPO_ROOT, "api", "lib", "aaf-mcp-content.ts"), "utf8");
    assert.ok(contentSrc.includes("trade-offs.json"));
    assert.ok(contentSrc.includes("workload-trade-offs.json"));
    assert.ok(contentSrc.includes("workloads.json"));
  });

  it("should read pillars.json", () => {
    assert.ok(mcpSource.includes("pillars.json"));
  });
});

describe("IDE rule templates", () => {
  it("should ship Cursor alwaysApply rule", () => {
    const fp = path.join(REPO_ROOT, "tools", "ide", "cursor-rules", "aaf-mcp.mdc");
    assert.ok(fs.existsSync(fp));
    const text = fs.readFileSync(fp, "utf8");
    assert.ok(text.includes("alwaysApply: true"));
    assert.ok(text.includes("aaf_guide"));
    assert.ok(text.includes("aaf_list_workloads"));
  });

  it("should ship AGENTS snippet", () => {
    const fp = path.join(REPO_ROOT, "tools", "ide", "AGENTS-aaf-snippet.md");
    assert.ok(fs.existsSync(fp));
  });
});

describe("Content helper behaviour (via npx tsx)", () => {
  it("guide design mentions workloads; get_doc rejects traversal; rank works", async () => {
    const { spawnSync } = await import("child_process");
    const r = spawnSync(
      "npx",
      ["--yes", "tsx", "tools/tests/run-aaf-mcp-content.ts"],
      { cwd: REPO_ROOT, encoding: "utf8", timeout: 90000 }
    );
    if (r.status !== 0) {
      assert.fail(`tsx helper test failed: ${r.stderr || r.stdout}`);
    }
    assert.ok((r.stdout || "").includes("ok"));
  });
});

describe("Tools page lists new tools", () => {
  it("tools.js mentions aaf_guide and aaf_list_workloads", () => {
    const src = fs.readFileSync(path.join(REPO_ROOT, "website", "src", "pages", "tools.js"), "utf8");
    assert.ok(src.includes("aaf_guide"));
    assert.ok(src.includes("aaf_list_workloads"));
    assert.ok(src.includes("YOUR_AAF_LIVE_KEY"));
  });
});
