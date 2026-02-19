/**
 * Read-only content access for docs/ and tools/skills/.
 * Paths resolved relative to repo root (parent of tools/).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DOCS_DIR = path.join(REPO_ROOT, "docs");
const SKILLS_DIR = path.join(REPO_ROOT, "tools", "skills");

const VALID_SKILL_IDS = [
  "aaf-architecture-review",
  "aaf-security",
  "aaf-epistemic-gates",
  "aaf-cost-context",
];

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

export function getDocList() {
  try {
    const names = fs.readdirSync(DOCS_DIR);
    return names.filter((n) => n.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

export function getDocContent(docName) {
  const fullPath = path.join(DOCS_DIR, docName);
  if (!fullPath.startsWith(DOCS_DIR)) return null;
  return safeReadFile(fullPath);
}

export function lookupInDocs(query) {
  if (!query || typeof query !== "string") return { matches: [], excerpt: null };
  const q = query.trim().toLowerCase();
  const docs = getDocList();
  const matches = [];
  let excerpt = null;
  for (const doc of docs) {
    const content = getDocContent(doc);
    if (!content) continue;
    const lower = content.toLowerCase();
    if (lower.includes(q)) {
      matches.push(doc);
      if (!excerpt) {
        const idx = lower.indexOf(q);
        const start = Math.max(0, idx - 80);
        const end = Math.min(content.length, idx + q.length + 120);
        excerpt = content.slice(start, end).replace(/\n/g, " ").trim();
      }
    }
  }
  return { matches, excerpt };
}

export function getSkillContent(skillId) {
  if (!VALID_SKILL_IDS.includes(skillId)) return null;
  const skillPath = path.join(SKILLS_DIR, skillId, "SKILL.md");
  if (!skillPath.startsWith(SKILLS_DIR)) return null;
  return safeReadFile(skillPath);
}

export function getSkillsIndex() {
  const indexPath = path.join(SKILLS_DIR, "README.md");
  return safeReadFile(indexPath);
}

export function getPillarsSummary() {
  const content = getDocContent("05-framework-overview.md");
  if (!content) return "AAF pillars: Security, Reliability, Cost Optimization, Operational Excellence, Performance Efficiency, Sustainability. Cross-cutting: Context Optimization, Autonomy & Outcome Governance. See docs/05-framework-overview.md.";
  const intro = content.slice(0, 3200);
  return intro + "\n\n[... see docs/05-framework-overview.md for full text ...]";
}

export function getChecklist(kind) {
  const skill = kind === "review" ? "aaf-architecture-review" : "aaf-architecture-review";
  const content = getSkillContent(skill);
  if (!content) return getChecklistFallback();
  const reviewSection = content.includes("## Mode 2: Architecture review")
    ? content.slice(content.indexOf("## Mode 2: Architecture review"), content.length)
    : content;
  return reviewSection.slice(0, 4000) + (reviewSection.length > 4000 ? "\n\n[...]" : "");
}

function getChecklistFallback() {
  return "Architecture review checklist: Security (entry points, tool scopes, untrusted inputs), Reliability (verifiable success, tool failures, idempotency), Cost (budgets, model routing, context), Operational excellence (observability, evaluation, rollback), Performance (topology, round trips), Sustainability (usage visible, efficiency defaults). See docs/15-application-method.md.";
}

export { VALID_SKILL_IDS };
