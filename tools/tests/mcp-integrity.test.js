/**
 * MCP integrity remediation unit tests (no KV).
 * Run: node --test tools/tests/mcp-integrity.test.js
 *
 * ACC / trade-off / auth logic is exercised via npx tsx (see run-mcp-integrity.ts).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runSecurityChecks } from "../aaf-security/checks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

describe("security scope honesty (PR2)", () => {
  it("skips absence checks when includeAbsenceChecks is false", () => {
    const content = new Map([["app.js", "console.log('hi')"]]);
    const { findings } = runSecurityChecks(
      { paths: ["app.js"], content },
      { includeAbsenceChecks: false }
    );
    const absence = findings.filter(
      (f) => f.location === "(declared-tree)" || /No vault|No tool gateway|No injection/i.test(f.check)
    );
    assert.equal(absence.length, 0);
  });

  it("allows absence checks when includeAbsenceChecks is true (default)", () => {
    const content = new Map([["app.js", "console.log('hi')"]]);
    const { findings } = runSecurityChecks({ paths: ["app.js"], content });
    const absence = findings.filter(
      (f) => f.location === "(declared-tree)" || /No vault|No tool gateway|No injection/i.test(f.check)
    );
    assert.ok(absence.length > 0);
  });
});

describe("ACC / trade-off / auth integrity (via tsx)", () => {
  it("passes run-mcp-integrity.ts", () => {
    const r = spawnSync(
      "npx",
      ["tsx", path.join(__dirname, "run-mcp-integrity.ts")],
      { encoding: "utf8", cwd: REPO_ROOT, env: process.env }
    );
    if (r.status !== 0) {
      assert.fail((r.stdout || "") + (r.stderr || "") || `exit ${r.status}`);
    }
  });
});

describe("copy / onboarding strings (PR5)", () => {
  it("Tools page uses six pillars + two foundations and CLI posture command", () => {
    const src = fs.readFileSync(path.join(REPO_ROOT, "website/src/pages/tools.js"), "utf8");
    assert.ok(src.includes("six pillars and two cross-cutting foundations"));
    assert.ok(src.includes("aaf-posture/cli.js"));
    assert.ok(src.includes("1,000 MCP tool calls"));
  });

  it("success page workspace rule includes posture CLI", () => {
    const src = fs.readFileSync(path.join(REPO_ROOT, "website/src/pages/access/success.js"), "utf8");
    assert.ok(src.includes("aaf-posture/cli.js"));
    assert.ok(src.includes("aaf_posture_interpret"));
  });

  it("methodology carves out heuristics", () => {
    const src = fs.readFileSync(path.join(REPO_ROOT, "website/src/pages/methodology.js"), "utf8");
    assert.ok(src.includes("deterministic vs heuristic"));
    assert.ok(src.includes("Security snippet lint"));
  });
});
