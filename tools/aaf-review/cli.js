#!/usr/bin/env node

/**
 * AAF Review CLI — compare ACC against built codebase, produce gap report.
 *
 * Usage:
 *   node cli.js <acc-file> <codebase-path>
 *   node cli.js <acc-file> <codebase-path> --format json|markdown
 *   node cli.js <acc-file> <codebase-path> --output report.md
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scan } from "../aaf-posture/scan.js";
import { runChecks } from "../aaf-posture/checks.js";
import { PILLARS } from "../aaf-posture/pillars.js";
import { matchByDesignAnswers, matchByPostureScores } from "../engine/matcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const accPath = positional[0];
const codePath = positional[1];
const formatIdx = args.indexOf("--format");
const format = formatIdx >= 0 ? args[formatIdx + 1] : "markdown";
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : null;

if (!accPath || !codePath) {
  console.error("Usage: aaf review <acc-file> <codebase-path> [--format json|markdown] [--output <file>]");
  console.error("\nCompares an ACC design contract against the actual codebase.");
  process.exit(1);
}

if (!fs.existsSync(accPath)) {
  console.error(`Error: ACC file not found: ${accPath}`);
  process.exit(1);
}

const codeRoot = path.resolve(process.cwd(), codePath);
if (!fs.existsSync(codeRoot) || !fs.statSync(codeRoot).isDirectory()) {
  console.error(`Error: codebase path must be an existing directory: ${codePath}`);
  process.exit(1);
}

function parseSimpleYAML(text) {
  const result = {};
  const lines = text.split("\n");
  let currentKey = null;
  let currentList = null;

  for (const line of lines) {
    if (line.startsWith("#") || line.trim() === "") continue;

    const topMatch = line.match(/^(\w[\w_-]*)\s*:\s*(.*)$/);
    if (topMatch) {
      const [, key, val] = topMatch;
      currentKey = key;
      currentList = null;
      if (val.trim()) {
        result[key] = val.trim().replace(/^["']|["']$/g, "");
      } else {
        result[key] = {};
      }
      continue;
    }

    const subMatch = line.match(/^\s{2}(\w[\w_-]*)\s*:\s*(.*)$/);
    if (subMatch && currentKey) {
      const [, key, val] = subMatch;
      currentList = null;
      if (typeof result[currentKey] !== "object" || Array.isArray(result[currentKey])) {
        result[currentKey] = {};
      }
      if (val.trim()) {
        result[currentKey][key] = val.trim().replace(/^["']|["']$/g, "");
      } else {
        result[currentKey][key] = [];
        currentList = result[currentKey][key];
      }
      continue;
    }

    const listMatch = line.match(/^\s{4}- question:\s*"(.+)"$/);
    if (listMatch && currentList) {
      currentList.push({ question: listMatch[1], answer: "not_assessed" });
      continue;
    }

    const answerMatch = line.match(/^\s{6}answer:\s*(.+)$/);
    if (answerMatch && currentList && currentList.length > 0) {
      currentList[currentList.length - 1].answer = answerMatch[1].trim();
    }
  }
  return result;
}

const accRaw = fs.readFileSync(accPath, "utf8");
const acc = parseSimpleYAML(accRaw);

// Run posture scan
const scanResult = scan(codeRoot);
const postureReport = runChecks(scanResult);

// Build posture scores
const scores = {};
for (const pillar of PILLARS) {
  const items = postureReport[pillar.id] || [];
  const found = items.filter((r) => r.status === "found").length;
  scores[pillar.id] = items.length > 0 ? found / items.length : 0;
}

// Build design answers from ACC for trade-off matching
const designAnswers = {};
if (acc.pillars && typeof acc.pillars === "object") {
  for (const [pillarId, questions] of Object.entries(acc.pillars)) {
    if (!Array.isArray(questions)) continue;
    designAnswers[pillarId] = {};
    questions.forEach((q, i) => {
      if (q.answer && q.answer !== "not_assessed") {
        designAnswers[pillarId][`${pillarId}-q${i + 1}`] = q.answer;
      }
    });
  }
}

// Run trade-off analysis
const designTradeoffs = matchByDesignAnswers(designAnswers);
const postureTensions = matchByPostureScores(scores);

// Build gap analysis
const gaps = [];
for (const pillar of PILLARS) {
  const accQuestions = Array.isArray(acc.pillars?.[pillar.id]) ? acc.pillars[pillar.id] : [];
  const postureItems = postureReport[pillar.id] || [];

  for (const item of postureItems) {
    if (item.status === "not_found") {
      const accEntry = accQuestions.find((q) => q.question === item.question);
      const wasPromised = accEntry && ["yes", "partial"].includes(accEntry.answer);
      gaps.push({
        pillarId: pillar.id,
        pillarName: pillar.name,
        question: item.question,
        accAnswer: accEntry?.answer || "not_in_acc",
        postureStatus: item.status,
        severity: wasPromised ? "high" : "medium",
        detail: wasPromised
          ? `Declared "${accEntry.answer}" in ACC but not detected in codebase`
          : "Not detected in codebase",
      });
    }
  }
}
gaps.sort((a, b) => (a.severity === "high" ? -1 : 1) - (b.severity === "high" ? -1 : 1));

const report = {
  accFile: accPath,
  codebasePath: codeRoot,
  scannedFiles: scanResult.paths.length,
  autonomyLevel: acc.autonomy_level || "unknown",
  scores,
  gaps: { total: gaps.length, high: gaps.filter((g) => g.severity === "high").length, items: gaps },
  designTradeoffs: designTradeoffs.length,
  postureTensions: postureTensions.length,
  tradeoffs: [...designTradeoffs, ...postureTensions.filter((pt) => !designTradeoffs.some((dt) => dt.id === pt.id))],
};

if (format === "json") {
  const str = JSON.stringify(report, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, str, "utf8");
    console.error(`Wrote ${outputPath}`);
  } else {
    console.log(str);
  }
} else {
  let md = `# AAF Review Report\n\n`;
  md += `**ACC:** \`${accPath}\`\n`;
  md += `**Codebase:** \`${codeRoot}\`\n`;
  md += `**Autonomy level:** ${report.autonomyLevel}\n`;
  md += `**Files scanned:** ${report.scannedFiles}\n\n`;

  md += `## Posture Scores\n\n`;
  for (const [pid, score] of Object.entries(scores)) {
    const bar = "█".repeat(Math.round(score * 10)) + "░".repeat(10 - Math.round(score * 10));
    md += `- **${pid}**: ${bar} ${(score * 100).toFixed(0)}%\n`;
  }

  md += `\n## Gap Analysis\n\n`;
  md += `**${report.gaps.total} gap(s)** found (${report.gaps.high} high severity)\n\n`;
  for (const gap of gaps) {
    const icon = gap.severity === "high" ? "🔴" : "🟡";
    md += `${icon} **${gap.pillarName}**: ${gap.question}\n`;
    md += `   ACC: ${gap.accAnswer} | Codebase: ${gap.postureStatus} — ${gap.detail}\n\n`;
  }

  if (report.tradeoffs.length > 0) {
    md += `## Active Trade-offs\n\n`;
    for (const t of report.tradeoffs) {
      md += `- **${t.pillars.join(" / ")}**: ${t.tension}\n`;
      md += `  Recommendation: ${t.recommendation}\n\n`;
    }
  }

  if (outputPath) {
    fs.writeFileSync(outputPath, md, "utf8");
    console.error(`Wrote ${outputPath}`);
  } else {
    console.log(md);
  }
}
