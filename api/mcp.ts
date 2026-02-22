/**
 * AAF MCP server — Vercel serverless route (Streamable HTTP).
 *
 * Existing tools: aaf_lookup, aaf_checklist, aaf_pillars_summary, aaf_get_skill
 * Design tools:   aaf_design_questions, aaf_tradeoff_analysis, aaf_generate_acc
 * Build tools:    aaf_scaffold_spec
 * Review tools:   aaf_posture_interpret, aaf_review_against_acc
 * Cross-cutting:  aaf_pillar_guidance
 */
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, "docs");
const SKILLS_DIR = path.join(REPO_ROOT, "tools", "skills");
const DATA_DIR = path.join(REPO_ROOT, "tools", "data");
const VALID_SKILL_IDS = [
  "aaf-architecture-review",
  "aaf-security",
  "aaf-epistemic-gates",
  "aaf-cost-context",
  "aaf-cross-cutting",
  "aaf-acc-implementation",
  "aaf-orchestration-occ",
] as const;

const VALID_PILLAR_IDS = [
  "security", "reliability", "cost", "operational-excellence",
  "performance", "sustainability", "context-optimization", "autonomy-governance",
] as const;

const AUTONOMY_LEVELS = ["assistive", "delegated", "bounded-autonomous", "supervisory"] as const;

// ─── Data loading helpers ───────────────────────────────────────────────────

function safeReadFile(p: string): string | null {
  try { return fs.readFileSync(p, "utf8"); } catch { return null; }
}

function safeReadJSON(p: string): any {
  const raw = safeReadFile(p);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function loadPillars(): any[] {
  return safeReadJSON(path.join(DATA_DIR, "pillars.json")) || [];
}

function loadTradeoffs(): any[] {
  const data = safeReadJSON(path.join(DATA_DIR, "trade-offs.json"));
  return data?.tradeoffs || [];
}

// ─── Existing tool helpers ──────────────────────────────────────────────────

function listDocs(): string[] {
  try { return fs.readdirSync(DOCS_DIR).filter((n) => n.endsWith(".md")).sort(); } catch { return []; }
}

function lookupInDocs(query: string): { matches: string[]; excerpt: string | null } {
  const q = query.trim().toLowerCase();
  const docs = listDocs();
  const matches: string[] = [];
  let excerpt: string | null = null;
  for (const doc of docs) {
    const full = path.join(DOCS_DIR, doc);
    if (!full.startsWith(DOCS_DIR)) continue;
    const content = safeReadFile(full);
    if (!content) continue;
    const lower = content.toLowerCase();
    if (lower.includes(q)) {
      matches.push(doc);
      if (!excerpt) {
        const idx = lower.indexOf(q);
        excerpt = content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + q.length + 120)).replace(/\n/g, " ").trim();
      }
    }
  }
  return { matches, excerpt };
}

function getSkillContent(skillId: string): string | null {
  if (!VALID_SKILL_IDS.includes(skillId as any)) return null;
  const fp = path.join(SKILLS_DIR, skillId, "SKILL.md");
  if (!fp.startsWith(SKILLS_DIR)) return null;
  return safeReadFile(fp);
}

function getPillarsSummary(): string {
  const fp = path.join(DOCS_DIR, "05-framework-overview.md");
  const content = safeReadFile(fp);
  if (!content) return "AAF pillars: Security, Reliability, Cost Optimization, Operational Excellence, Performance Efficiency, Sustainability. Cross-cutting: Context Optimization, Autonomy & Outcome Governance.";
  return content.slice(0, 3200) + "\n\n[... see docs/05-framework-overview.md ...]";
}

function getChecklist(kind: string): string {
  const content = getSkillContent("aaf-architecture-review");
  if (!content) return "See docs/15-application-method.md for checklist.";
  const section = content.includes("## Mode 2: Architecture review")
    ? content.slice(content.indexOf("## Mode 2: Architecture review"))
    : content;
  return section.slice(0, 4000) + (section.length > 4000 ? "\n\n[...]" : "");
}

// ─── Design tool helpers ────────────────────────────────────────────────────

function getDesignQuestions(autonomyLevel: string): any[] {
  const pillars = loadPillars();
  return pillars.map((p: any) => ({
    pillarId: p.id,
    pillarName: p.name,
    questions: p.questions.map((q: string, i: number) => ({
      questionId: `${p.id}-q${i + 1}`,
      text: q,
      expectedAnswer: "yes/no/partial",
      phase: "design",
    })),
  }));
}

