/**
 * Config for sync-from-docs.js.
 * Cross-cutting pillar questions are maintained here (source: docs/12, docs/13).
 * When you update those docs, update this config so the CLI and skills stay aligned.
 */
export const CROSS_CUTTING_PILLARS = [
  {
    id: "context-optimization",
    name: "Context Optimization (cross-cutting)",
    questions: [
      "Is context separated from memory (task-scoped vs durable)?",
      "Is context budgeted per task/step with explicit allocations?",
      "Is provenance tracked (trusted policy vs untrusted data)?",
      "Is retrieval/context construction minimal and explainable?",
    ],
  },
  {
    id: "autonomy-governance",
    name: "Autonomy & Outcome Governance (cross-cutting)",
    questions: [
      "Is autonomy level declared (assistive, delegated, bounded autonomous, supervisory)?",
      "Is there a Definition of Done with acceptance checks and evidence per task class?",
      "Are budgets (steps/tools/tokens/time/spend) enforced and visible?",
      "Are escalation triggers and degraded modes defined?",
    ],
  },
];

/** Map doc 15 pillar heading line to pillar id and display name for pillars.js */
export const DOC15_PILLAR_MAP = {
  "Security Architecture": { id: "security", name: "Security Architecture" },
  Reliability: { id: "reliability", name: "Reliability" },
  "Cost Optimization": { id: "cost", name: "Cost Optimization" },
  "Operational Excellence": { id: "operational-excellence", name: "Operational Excellence" },
  "Performance Efficiency": { id: "performance", name: "Performance Efficiency" },
  Sustainability: { id: "sustainability", name: "Sustainability" },
};
