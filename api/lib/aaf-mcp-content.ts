/**
 * Shared content helpers for the AAF MCP server (docs, playbook, workloads, trade-offs).
 */
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = process.cwd();
export const DOCS_DIR = path.join(REPO_ROOT, "docs");
export const SKILLS_DIR = path.join(REPO_ROOT, "tools", "skills");
export const DATA_DIR = path.join(REPO_ROOT, "tools", "data");

export const VALID_SKILL_IDS = [
  "aaf-architecture-review",
  "aaf-security",
  "aaf-epistemic-gates",
  "aaf-cost-context",
  "aaf-cross-cutting",
  "aaf-acc-implementation",
  "aaf-orchestration-occ",
] as const;

export const VALID_WORKLOAD_IDS = [
  "knowledge-assistant",
  "customer-chatbot",
  "internal-copilot",
  "workflow-agent",
] as const;

export function safeReadFile(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function safeReadJSON(p: string): any {
  const raw = safeReadFile(p);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadPlaybook(): any {
  return (
    safeReadJSON(path.join(DATA_DIR, "mcp-playbook.json")) || {
      intents: {},
      skills: [],
      serverInstructions: "",
    }
  );
}

export function loadWorkloadsData(): any {
  return (
    safeReadJSON(path.join(DATA_DIR, "workloads.json")) || {
      workloads: [],
      complexityHeuristic: [],
      costAccuracySpeed: {},
    }
  );
}

export function loadPillarTradeoffs(): any[] {
  const data = safeReadJSON(path.join(DATA_DIR, "trade-offs.json"));
  return data?.tradeoffs || [];
}

export function loadWorkloadTradeoffs(): any[] {
  const data = safeReadJSON(path.join(DATA_DIR, "workload-trade-offs.json"));
  return data?.tradeoffs || [];
}

/** All trade-offs (pillar + workload-tagged). */
export function loadAllTradeoffs(workloadId?: string): any[] {
  const pillar = loadPillarTradeoffs();
  let workload = loadWorkloadTradeoffs();
  if (workloadId) {
    workload = workload.filter((t: any) => t.workloadId === workloadId);
  }
  return [...pillar, ...workload];
}

export function listDocs(): string[] {
  try {
    return fs.readdirSync(DOCS_DIR).filter((n) => n.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function frontmatterTitle(content: string, fallback: string): string {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (m) {
    const title = m[1].match(/^title:\s*["']?(.*?)["']?\s*$/m);
    if (title) return title[1].replace(/^#+\s*/, "").trim();
  }
  const h1 = content.match(/^#\s+\*?\*?(.+?)\*?\*?\s*$/m);
  return h1 ? h1[1].trim() : fallback;
}

export function listDocsMeta(): { doc: string; title: string }[] {
  return listDocs().map((doc) => {
    const content = safeReadFile(path.join(DOCS_DIR, doc)) || "";
    return { doc, title: frontmatterTitle(content, doc) };
  });
}

export function resolveDocPath(docId: string): string | null {
  const base = path.basename(docId);
  if (!base.endsWith(".md")) return null;
  if (base !== docId && docId.includes("..")) return null;
  const full = path.join(DOCS_DIR, base);
  if (!full.startsWith(DOCS_DIR)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

export function getDocContent(
  docId: string,
  opts?: { section?: string; maxChars?: number; offset?: number }
): { text: string; truncated: boolean; doc: string; title: string } | { error: string } {
  const full = resolveDocPath(docId);
  if (!full) return { error: `Doc not found or invalid path: ${docId}` };
  let content = safeReadFile(full);
  if (!content) return { error: `Could not read: ${docId}` };
  const title = frontmatterTitle(content, path.basename(full));

  if (opts?.section) {
    const needle = opts.section.trim().toLowerCase();
    const lines = content.split("\n");
    let start = -1;
    let end = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^#{1,3}\s/.test(line) && line.toLowerCase().includes(needle)) {
        start = i;
        const level = line.match(/^(#{1,3})\s/)?.[1].length || 2;
        for (let j = i + 1; j < lines.length; j++) {
          const m = lines[j].match(/^(#{1,3})\s/);
          if (m && m[1].length <= level) {
            end = j;
            break;
          }
        }
        break;
      }
    }
    if (start >= 0) content = lines.slice(start, end).join("\n");
    else return { error: `Section not found in ${path.basename(full)}: ${opts.section}` };
  }

  const offset = Math.max(0, opts?.offset || 0);
  const maxChars = opts?.maxChars ?? 8000;
  const slice = content.slice(offset, offset + maxChars);
  const truncated = offset + maxChars < content.length;
  let text = slice;
  if (truncated) {
    text += `\n\n[... truncated at ${offset + maxChars}/${content.length} chars; call aaf_get_doc again with offset=${offset + maxChars} ...]`;
  }
  return { text, truncated, doc: path.basename(full), title };
}

export function lookupInDocs(
  query: string
): { matches: { doc: string; excerpt: string; score: number }[]; hint: string } {
  const q = query.trim().toLowerCase();
  const docs = listDocs();
  const matches: { doc: string; excerpt: string; score: number }[] = [];
  if (!q) return { matches, hint: "Provide a non-empty query." };

  for (const doc of docs) {
    const full = path.join(DOCS_DIR, doc);
    if (!full.startsWith(DOCS_DIR)) continue;
    const content = safeReadFile(full);
    if (!content) continue;
    const lower = content.toLowerCase();
    if (!lower.includes(q)) continue;
    const idx = lower.indexOf(q);
    const excerpt = content
      .slice(Math.max(0, idx - 120), Math.min(content.length, idx + q.length + 900))
      .replace(/\n/g, " ")
      .trim();
    const occurrences = lower.split(q).length - 1;
    const inTitle = frontmatterTitle(content, doc).toLowerCase().includes(q) ? 5 : 0;
    matches.push({ doc, excerpt, score: occurrences + inTitle });
  }

  matches.sort((a, b) => b.score - a.score);
  return {
    matches: matches.slice(0, 12),
    hint: matches.length
      ? "Use aaf_get_doc with a doc filename for the full section."
      : `No docs matched "${query}". Try aaf_list_docs or aaf_list_workloads.`,
  };
}

export function getSkillContent(skillId: string): string | null {
  if (!VALID_SKILL_IDS.includes(skillId as any)) return null;
  const fp = path.join(SKILLS_DIR, skillId, "SKILL.md");
  if (!fp.startsWith(SKILLS_DIR)) return null;
  return safeReadFile(fp);
}

export function getPillarsSummary(): string {
  const fp = path.join(DOCS_DIR, "05-framework-overview.md");
  const content = safeReadFile(fp);
  if (!content) {
    return "AAF pillars: Security, Reliability, Cost Optimization, Operational Excellence, Performance Efficiency, Sustainability. Cross-cutting: Context Optimization, Autonomy & Outcome Governance.";
  }
  return content.slice(0, 3200) + "\n\n[... see docs/05-framework-overview.md via aaf_get_doc ...]";
}

export function getChecklist(kind: string): string {
  const content = getSkillContent("aaf-architecture-review");
  if (!content) return "See docs/15-application-method.md for checklist (aaf_get_doc).";
  const designMarker = "## Mode 1:";
  const reviewMarker = "## Mode 2: Architecture review";
  if (kind === "design" && content.includes(designMarker)) {
    const start = content.indexOf(designMarker);
    const end = content.includes(reviewMarker) ? content.indexOf(reviewMarker) : content.length;
    const section = content.slice(start, end);
    return section.slice(0, 4000) + (section.length > 4000 ? "\n\n[...]" : "");
  }
  const section = content.includes(reviewMarker)
    ? content.slice(content.indexOf(reviewMarker))
    : content;
  return section.slice(0, 4000) + (section.length > 4000 ? "\n\n[...]" : "");
}

export function getGuide(intent?: string, question?: string): any {
  const playbook = loadPlaybook();
  const key = (intent || "general").toLowerCase();
  const entry = playbook.intents?.[key] || playbook.intents?.general;
  return {
    intent: key,
    question: question || null,
    summary: entry?.summary || "Call aaf_guide with intent design|workload|tradeoffs|review|security|lookup|build.",
    steps: entry?.steps || [],
    tip: "For new systems prefer workload-first: aaf_list_workloads → aaf_workload_guidance → design → trade-offs → ACC.",
    complexityHeuristic: loadWorkloadsData().complexityHeuristic || [],
  };
}

export function listSkills(): any[] {
  const playbook = loadPlaybook();
  if (Array.isArray(playbook.skills) && playbook.skills.length) return playbook.skills;
  return VALID_SKILL_IDS.map((id) => ({ id, purpose: "See aaf_get_skill" }));
}

export function listWorkloadsCompact(): any {
  const data = loadWorkloadsData();
  return {
    complexityHeuristic: data.complexityHeuristic || [],
    costAccuracySpeed: data.costAccuracySpeed || {},
    workloads: (data.workloads || []).map((w: any) => ({
      id: w.id,
      title: w.title,
      intent: w.intent,
      doc: w.doc,
      complexityDefault: w.complexityDefault,
    })),
  };
}

export function getWorkloadGuidance(workloadId: string, includeDoc: boolean): any {
  const data = loadWorkloadsData();
  const w = (data.workloads || []).find((x: any) => x.id === workloadId);
  if (!w) return { error: `Unknown workloadId: ${workloadId}. Use aaf_list_workloads.` };
  const workloadTrades = loadWorkloadTradeoffs().filter((t: any) => t.workloadId === workloadId);
  const result: any = { ...w, structuredWorkloadTradeoffs: workloadTrades };
  if (includeDoc && w.doc) {
    const doc = getDocContent(w.doc, { maxChars: 6000 });
    result.docExcerpt = doc;
  }
  return result;
}

/** Deterministic keyword overlap ranking for workload selection. */
export function rankWorkloads(requirements: string): any[] {
  const q = requirements.toLowerCase();
  const tokens = q.split(/[^a-z0-9+]+/).filter((t) => t.length > 2);
  const data = loadWorkloadsData();
  return (data.workloads || [])
    .map((w: any) => {
      const hay = [w.id, w.title, w.intent, w.whenNotThis, ...(w.keywords || []), ...(w.criticalDecisions || [])]
        .join(" ")
        .toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += 1;
      }
      for (const kw of w.keywords || []) {
        if (q.includes(String(kw).toLowerCase())) score += 2;
      }
      return {
        id: w.id,
        title: w.title,
        intent: w.intent,
        doc: w.doc,
        score,
        why: score > 0 ? "Keyword overlap with requirements" : "Low overlap — still consider nearest fit",
      };
    })
    .sort((a: any, b: any) => b.score - a.score);
}

export function tradeoffCatalog(workloadId?: string): any[] {
  return loadAllTradeoffs(workloadId).map((t: any) => ({
    id: t.id,
    pillars: t.pillars,
    workloadId: t.workloadId || null,
    tension: t.tension,
    tags: t.tags || [],
  }));
}

export function analyseTradeoffs(
  choices: Record<string, Record<string, string>>,
  workloadId?: string
): any[] {
  const tradeoffs = loadAllTradeoffs();
  const results: any[] = [];

  for (const entry of tradeoffs) {
    if (workloadId && entry.workloadId && entry.workloadId !== workloadId) continue;

    const indicators = entry.indicators || [];
    if (indicators.length === 0 && entry.workloadId) {
      if (!workloadId || entry.workloadId === workloadId) {
        results.push({
          id: entry.id,
          pillars: entry.pillars,
          workloadId: entry.workloadId,
          tension: entry.tension,
          recommendation: entry.recommendation,
          source: entry.source,
          confidence: entry.confidence,
          matchStrength: workloadId === entry.workloadId ? 1 : 0.5,
          matchedIndicators: [],
          note: "Workload-scoped trade-off (always relevant when this workload is selected).",
        });
      }
      continue;
    }

    const matched: any[] = [];
    for (const ind of indicators) {
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
        workloadId: entry.workloadId || null,
        tension: entry.tension,
        recommendation: entry.recommendation,
        source: entry.source,
        confidence: entry.confidence,
        autonomyNotes: entry.autonomyNotes,
        matchedIndicators: matched,
        matchStrength: matched.length / (indicators.length || 1),
      });
    }
  }

  return results.sort((a: any, b: any) => b.matchStrength - a.matchStrength);
}

export function serverInstructions(): string {
  const playbook = loadPlaybook();
  return (
    playbook.serverInstructions ||
    "AAF is the authority for agentic architecture. Call aaf_guide if unsure which tool to use. Prefer workload-first design."
  );
}
