#!/usr/bin/env node

/**
 * AAF CLI — unified entry point.
 *
 * Usage:
 *   aaf posture [path] [--format json|markdown|html]
 *   aaf design [--json answers.json] [--output acc.yaml]
 *   aaf build <acc-file> [--output <dir>] [--manifest]
 *   aaf review <acc-file> <codebase-path> [--format json|markdown]
 */
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COMMANDS = {
  posture: path.join(__dirname, "aaf-posture", "cli.js"),
  design:  path.join(__dirname, "aaf-design", "cli.js"),
  build:   path.join(__dirname, "aaf-build", "cli.js"),
  review:  path.join(__dirname, "aaf-review", "cli.js"),
};

const subcommand = process.argv[2];
const subArgs = process.argv.slice(3);

if (!subcommand || subcommand === "--help" || subcommand === "-h") {
  console.log(`AAF CLI — Agentic Architecture Framework toolchain

Usage:
  aaf <command> [options]

Commands:
  posture   Scan a codebase and report AAF pillar alignment
  design    Interactive design questionnaire → ACC + trade-off report
  build     Generate scaffolded agent project from an ACC
  review    Compare ACC against built codebase → gap report

Examples:
  aaf posture ./my-agent --format html
  aaf design --output my-agent.acc.yaml
  aaf design --json answers.json --output my-agent.acc.yaml
  aaf build my-agent.acc.yaml --output ./my-agent
  aaf review my-agent.acc.yaml ./my-agent --format markdown

Run 'aaf <command> --help' for command-specific options.
`);
  process.exit(0);
}

const script = COMMANDS[subcommand];
if (!script) {
  console.error(`Unknown command: ${subcommand}`);
  console.error(`Available: ${Object.keys(COMMANDS).join(", ")}`);
  process.exit(1);
}

try {
  execFileSync("node", [script, ...subArgs], { stdio: "inherit" });
} catch (err) {
  process.exit(err.status || 1);
}