function analyseTradeoffs(choices: Record<string, Record<string, string>>): any[] {
  const tradeoffs = loadTradeoffs();
  const results: any[] = [];

  for (const entry of tradeoffs) {
    const matched: any[] = [];
    for (const ind of entry.indicators || []) {
      const pillarId = ind.questionId?.split("-q")[0];
      const answers = choices[pillarId];
      if (!answers) continue;
      const userAnswer = answers[ind.questionId];
      if (userAnswer === undefined) continue;
      if (userAnswer.toLowerCase().trim() === (ind.answer || "").toLowerCase().trim()) {
        matched.push(ind);
      }
    }
    if (matched.length > 0) {
      results.push({
        id: entry.id,
        pillars: entry.pillars,
        tension: entry.tension,
        recommendation: entry.recommendation,
        source: entry.source,
        confidence: entry.confidence,
        autonomyNotes: entry.autonomyNotes,
        matchedIndicators: matched,
        matchStrength: matched.length / (entry.indicators?.length || 1),
      });
    }
  }

  return results.sort((a: any, b: any) => b.matchStrength - a.matchStrength);
}

function generateACC(answers: Record<string, Record<string, string>>, autonomyLevel: string, intent: string): string {
  const pillars = loadPillars();
  const tradeoffResults = analyseTradeoffs(answers);

  const yamlLines: string[] = [
    "# Agent Control Contract (ACC)",
    `# Generated by AAF MCP server`,
    `# Intent: ${intent}`,
    "",
    `autonomy_level: ${autonomyLevel}`,
    "",
    "pillars:",
  ];

  for (const p of pillars) {
    yamlLines.push(`  ${p.id}:`);
    const pillarAnswers = answers[p.id] || {};
    for (const q of p.questions) {
      const qId = `${p.id}-q${p.questions.indexOf(q) + 1}`;
      const answer = pillarAnswers[qId] || "not_answered";
      yamlLines.push(`    - question: "${q}"`);
      yamlLines.push(`      answer: "${answer}"`);
    }
  }

  if (tradeoffResults.length > 0) {
    yamlLines.push("");
    yamlLines.push("trade_offs:");
    for (const t of tradeoffResults) {
      yamlLines.push(`  - id: ${t.id}`);
      yamlLines.push(`    tension: "${t.tension}"`);
      yamlLines.push(`    recommendation: "${t.recommendation}"`);
    }
  }

  return yamlLines.join("\n");
}

// ─── Build tool helpers ─────────────────────────────────────────────────────

function getScaffoldSpec(autonomyLevel: string): any {
  const baseFiles = [
    { path: "agent.py", purpose: "Main agent entry point with control loop" },
    { path: "policy.yaml", purpose: "Agent Control Contract (copied from design phase)" },
    { path: "tools/__init__.py", purpose: "Tool definitions with permission scopes" },
    { path: "gates.py", purpose: "Validation and epistemic gate implementations" },
    { path: "budgets.py", purpose: "Budget enforcement (steps, tokens, time, spend)" },
    { path: "observability.py", purpose: "Tracing hooks for observability trace" },
    { path: "tests/test_compliance.py", purpose: "Skeleton tests validating ACC compliance" },
    { path: "AGENTS.md", purpose: "Repository operating instructions" },
    { path: "AGENT_CONTROL_CONTRACT.md", purpose: "Human-readable ACC" },
    { path: "requirements.txt", purpose: "Python dependencies" },
  ];

  const levelDetails: Record<string, string> = {
    assistive: "Agent drafts, human approves everything. All tool calls gated.",
    delegated: "Agent proposes plans, human approves execution of write/delete actions.",
    "bounded-autonomous": "Agent executes within budgets, escalates on exceptions. Pre-approved action scopes.",
    supervisory: "Supervisor + worker pattern with nested sub-contracts.",
  };

  return {
    autonomyLevel,
    levelDescription: levelDetails[autonomyLevel] || levelDetails["delegated"],
    files: baseFiles,
    controlLoop: "Trigger → Interpret Context → Decide → Act → Observe Results → Verify → [Adapt / Stop]",
    observabilityTrace: "intent → plan → act → verify",
  };
}

// ─── Review tool helpers ────────────────────────────────────────────────────

function interpretPosture(report: Record<string, any[]>): any {
  const tradeoffs = loadTradeoffs();
  const scores: Record<string, number> = {};

  for (const [pillarId, results] of Object.entries(report)) {
    if (!Array.isArray(results)) continue;
    const found = results.filter((r: any) => r.status === "found").length;
    scores[pillarId] = results.length > 0 ? found / results.length : 0;
  }

  const tensions: any[] = [];
  for (const entry of tradeoffs) {
    const [pA, pB] = entry.pillars;
    const sA = scores[pA]; const sB = scores[pB];
    if (sA === undefined || sB === undefined) continue;
    const delta = Math.abs(sA - sB);
    if (delta >= 0.3) {
      tensions.push({
        id: entry.id, pillars: entry.pillars, tension: entry.tension,
        recommendation: entry.recommendation, source: entry.source,
        highPillar: sA > sB ? pA : pB, lowPillar: sA > sB ? pB : pA, scoreDelta: delta,
      });
    }
  }

  return { scores, tensions: tensions.sort((a: any, b: any) => b.scoreDelta - a.scoreDelta) };
}

