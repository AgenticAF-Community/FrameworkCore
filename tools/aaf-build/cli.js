#!/usr/bin/env node

/**
 * AAF Build CLI — generate a scaffolded agent project from an ACC.
 *
 * Usage:
 *   node cli.js <acc-file>                 # scaffold into ./agent-project/
 *   node cli.js <acc-file> --output <dir>  # scaffold into specified directory
 *   node cli.js --manifest <acc-file>      # print file manifest (no writes)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  agentPy, gatesPy, budgetsPy, observabilityPy,
  toolsInit, policyYaml, testCompliancePy,
  requirementsTxt, agentsMd, accMarkdown,
} from "./templates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const manifestOnly = args.includes("--manifest");
const outputIdx = args.indexOf("--output");
const outputDir = outputIdx >= 0 ? args[outputIdx + 1] : "agent-project";
const accPath = args.find((a) => !a.startsWith("--") && a !== outputDir);

if (!accPath) {
  console.error("Usage: aaf build <acc-file> [--output <dir>] [--manifest]");
  console.error("\nReads an ACC (YAML from aaf design) and generates a scaffolded agent project.");
  process.exit(1);
}

function parseSimpleYAML(text) {
  const result = {};
  const lines = text.split("\n");
  let currentKey = null;
  let currentSubKey = null;
  let currentList = null;

  for (const line of lines) {
    if (line.startsWith("#") || line.trim() === "") continue;

    const topMatch = line.match(/^(\w[\w_-]*)\s*:\s*(.*)$/);
    if (topMatch) {
      const [, key, val] = topMatch;
      currentKey = key;
      currentSubKey = null;
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
      currentSubKey = key;
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
      continue;
    }
  }
  return result;
}

const accRaw = fs.readFileSync(accPath, "utf8");
const acc = parseSimpleYAML(accRaw);

const FILES = [
  { path: "agent.py", gen: () => agentPy(acc) },
  { path: "gates.py", gen: () => gatesPy(acc) },
  { path: "budgets.py", gen: () => budgetsPy(acc) },
  { path: "observability.py", gen: () => observabilityPy() },
  { path: "tools/__init__.py", gen: () => toolsInit() },
  { path: "policy.yaml", gen: () => policyYaml(acc) },
  { path: "tests/test_compliance.py", gen: () => testCompliancePy(acc) },
  { path: "requirements.txt", gen: () => requirementsTxt() },
  { path: "AGENTS.md", gen: () => agentsMd(acc) },
  { path: "AGENT_CONTROL_CONTRACT.md", gen: () => accMarkdown(acc) },
];

if (manifestOnly) {
  console.log(JSON.stringify({
    outputDir,
    autonomyLevel: acc.autonomy_level || "delegated",
    files: FILES.map((f) => f.path),
  }, null, 2));
  process.exit(0);
}

const root = path.resolve(process.cwd(), outputDir);
if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });

let written = 0;
for (const file of FILES) {
  const fp = path.join(root, file.path);
  const dir = path.dirname(fp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fp, file.gen(), "utf8");
  written++;
  console.error(`  wrote ${file.path}`);
}

console.error(`\nScaffolded ${written} files into ${root}/`);
console.error("\nNext steps:");
console.error("  1. cd " + outputDir);
console.error("  2. pip install -r requirements.txt");
console.error("  3. Implement tool handlers in tools/__init__.py");
console.error("  4. Implement decide() and act() in agent.py");
console.error("  5. pytest tests/test_compliance.py");
