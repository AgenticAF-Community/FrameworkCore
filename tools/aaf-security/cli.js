#!/usr/bin/env node

/**
 * AAF Security Scanner — dedicated security analysis for agentic systems.
 *
 * Usage:
 *   aaf security <path> [--format json|markdown|html] [--severity critical|high|medium|all] [--output <file>]
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { scan } from "../aaf-posture/scan.js";
import { runSecurityChecks } from "./checks.js";
import { toMarkdown, toJSON, toHTML } from "./reporter.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  console.log(`AAF Security Scanner — CIA-aligned security analysis for agentic systems

Usage:
  aaf security <path> [options]

Options:
  --format <json|markdown|html>   Output format (default: markdown)
  --severity <critical|high|medium|all>  Minimum severity to include (default: all)
  --output <file>                 Write report to file instead of stdout

Examples:
  aaf security ./my-agent
  aaf security ./my-agent --format json
  aaf security ./my-agent --severity high --output security-report.md
`);
  process.exit(0);
}

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

const targetPath = args.find((a) => !a.startsWith("--"));
if (!targetPath) {
  console.error("Error: Please provide a path to scan.");
  process.exit(1);
}

const resolved = path.resolve(targetPath);
if (!fs.existsSync(resolved)) {
  console.error(`Error: Path not found: ${resolved}`);
  process.exit(1);
}

const format = getArg("--format") || "markdown";
const severity = getArg("--severity") || "all";
const outputFile = getArg("--output");

const scanResult = scan(resolved);
const { findings: allFindings, summary } = runSecurityChecks(scanResult);

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const minSev = severity === "all" ? 999 : (severityOrder[severity] ?? 999);
const findings = allFindings.filter((f) => (severityOrder[f.severity] ?? 999) <= minSev);

const filteredSummary = {
  total: findings.length,
  critical: findings.filter((f) => f.severity === "critical").length,
  high: findings.filter((f) => f.severity === "high").length,
  medium: findings.filter((f) => f.severity === "medium").length,
  low: findings.filter((f) => f.severity === "low").length,
  by_cia: {
    integrity: findings.filter((f) => f.cia_dimension === "integrity").length,
    confidentiality: findings.filter((f) => f.cia_dimension === "confidentiality").length,
    availability: findings.filter((f) => f.cia_dimension === "availability").length,
  },
};

let output;
if (format === "json") {
  output = toJSON(findings, filteredSummary, targetPath);
} else if (format === "html") {
  output = toHTML(findings, filteredSummary, targetPath);
} else {
  output = toMarkdown(findings, filteredSummary, targetPath);
}

if (outputFile) {
  fs.writeFileSync(outputFile, output, "utf8");
  console.log(`Security report written to ${outputFile}`);
  console.log(`Found ${filteredSummary.total} findings (${filteredSummary.critical} critical, ${filteredSummary.high} high, ${filteredSummary.medium} medium, ${filteredSummary.low} low)`);
} else {
  console.log(output);
}