function reviewAgainstACC(accYaml: string, report: Record<string, any[]>): any {
  const gaps: any[] = [];
  const pillars = loadPillars();

  for (const pillar of pillars) {
    const pillarResults = report[pillar.id];
    if (!Array.isArray(pillarResults)) continue;

    for (const result of pillarResults) {
      if (result.status === "not_found") {
        const accMentions = accYaml.includes(result.question);
        gaps.push({
          pillarId: pillar.id,
          question: result.question,
          severity: accMentions ? "high" : "medium",
          detail: accMentions
            ? "Specified in ACC but not detected in codebase"
            : "Not detected in codebase",
        });
      }
    }
  }

  return {
    totalGaps: gaps.length,
    gaps: gaps.sort((a: any, b: any) => (a.severity === "high" ? -1 : 1) - (b.severity === "high" ? -1 : 1)),
  };
}

// ─── Pillar guidance helper ─────────────────────────────────────────────────

function getPillarGuidance(pillarId: string): any {
  const pillars = loadPillars();
  const tradeoffs = loadTradeoffs();
  const pillar = pillars.find((p: any) => p.id === pillarId);

  if (!pillar) return null;

  const relevantTradeoffs = tradeoffs.filter((t: any) => t.pillars.includes(pillarId));

  return {
    pillarId: pillar.id,
    pillarName: pillar.name,
    questions: pillar.questions,
    tradeoffs: relevantTradeoffs.map((t: any) => ({
      id: t.id,
      otherPillar: t.pillars.find((p: string) => p !== pillarId),
      tension: t.tension,
      recommendation: t.recommendation,
      source: t.source,
      confidence: t.confidence,
      autonomyNotes: t.autonomyNotes,
    })),
  };
}

// ─── MCP server registration ────────────────────────────────────────────────

