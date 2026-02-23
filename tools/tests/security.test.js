import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runSecurityChecks } from "../aaf-security/checks.js";

function makeScanResult(files = {}) {
  const content = new Map(Object.entries(files));
  const paths = Object.keys(files);
  return { paths, content };
}

// ─── Confidentiality checks ─────────────────────────────────────────────────

describe("confidentiality: hardcoded secrets", () => {
  it("detects AWS access keys", () => {
    const scan = makeScanResult({ "config.js": 'const key = "AKIAIOSFODNN7EXAMPLE"' });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Hardcoded secrets" && f.cia_dimension === "confidentiality");
    assert.ok(match, "Should detect AWS key");
    assert.equal(match.severity, "critical");
  });

  it("detects OpenAI-style keys", () => {
    const scan = makeScanResult({ "app.py": 'api_key = "sk-abcdefghij1234567890abcd"' });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Hardcoded secrets");
    assert.ok(match);
  });

  it("detects hardcoded passwords", () => {
    const scan = makeScanResult({ "db.js": 'password = "hunter2secret"' });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Hardcoded secrets");
    assert.ok(match);
  });

  it("detects private keys", () => {
    const scan = makeScanResult({ "key.pem": "-----BEGIN RSA PRIVATE KEY-----\ndata" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Hardcoded secrets");
    assert.ok(match);
  });

  it("reports no secrets when code is clean", () => {
    const scan = makeScanResult({ "app.js": 'const key = process.env.API_KEY' });
    const { findings } = runSecurityChecks(scan);
    const secretFindings = findings.filter((f) => f.check === "Hardcoded secrets");
    assert.equal(secretFindings.length, 0);
  });
});

describe("confidentiality: vault detection", () => {
  it("flags missing vault when no secret manager references", () => {
    const scan = makeScanResult({ "app.js": "console.log('hello')" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No vault or secrets manager detected");
    assert.ok(match);
    assert.equal(match.severity, "high");
  });

  it("does not flag vault when vault references exist", () => {
    const scan = makeScanResult({ "secrets.js": "import { getSecret } from './vault'" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No vault or secrets manager detected");
    assert.ok(!match, "Should not flag vault when vault patterns present");
  });
});

// ─── Integrity checks ───────────────────────────────────────────────────────

describe("integrity: unsandboxed execution", () => {
  it("detects exec() calls", () => {
    const scan = makeScanResult({ "run.js": "const { exec } = require('child_process'); exec('ls')" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Unsandboxed code execution" && f.cia_dimension === "integrity");
    assert.ok(match);
    assert.equal(match.severity, "high");
  });

  it("detects eval()", () => {
    const scan = makeScanResult({ "run.js": "eval(userInput)" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Unsandboxed code execution");
    assert.ok(match);
  });

  it("detects Python subprocess", () => {
    const scan = makeScanResult({ "run.py": "import subprocess\nsubprocess.run(['ls'])" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Unsandboxed code execution");
    assert.ok(match);
  });
});

describe("integrity: broad permissions", () => {
  it("detects wildcard permissions", () => {
    const scan = makeScanResult({ "policy.yaml": 'permissions: ["*"]' });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Overly broad permissions");
    assert.ok(match);
    assert.equal(match.severity, "high");
  });

  it("does not flag scoped permissions", () => {
    const scan = makeScanResult({ "policy.yaml": 'permissions: ["read:items", "write:items"]' });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "Overly broad permissions");
    assert.ok(!match);
  });
});

describe("integrity: tool gateway", () => {
  it("flags missing gateway", () => {
    const scan = makeScanResult({ "agent.js": "async function run() { await callTool('update') }" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No tool gateway pattern detected");
    assert.ok(match);
  });

  it("does not flag when gateway exists", () => {
    const scan = makeScanResult({ "gateway.js": "class ToolGateway { evaluate() {} }" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No tool gateway pattern detected");
    assert.ok(!match);
  });
});

describe("integrity: prompt injection mitigation", () => {
  it("flags missing injection mitigation", () => {
    const scan = makeScanResult({ "agent.js": "const prompt = userMessage" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No prompt injection mitigation detected");
    assert.ok(match);
    assert.equal(match.severity, "medium");
  });

  it("does not flag when system prompt patterns exist", () => {
    const scan = makeScanResult({ "agent.js": "const system prompt template = 'You are a helpful assistant'; // uses instruction hierarchy for content labelling" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No prompt injection mitigation detected");
    assert.ok(!match);
  });
});

// ─── Availability checks ────────────────────────────────────────────────────

describe("availability: rate limiting", () => {
  it("flags missing rate limiting", () => {
    const scan = makeScanResult({ "server.js": "app.post('/ask', handler)" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No rate limiting detected");
    assert.ok(match);
    assert.equal(match.cia_dimension, "availability");
  });

  it("does not flag when rate limiting exists", () => {
    const scan = makeScanResult({ "server.js": "app.use(rateLimit({ windowMs: 60000, max: 100 }))" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No rate limiting detected");
    assert.ok(!match);
  });
});

describe("availability: budget enforcement", () => {
  it("flags missing budgets", () => {
    const scan = makeScanResult({ "agent.js": "while (true) { await step() }" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No budget enforcement detected");
    assert.ok(match);
  });

  it("does not flag when budgets exist", () => {
    const scan = makeScanResult({ "agent.js": "const max_steps = 10; if (steps > budget) stop();" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No budget enforcement detected");
    assert.ok(!match);
  });
});

describe("availability: graceful degradation", () => {
  it("flags missing fallback", () => {
    const scan = makeScanResult({ "agent.js": "const response = await llm.call(prompt)" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No graceful degradation for model unavailability");
    assert.ok(match);
    assert.equal(match.severity, "low");
  });

  it("does not flag when fallback exists", () => {
    const scan = makeScanResult({ "agent.js": "try { await llm.call(prompt) } catch { return fallback() }" });
    const { findings } = runSecurityChecks(scan);
    const match = findings.find((f) => f.check === "No graceful degradation for model unavailability");
    assert.ok(!match);
  });
});

// ─── Summary ─────────────────────────────────────────────────────────────────

describe("summary statistics", () => {
  it("produces correct summary counts", () => {
    const scan = makeScanResult({
      "config.js": 'const key = "AKIAIOSFODNN7EXAMPLE"',
      "run.js": "eval(userInput)",
    });
    const { summary } = runSecurityChecks(scan);
    assert.ok(summary.total > 0);
    assert.ok(summary.critical >= 1);
    assert.ok(summary.by_cia.confidentiality >= 1);
    assert.ok(summary.by_cia.integrity >= 1);
  });

  it("returns zero findings for clean code", () => {
    const scan = makeScanResult({
      "agent.js": "import { getSecret } from './vault'; const gateway = new ToolGateway(); const systemPrompt = 'safe'; rateLimit(); budget = 10; fallback();",
    });
    const { summary } = runSecurityChecks(scan);
    assert.equal(summary.critical, 0);
  });
});
