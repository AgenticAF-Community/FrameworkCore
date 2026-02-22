/**
 * AI extraction script tests — Step 2 gate.
 * Run: node --test tools/tests/extraction.test.js
 *
 * Tests the schema validation, source quote verification, and script structure.
 * Does NOT call the LLM (that requires API keys and is tested via dry-run + manual review).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateEntry, validateTradeoffs, VALID_PILLAR_IDS } from "../scripts/tradeoff-schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

// ─── Schema validation ─────────────────────────────────────────────────────

describe("tradeoff-schema: validateEntry", () => {
  const validEntry = {
    id: "security-x-cost",
    pillars: ["security", "cost"],
    tension: "Every validation gate costs tokens and time",
    sourceQuote: "Cost optimization sits tightly adjacent to Security",
    source: { doc: "docs/08-pillar-cost.md", section: "7.8", lines: "202-210" },
    confidence: "explicit",
    recommendation: "Gate writes and high-risk actions only",
    recommendationSource: { doc: "docs/06-pillar-security.md", section: "5.3" },
    indicators: [
      { questionId: "security-q3", answer: "yes", signal: "write gates enabled" },
    ],
    autonomyNotes: {
      assistive: "Gates are advisory",
      delegated: "Human approves writes",
      boundedAutonomous: "Pre-approved scopes",
      supervisory: "Nested sub-contracts",
    },
  };

  it("should accept a valid entry", () => {
    const { valid, errors } = validateEntry(validEntry, 0);
    assert.ok(valid, `Unexpected errors: ${errors.join(", ")}`);
  });

  it("should reject entry with missing id", () => {
    const { valid } = validateEntry({ ...validEntry, id: "" }, 0);
    assert.ok(!valid);
  });

  it("should reject entry with invalid pillar ID", () => {
    const { valid, errors } = validateEntry({ ...validEntry, pillars: ["security", "nonexistent"] }, 0);
    assert.ok(!valid);
    assert.ok(errors.some((e) => e.includes("nonexistent")));
  });

  it("should reject entry with same pillar twice", () => {
    const { valid, errors } = validateEntry({ ...validEntry, pillars: ["security", "security"] }, 0);
    assert.ok(!valid);
    assert.ok(errors.some((e) => e.includes("must be different")));
  });

  it("should reject invalid confidence value", () => {
    const { valid } = validateEntry({ ...validEntry, confidence: "maybe" }, 0);
    assert.ok(!valid);
  });

  it("should reject missing sourceQuote", () => {
    const { valid } = validateEntry({ ...validEntry, sourceQuote: "" }, 0);
    assert.ok(!valid);
  });

  it("should reject missing autonomyNotes fields", () => {
    const { valid } = validateEntry({ ...validEntry, autonomyNotes: { assistive: "x" } }, 0);
    assert.ok(!valid);
  });

  it("should reject indicator without questionId", () => {
    const { valid } = validateEntry({ ...validEntry, indicators: [{ signal: "x" }] }, 0);
    assert.ok(!valid);
  });
});

describe("tradeoff-schema: validateTradeoffs", () => {
  it("should reject non-array input", () => {
    const { valid } = validateTradeoffs("not an array");
    assert.ok(!valid);
  });

  it("should accept empty array", () => {
    const { valid } = validateTradeoffs([]);
    assert.ok(valid);
  });

  it("should detect duplicate IDs", () => {
    const entry = {
      id: "same-id",
      pillars: ["security", "cost"],
      tension: "t",
      sourceQuote: "q",
      source: { doc: "d", section: "s" },
      confidence: "explicit",
      recommendation: "r",
      recommendationSource: { doc: "d", section: "s" },
      indicators: [],
      autonomyNotes: { assistive: "a", delegated: "d", boundedAutonomous: "b", supervisory: "s" },
    };
    const { valid, errors } = validateTradeoffs([entry, { ...entry }]);
    assert.ok(!valid);
    assert.ok(errors.some((e) => e.includes("duplicate")));
  });
});

// ─── Pillar IDs ─────────────────────────────────────────────────────────────

describe("VALID_PILLAR_IDS consistency", () => {
  it("should have 8 pillar IDs", () => {
    assert.equal(VALID_PILLAR_IDS.length, 8);
  });

  it("should match pillars.js IDs", async () => {
    const pillarsPath = path.join(REPO_ROOT, "tools", "aaf-posture", "pillars.js");
    const { PILLARS } = await import(pillarsPath);
    const pillarsIds = PILLARS.map((p) => p.id).sort();
    const schemaIds = [...VALID_PILLAR_IDS].sort();
    assert.deepEqual(schemaIds, pillarsIds);
  });
});

// ─── Extraction prompt exists and has required sections ─────────────────────

describe("extraction prompt", () => {
  const promptPath = path.join(REPO_ROOT, "tools", "scripts", "prompts", "extract-tradeoffs.md");

  it("prompt file should exist", () => {
    assert.ok(fs.existsSync(promptPath));
  });

  it("should contain extraction-only constraint", () => {
    const content = fs.readFileSync(promptPath, "utf8");
    assert.ok(content.includes("Extract only"), "Prompt must contain 'Extract only' constraint");
  });

  it("should contain confidence flagging instruction", () => {
    const content = fs.readFileSync(promptPath, "utf8");
    assert.ok(content.includes("inferred"), "Prompt must instruct about confidence: inferred");
  });

  it("should contain schema definition", () => {
    const content = fs.readFileSync(promptPath, "utf8");
    assert.ok(content.includes("sourceQuote"), "Prompt must include sourceQuote in schema");
    assert.ok(content.includes("autonomyNotes"), "Prompt must include autonomyNotes in schema");
  });

  it("should contain what NOT to do section", () => {
    const content = fs.readFileSync(promptPath, "utf8");
    assert.ok(content.includes("What NOT to do"), "Prompt must have constraints section");
  });
});

// ─── Extraction script structure ────────────────────────────────────────────

describe("extract-tradeoffs.js script", () => {
  const scriptPath = path.join(REPO_ROOT, "tools", "scripts", "extract-tradeoffs.js");

  it("script file should exist", () => {
    assert.ok(fs.existsSync(scriptPath));
  });

  it("should support --dry-run flag", () => {
    const content = fs.readFileSync(scriptPath, "utf8");
    assert.ok(content.includes("--dry-run"));
  });

  it("should use WrangleAI gateway", () => {
    const content = fs.readFileSync(scriptPath, "utf8");
    assert.ok(content.includes("gateway.wrangleai.com"));
  });

  it("should import and use validateTradeoffs", () => {
    const content = fs.readFileSync(scriptPath, "utf8");
    assert.ok(content.includes("validateTradeoffs"));
  });

  it("should verify source quotes", () => {
    const content = fs.readFileSync(scriptPath, "utf8");
    assert.ok(content.includes("verifySourceQuotes"));
  });
});

// ─── trade-offs.json output file ────────────────────────────────────────────

describe("trade-offs.json output", () => {
  const outputPath = path.join(REPO_ROOT, "tools", "data", "trade-offs.json");

  it("output file should exist", () => {
    assert.ok(fs.existsSync(outputPath));
  });

  it("should be valid JSON with _meta and tradeoffs fields", () => {
    const content = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    assert.ok(content._meta, "Missing _meta field");
    assert.ok(Array.isArray(content.tradeoffs), "tradeoffs must be an array");
  });

  it("_meta should reference the prompt file", () => {
    const content = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    assert.ok(
      content._meta.promptFile?.includes("extract-tradeoffs.md"),
      "Meta should reference the extraction prompt"
    );
  });
});
