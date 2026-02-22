/**
 * Deterministic doc block renderer.
 *
 * Reads trade-offs.json and renders engine-generated markdown blocks
 * for injection into pillar docs between AAF-ENGINE markers.
 *
 * No AI. Same input always produces same output.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadTradeoffs, getTradeoffsForPillar } from "./matcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const DOCS_DIR = path.join(REPO_ROOT, "docs");

const START_MARKER = "<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->";
const END_MARKER = "<!-- AAF-ENGINE:END -->";

const PILLAR_DOC_MAP = {
  security: { doc: "06-pillar-security.md", sectionPrefix: "5" },
  reliability: { doc: "07-pillar-reliability.md", sectionPrefix: "6" },
  cost: { doc: "08-pillar-cost.md", sectionPrefix: "7" },
  "operational-excellence": { doc: "09-pillar-operations.md", sectionPrefix: "8" },
  performance: { doc: "10-pillar-performance.md", sectionPrefix: "9" },
  sustainability: { doc: "11-pillar-sustainability.md", sectionPrefix: "10" },
  "context-optimization": { doc: "12-context-optimization.md", sectionPrefix: "11" },
  "autonomy-governance": { doc: "13-autonomy-governance.md", sectionPrefix: "12" },
};

/**
 * Render the engine-generated markdown block for a single pillar.
 */
export function renderPillarBlock(pillarId, tradeoffs) {
  const data = tradeoffs || loadTradeoffs();
  const pillarTradeoffs = getTradeoffsForPillar(pillarId, data);
  const meta = PILLAR_DOC_MAP[pillarId];

  if (!pillarTradeoffs.length) {
    return null;
  }

  const lines = [];
  lines.push(START_MARKER);
  lines.push("");

  const nextSection = guessNextSectionNumber(meta.sectionPrefix, pillarTradeoffs);
  lines.push(`### ${nextSection} Design Recommendations & Trade-offs`);
  lines.push("");

  const recommendations = extractRecommendations(pillarId, pillarTradeoffs);
  if (recommendations.length) {
    lines.push("**Key recommendations**");
    lines.push("");
    for (const rec of recommendations) {
      lines.push(`- ${rec}`);
    }
    lines.push("");
  }

  lines.push("**Cross-pillar trade-offs**");
  lines.push("");
  for (const t of pillarTradeoffs) {
    const otherPillar = t.pillars.find((p) => p !== pillarId) || t.pillars[1];
    const otherName = formatPillarName(otherPillar);
    const sourceRef = t.source?.section ? ` *(source: ${t.source.section})*` : "";
    lines.push(`- **${formatPillarName(pillarId)} x ${otherName}:** ${t.tension} ${t.recommendation}${sourceRef}`);
  }
  lines.push("");

  const hasAutonomyNotes = pillarTradeoffs.some(
    (t) => t.autonomyNotes && Object.values(t.autonomyNotes).some((v) => v && !v.startsWith("Not explicitly"))
  );

  if (hasAutonomyNotes) {
    lines.push("**By autonomy level**");
    lines.push("");
    const merged = mergeAutonomyNotes(pillarId, pillarTradeoffs);
    for (const [level, note] of Object.entries(merged)) {
      if (note) {
        lines.push(`- **${formatAutonomyLevel(level)}:** ${note}`);
      }
    }
    lines.push("");
  }

  lines.push(END_MARKER);
  return lines.join("\n");
}

/**
 * Inject the rendered block into a doc file.
 * If markers exist, replace content between them.
 * If not, insert before the citations section.
 * Returns { content, changed }.
 */
export function injectBlock(docContent, block) {
  if (!block) return { content: docContent, changed: false };

  const startIdx = docContent.indexOf(START_MARKER);
  const endIdx = docContent.indexOf(END_MARKER);

  if (startIdx !== -1 && endIdx !== -1) {
    const before = docContent.slice(0, startIdx);
    const after = docContent.slice(endIdx + END_MARKER.length);
    return { content: before + block + after, changed: true };
  }

  const citationsPattern = /\n## .*Citations.*\n/i;
  const citationsMatch = docContent.match(citationsPattern);
  if (citationsMatch) {
    const insertAt = docContent.indexOf(citationsMatch[0]);
    const before = docContent.slice(0, insertAt);
    const after = docContent.slice(insertAt);
    return { content: before + "\n" + block + "\n" + after, changed: true };
  }

  return { content: docContent + "\n\n" + block + "\n", changed: true };
}

/**
 * Render and inject blocks for all pillar docs.
 * Returns a summary of changes.
 */
export function renderAll(tradeoffs, dryRun = false) {
  const data = tradeoffs || loadTradeoffs();
  const results = [];

  for (const [pillarId, meta] of Object.entries(PILLAR_DOC_MAP)) {
    const block = renderPillarBlock(pillarId, data);
    if (!block) {
      results.push({ pillarId, doc: meta.doc, changed: false, reason: "no trade-offs" });
      continue;
    }

    const docPath = path.join(DOCS_DIR, meta.doc);
    let docContent;
    try {
      docContent = fs.readFileSync(docPath, "utf8");
    } catch {
      results.push({ pillarId, doc: meta.doc, changed: false, reason: "doc not found" });
      continue;
    }

    const { content, changed } = injectBlock(docContent, block);

    if (changed && !dryRun) {
      fs.writeFileSync(docPath, content, "utf8");
    }

    results.push({ pillarId, doc: meta.doc, changed, dryRun });
  }

  return results;
}

function guessNextSectionNumber(prefix, tradeoffs) {
  const sectionNums = tradeoffs
    .filter((t) => t.source?.section)
    .map((t) => {
      const parts = t.source.section.split(".");
      return parseInt(parts[parts.length - 1], 10) || 0;
    });
  const max = Math.max(0, ...sectionNums);
  return `${prefix}.${max + 10}`;
}

function extractRecommendations(pillarId, tradeoffs) {
  const recs = new Set();
  for (const t of tradeoffs) {
    if (t.recommendation) {
      recs.add(t.recommendation);
    }
  }
  return [...recs];
}

function mergeAutonomyNotes(pillarId, tradeoffs) {
  const merged = { assistive: null, delegated: null, boundedAutonomous: null, supervisory: null };
  for (const t of tradeoffs) {
    if (!t.autonomyNotes) continue;
    for (const level of Object.keys(merged)) {
      const note = t.autonomyNotes[level];
      if (note && !note.startsWith("Not explicitly")) {
        merged[level] = merged[level] ? `${merged[level]}; ${note}` : note;
      }
    }
  }
  return merged;
}

function formatPillarName(id) {
  const names = {
    security: "Security",
    reliability: "Reliability",
    cost: "Cost",
    "operational-excellence": "Operations",
    performance: "Performance",
    sustainability: "Sustainability",
    "context-optimization": "Context",
    "autonomy-governance": "Autonomy",
  };
  return names[id] || id;
}

function formatAutonomyLevel(level) {
  const names = {
    assistive: "Assistive",
    delegated: "Delegated",
    boundedAutonomous: "Bounded Autonomous",
    supervisory: "Supervisory",
  };
  return names[level] || level;
}