const baseHandler = createMcpHandler(
  (server) => {
    // ── Existing tools ──────────────────────────────────────────────────

    server.registerTool("aaf_lookup", {
      title: "AAF Lookup",
      description: "Look up a term or topic in the AAF framework docs. Returns matching docs and an excerpt.",
      inputSchema: { query: z.string().min(1) },
    }, async ({ query }) => {
      const { matches, excerpt } = lookupInDocs(query);
      const text = matches.length
        ? `Matches: ${matches.join(", ")}\n${excerpt ? `Excerpt: ${excerpt}` : ""}`
        : `No docs matched "${query}".`;
      return { content: [{ type: "text", text }] };
    });

    server.registerTool("aaf_checklist", {
      title: "AAF Checklist",
      description: "Return the AAF architecture review checklist (pre-production readiness).",
      inputSchema: { kind: z.enum(["review", "design"]).optional() },
    }, async ({ kind }) => ({
      content: [{ type: "text", text: getChecklist(kind ?? "review") }],
    }));

    server.registerTool("aaf_pillars_summary", {
      title: "AAF Pillars Summary",
      description: "Short summary of the six AAF pillars and cross-cutting foundations.",
      inputSchema: {},
    }, async () => ({
      content: [{ type: "text", text: getPillarsSummary() }],
    }));

    server.registerTool("aaf_get_skill", {
      title: "AAF Get Skill",
      description: "Return full content of an AAF skill by id.",
      inputSchema: { skillId: z.enum(VALID_SKILL_IDS) },
    }, async ({ skillId }) => {
      const text = getSkillContent(skillId);
      if (!text) return { content: [{ type: "text", text: `Skill not found: ${skillId}` }], isError: true };
      return { content: [{ type: "text", text }] };
    });

    // ── Design-phase tools ──────────────────────────────────────────────

    server.registerTool("aaf_design_questions", {
      title: "AAF Design Questions",
      description: "Return the full design questionnaire for a given autonomy level. Each question includes pillar ID, question ID, and expected answer format. Use this to know what to ask when designing an agent.",
      inputSchema: {
        autonomyLevel: z.enum(AUTONOMY_LEVELS).describe("The autonomy level of the agent being designed"),
      },
    }, async ({ autonomyLevel }) => {
      const questions = getDesignQuestions(autonomyLevel);
      return { content: [{ type: "text", text: JSON.stringify({ autonomyLevel, pillars: questions }, null, 2) }] };
    });

    server.registerTool("aaf_tradeoff_analysis", {
      title: "AAF Trade-off Analysis",
      description: "Given design choices (per-pillar answers), return active trade-offs, tensions, and framework-grounded recommendations. This is the deterministic trade-off engine — same input always produces the same output.",
      inputSchema: {
        choices: z.record(z.record(z.string())).describe("Design answers keyed by pillar ID then question ID. Example: { 'security': { 'security-q3': 'yes' } }"),
      },
    }, async ({ choices }) => {
      const results = analyseTradeoffs(choices);
      if (results.length === 0) {
        return { content: [{ type: "text", text: "No trade-off tensions detected for the given design choices. This may mean the trade-offs data model is empty — run the extraction pipeline first." }] };
      }
      return { content: [{ type: "text", text: JSON.stringify({ activeTradeoffs: results.length, tradeoffs: results }, null, 2) }] };
    });

    server.registerTool("aaf_generate_acc", {
      title: "AAF Generate ACC",
      description: "Given completed design answers and an autonomy level, generate an Agent Control Contract (ACC) in YAML format. The ACC is the machine-readable design contract for the agent.",
      inputSchema: {
        answers: z.record(z.record(z.string())).describe("Design answers keyed by pillar ID then question ID"),
        autonomyLevel: z.enum(AUTONOMY_LEVELS),
        intent: z.string().describe("One-line description of what the agent does"),
      },
    }, async ({ answers, autonomyLevel, intent }) => {
      const acc = generateACC(answers, autonomyLevel, intent);
      return { content: [{ type: "text", text: acc }] };
    });

    // ── Build-phase tools ───────────────────────────────────────────────

    server.registerTool("aaf_scaffold_spec", {
      title: "AAF Scaffold Spec",
      description: "Given an autonomy level, return the file manifest that aaf build would generate: file paths, purposes, and the control loop structure. Use this to understand what to build or to generate the code yourself.",
      inputSchema: {
        autonomyLevel: z.enum(AUTONOMY_LEVELS),
      },
    }, async ({ autonomyLevel }) => {
      const spec = getScaffoldSpec(autonomyLevel);
      return { content: [{ type: "text", text: JSON.stringify(spec, null, 2) }] };
    });

    // ── Review-phase tools ──────────────────────────────────────────────

    server.registerTool("aaf_posture_interpret", {
      title: "AAF Posture Interpret",
      description: "Given a posture report (JSON from aaf posture --format json), return per-pillar scores, active trade-off tensions based on score imbalances, and prioritised recommendations.",
      inputSchema: {
        report: z.record(z.array(z.object({
          question: z.string(),
          status: z.enum(["found", "not_found", "unclear"]),
          evidence: z.string().optional(),
        }))).describe("Posture report keyed by pillar ID"),
      },
    }, async ({ report }) => {
      const interpretation = interpretPosture(report);
      return { content: [{ type: "text", text: JSON.stringify(interpretation, null, 2) }] };
    });

    server.registerTool("aaf_review_against_acc", {
      title: "AAF Review Against ACC",
      description: "Given an ACC (YAML string) and a posture report (JSON), return a gap analysis: where the implementation diverges from the design contract, with severity ratings.",
      inputSchema: {
        accYaml: z.string().describe("The Agent Control Contract as a YAML string"),
        report: z.record(z.array(z.object({
          question: z.string(),
          status: z.enum(["found", "not_found", "unclear"]),
          evidence: z.string().optional(),
        }))).describe("Posture report keyed by pillar ID"),
      },
    }, async ({ accYaml, report }) => {
      const gaps = reviewAgainstACC(accYaml, report);
      return { content: [{ type: "text", text: JSON.stringify(gaps, null, 2) }] };
    });

    // ── Cross-cutting tools ─────────────────────────────────────────────

    server.registerTool("aaf_pillar_guidance", {
      title: "AAF Pillar Guidance",
      description: "Given a pillar ID, return targeted design considerations: the pillar's review questions, all cross-pillar trade-offs involving this pillar with recommendations and source citations, and autonomy-level notes.",
      inputSchema: {
        pillarId: z.enum(VALID_PILLAR_IDS),
      },
    }, async ({ pillarId }) => {
      const guidance = getPillarGuidance(pillarId);
      if (!guidance) return { content: [{ type: "text", text: `Pillar not found: ${pillarId}` }], isError: true };
      return { content: [{ type: "text", text: JSON.stringify(guidance, null, 2) }] };
    });
  },
  {},
  { basePath: "/api", maxDuration: 30 }
);

// ─── Auth ───────────────────────────────────────────────────────────────────

const verifyToken = async (
  _req: Request,
  bearerToken?: string
): Promise<{ token: string; scopes: string[]; clientId: string } | undefined> => {
  const apiKey = process.env.MCP_API_KEY;
  if (!apiKey) return undefined;
  if (!bearerToken || bearerToken !== apiKey) return undefined;
  return { token: bearerToken, scopes: ["read:aaf"], clientId: "api-key" };
};

const authHandler = withMcpAuth(baseHandler, verifyToken, {
  required: false,
  requiredScopes: ["read:aaf"],
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export const GET = authHandler;
export const POST = authHandler;
export const DELETE = authHandler;
