#!/usr/bin/env node

/**
 * AAF Posture CLI — scan a codebase and print an AAF pillar alignment report.
 * Usage: node cli.js [path] [--format json|markdown|html] [--output <file>]
 */
import path from "path";
import fs from "fs";
import { scan } from "./scan.js";
import { runChecks } from "./checks.js";
import { PILLARS } from "./pillars.js";
import { buildHtmlReport } from "./report-html.js";

const args = process.argv.slice(2);
let pathArg = args.find((a) => !a.startsWith("--"));
if (pathArg && ["json", "markdown", "html"].includes(pathArg) && args.includes("--format")) pathArg = undefined;
const targetDir = pathArg ?? ".";
const formatIdx = args.indexOf("--format");
const formatArg = formatIdx >= 0 ? args[formatIdx + 1] : undefined;
const format = formatArg === "json" ? "json" : formatArg === "html" ? "html" : "markdown";
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : undefined;

const root = path.resolve(process.cwd(), targetDir);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error("Error: path must be an existing directory.");
  process.exit(1);
}

const scanResult = scan(root);
const report = runChecks(scanResult);

if (format === "json") {
  const out = {
    path: root,
    scannedFiles: scanResult.paths.length,
    pillars: {},
  };
  for (const pillar of PILLARS) {
    out.pillars[pillar.id] = { name: pillar.name, items: report[pillar.id] };
  }
  const str = JSON.stringify(out, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, str, "utf8");
    console.error("Wrote", outputPath);
  } else {
    console.log(str);
  }
} else if (format === "html") {
  const html = buildHtmlReport({
    rootPath: root,
    scannedFiles: scanResult.paths.length,
    report,
  });
  const outFile = outputPath || path.join(process.cwd(), "aaf-posture-report.html");
  fs.writeFileSync(outFile, html, "utf8");
  console.log("Report written to", outFile);
} else {
  let md = `# AAF Posture Report\n\n**Path:** \`${root}\`  \n**Files scanned:** ${scanResult.paths.length}\n\n`;
  md += "> Findings are heuristic (code/config patterns). Manual review is required for production readiness.\n\n";
  for (const pillar of PILLARS) {
    md += `## ${pillar.name}\n\n`;
    for (const item of report[pillar.id]) {
      const badge = item.status === "found" ? "✓" : item.status === "not_found" ? "○" : "?";
      md += `- ${badge} ${item.question}\n`;
      if (item.evidence) md += `  - *${item.status}*: ${item.evidence}\n`;
    }
    md += "\n";
  }
  if (outputPath) {
    fs.writeFileSync(outputPath, md, "utf8");
    console.error("Wrote", outputPath);
  } else {
    console.log(md);
  }
}
