/**
 * Trade-off engine tests — Step 3 gate.
 * Run: node --test tools/tests/engine.test.js
 *
 * Tests the deterministic pattern matcher and doc block renderer.
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  matchByDesignAnswers,
  matchByPostureScores,
  getTradeoffsForPillar,
  groupByPillar,
  clearCache,
} from "../engine/matcher.js";
import { renderPillarBlock, injectBlock } from "../engine/renderer.js";

const FIXTURE_TRADEOFFS = [
  {
    id: "security-x-cost",
    pillars: ["security", "cost"],
    tension: "Every validation gate costs tokens and time.",
    sourceQuote: "Cost optimization sits tightly adjacent to Security",
    source: { doc: "docs/08-pillar-cost.md", section: "7.8", lines: "202-210" },
    confidence: "explicit",
    recommendation: "Gate writes and high-risk actions only; use lightweight checks for reads.",
    recommendationSource: { doc: "docs/06-pillar-security.md", section: "5.3" },
    indicators: [
      { questionId: "security-q3", answer: "yes", signal: "write gates enabled" },
      { questionId: "cost-q1", answer: "no", signal: "no budget enforcement" },
    ],
    autonomyNotes: {
      assistive: "Gates are advisory; human approves all",
      delegated: "Human approves write/delete actions",
      boundedAutonomous: "Pre-approved scopes with hard limits",
      supervisory: "Nested sub-contracts inherit constraints",
    },
  },
  {
    id: "security-x-performance",
    pillars: ["security", "performance"],
    tension: "Approval gates add latency on interactive paths.",
    sourceQuote: "Human-in-the-loop adds latency",
    source: { doc: "docs/10-pillar-performance.md", section: "9.1" },
    confidence: "explicit",
    recommendation: "Use async approval for non-blocking paths.",
    recommendationSource: { doc: "docs/10-pillar-performance.md", section: "9.1" },
    indicators: [
      { questionId: "security-q3", answer: "yes", signal: "write gates enabled" },
      { questionId: "performance-q2", answer: "no", signal: "round trips not minimized" },
    ],
    autonomyNotes: {
      assistive: "All actions gated, latency accepted",
      delegated: "Approval on write path only",
      boundedAutonomous: "Pre-approved patterns skip gates",
      supervisory: "Supervisor approves, workers execute fast",
    },
  },
  {
    id: "cost-x-reliability",
    pillars: ["cost", "reliability"],
    tension: "Retries and redundancy increase spend.",
    sourceQuote: "budget-aware methods improve cost-performance tradeoffs",
    source: { doc: "docs/08-pillar-cost.md", section: "7.2" },
    confidence: "explicit",
    recommendation: "Use verification-based stopping to bound retries.",
    recommendationSource: { doc: "docs/07-pillar-reliability.md", section: "6.4" },
    indicators: [
      { questionId: "reliability-q4", answer: "yes", signal: "retries enabled" },
      { questionId: "cost-q1", answer: "no", signal: "no budget enforcement" },
    ],
    autonomyNotes: {
      assistive: "Not explicitly discussed in source documents",
      delegated: "Not explicitly discussed in source documents",
      boundedAutonomous: "Not explicitly discussed in source documents",
      supervisory: "Not explicitly discussed in source documents",
    },
  },
];

// ─── Pattern matcher ────────────────────────────────────────────────────────

describe("matcher: matchByDesignAnswers", () => {
  beforeEach(() => clearCache());

  it("should return matching trade-offs when indicators match", () => {
    const answers = {
      security: { "security-q3": "yes" },
      cost: { "cost-q1": "no" },
    };
    const results = matchByDesignAnswers(answers, FIXTURE_TRADEOFFS);
    assert.ok(results.length > 0);
    assert.ok(results.some((r) => r.id === "security-x-cost"));
  });

  it("should return empty when no indicators match", () => {
    const answers = {
      security: { "security-q3": "no" },
      cost: { "cost-q1": "yes" },
    };
    const results = matchByDesignAnswers(answers, FIXTURE_TRADEOFFS);
    assert.equal(results.length, 0);
  });

  it("should include matchStrength", () => {
    const answers = {
      security: { "security-q3": "yes" },
      cost: { "cost-q1": "no" },
    };
    const results = matchByDesignAnswers(answers, FIXTURE_TRADEOFFS);
    const secCost = results.find((r) => r.id === "security-x-cost");
    assert.ok(secCost);
    assert.equal(secCost.matchStrength, 1.0);
  });

  it("should handle partial indicator matches", () => {
    const answers = {
      security: { "security-q3": "yes" },
    };
    const results = matchByDesignAnswers(answers, FIXTURE_TRADEOFFS);
    const secCost = results.find((r) => r.id === "security-x-cost");
    assert.ok(secCost);
    assert.equal(secCost.matchStrength, 0.5);
  });

  it("should sort by matchStrength descending", () => {
    const answers = {
      security: { "security-q3": "yes" },
      cost: { "cost-q1": "no" },
      performance: { "performance-q2": "no" },
    };
    const results = matchByDesignAnswers(answers, FIXTURE_TRADEOFFS);
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].matchStrength >= results[i].matchStrength);
    }
  });
});

describe("matcher: matchByDesignAnswers determinism", () => {
  it("should produce identical output for identical input across 100 runs", () => {
    const answers = {
      security: { "security-q3": "yes" },
      cost: { "cost-q1": "no" },
      reliability: { "reliability-q4": "yes" },
    };
    const first = JSON.stringify(matchByDesignAnswers(answers, FIXTURE_TRADEOFFS));
    for (let i = 0; i < 100; i++) {
      assert.equal(JSON.stringify(matchByDesignAnswers(answers, FIXTURE_TRADEOFFS)), first);
    }
  });
});

describe("matcher: matchByPostureScores", () => {
  it("should flag imbalanced pillar pairs", () => {
    const scores = { security: 0.9, cost: 0.3, performance: 0.7, reliability: 0.5 };
    const results = matchByPostureScores(scores, 0.3, FIXTURE_TRADEOFFS);
    assert.ok(results.some((r) => r.id === "security-x-cost"));
    assert.ok(results.find((r) => r.id === "security-x-cost").highPillar === "security");
  });

  it("should not flag balanced pairs", () => {
    const scores = { security: 0.7, cost: 0.7, performance: 0.7, reliability: 0.7 };
    const results = matchByPostureScores(scores, 0.3, FIXTURE_TRADEOFFS);
    assert.equal(results.length, 0);
  });

  it("should sort by scoreDelta descending", () => {
    const scores = { security: 1.0, cost: 0.1, performance: 0.4, reliability: 0.5 };
    const results = matchByPostureScores(scores, 0.3, FIXTURE_TRADEOFFS);
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].scoreDelta >= results[i].scoreDelta);
    }
  });
});

describe("matcher: getTradeoffsForPillar", () => {
  it("should return all trade-offs involving the pillar", () => {
    const results = getTradeoffsForPillar("security", FIXTURE_TRADEOFFS);
    assert.equal(results.length, 2);
  });

  it("should return empty for pillar with no trade-offs", () => {
    const results = getTradeoffsForPillar("sustainability", FIXTURE_TRADEOFFS);
    assert.equal(results.length, 0);
  });
});

describe("matcher: groupByPillar", () => {
  it("should group correctly", () => {
    const grouped = groupByPillar(FIXTURE_TRADEOFFS);
    assert.equal(grouped["security"].length, 2);
    assert.equal(grouped["cost"].length, 2);
    assert.equal(grouped["performance"].length, 1);
    assert.equal(grouped["reliability"].length, 1);
  });
});

// ─── Doc block renderer ─────────────────────────────────────────────────────

describe("renderer: renderPillarBlock", () => {
  it("should return null for pillar with no trade-offs", () => {
    const block = renderPillarBlock("sustainability", FIXTURE_TRADEOFFS);
    assert.equal(block, null);
  });

  it("should render a block with markers for security", () => {
    const block = renderPillarBlock("security", FIXTURE_TRADEOFFS);
    assert.ok(block);
    assert.ok(block.includes("AAF-ENGINE:START"));
    assert.ok(block.includes("AAF-ENGINE:END"));
  });

  it("should include trade-off content", () => {
    const block = renderPillarBlock("security", FIXTURE_TRADEOFFS);
    assert.ok(block.includes("Security x Cost"));
    assert.ok(block.includes("Security x Performance"));
    assert.ok(block.includes("Gate writes"));
  });

  it("should include autonomy notes", () => {
    const block = renderPillarBlock("security", FIXTURE_TRADEOFFS);
    assert.ok(block.includes("Assistive"));
    assert.ok(block.includes("Delegated"));
    assert.ok(block.includes("Bounded Autonomous"));
  });

  it("should include source citations", () => {
    const block = renderPillarBlock("security", FIXTURE_TRADEOFFS);
    assert.ok(block.includes("source: 7.8"));
    assert.ok(block.includes("source: 9.1"));
  });
});

describe("renderer: renderPillarBlock determinism (idempotency)", () => {
  it("should produce identical output across 100 runs", () => {
    const first = renderPillarBlock("security", FIXTURE_TRADEOFFS);
    for (let i = 0; i < 100; i++) {
      assert.equal(renderPillarBlock("security", FIXTURE_TRADEOFFS), first);
    }
  });
});

// ─── Marker injection ───────────────────────────────────────────────────────

describe("renderer: injectBlock", () => {
  const block = "<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->\nTest content\n<!-- AAF-ENGINE:END -->";

  it("should replace existing markers", () => {
    const doc = "Before\n<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->\nOld content\n<!-- AAF-ENGINE:END -->\nAfter";
    const { content, changed } = injectBlock(doc, block);
    assert.ok(changed);
    assert.ok(content.includes("Test content"));
    assert.ok(!content.includes("Old content"));
    assert.ok(content.includes("Before"));
    assert.ok(content.includes("After"));
  });

  it("should preserve community content outside markers", () => {
    const community = "# My Pillar\n\nSome community content about security.\n\n";
    const citations = "## Section 5 Citations (Sources & Links)\n\n1. Source one\n";
    const doc = community + "<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->\nOld\n<!-- AAF-ENGINE:END -->\n" + citations;
    const { content } = injectBlock(doc, block);
    assert.ok(content.includes("My Pillar"));
    assert.ok(content.includes("Some community content"));
    assert.ok(content.includes("Citations"));
  });

  it("should insert before citations if no markers exist", () => {
    const doc = "# Pillar\n\nContent\n\n## Section 5 Citations (Sources & Links)\n\n1. Source\n";
    const { content, changed } = injectBlock(doc, block);
    assert.ok(changed);
    const markerIdx = content.indexOf("AAF-ENGINE:START");
    const citationsIdx = content.indexOf("Citations");
    assert.ok(markerIdx < citationsIdx, "Block should be before citations");
  });

  it("should append if no markers and no citations", () => {
    const doc = "# Pillar\n\nContent only";
    const { content, changed } = injectBlock(doc, block);
    assert.ok(changed);
    assert.ok(content.includes("Test content"));
  });

  it("should be idempotent (inject twice = same result)", () => {
    const doc = "Before\n<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->\nOld\n<!-- AAF-ENGINE:END -->\nAfter";
    const { content: first } = injectBlock(doc, block);
    const { content: second } = injectBlock(first, block);
    assert.equal(first, second);
  });

  it("should return unchanged if block is null", () => {
    const doc = "Some content";
    const { content, changed } = injectBlock(doc, null);
    assert.equal(content, doc);
    assert.equal(changed, false);
  });
});
