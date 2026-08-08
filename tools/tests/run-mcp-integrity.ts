/**
 * Run: npx tsx tools/tests/run-mcp-integrity.ts
 * ACC gap matrix, trade-off shape, autonomy implications, auth fail-closed + metering.
 */
import {
  analyseTradeoffs,
  getLevelImplications,
  reviewAgainstACC,
} from "../../api/lib/aaf-mcp-content.ts";
import {
  isProductionLike,
  mcpAuthMisconfigured,
  requestCountsTowardQuota,
} from "../../api/lib/mcp-auth.ts";

const Q = "Does the agent use a Tool Gateway?";

function accYaml(answer: string) {
  return `agent_control_contract:
  questions:
    - question: "${Q}"
      answer: "${answer}"
`;
}

const report = {
  security: [{ question: Q, status: "not_found", evidence: null }],
};

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  // PR1 — ACC
  {
    const yes = reviewAgainstACC(accYaml("yes"), report);
    assert(yes.totalGaps === 1 && yes.gaps[0].severity === "high", "yes → high");

    const partial = reviewAgainstACC(accYaml("partial"), report);
    assert(partial.gaps[0].severity === "high", "partial → high");

    const no = reviewAgainstACC(accYaml("no"), report);
    assert(no.totalGaps === 0, "no → omit");

    const unanswered = reviewAgainstACC(accYaml("not_answered"), report);
    assert(unanswered.gaps[0].severity === "medium", "not_answered → medium");

    const missing = reviewAgainstACC("agent_control_contract: {}\n", report);
    assert(missing.gaps[0].severity === "medium", "missing → medium");
  }

  // PR3 — trade-offs + autonomy
  {
    const { matchedFromAnswers, workloadDominantTrades } = analyseTradeoffs(
      {},
      "knowledge-assistant"
    );
    assert(Array.isArray(matchedFromAnswers), "matchedFromAnswers array");
    assert(workloadDominantTrades.length > 0, "workloadDominantTrades non-empty");
    for (const t of workloadDominantTrades) {
      assert(t.workloadId === "knowledge-assistant", "workload id");
      assert(t.note && /catalogue/i.test(t.note), "catalogue note");
    }

    const matched = analyseTradeoffs({ security: { "security-q1": "yes" } }).matchedFromAnswers;
    for (const t of matched) {
      assert("sourceQuote" in t && "source" in t && "confidence" in t, "provenance keys");
    }

    const a = getLevelImplications("assistive");
    const b = getLevelImplications("bounded-autonomous");
    assert(a.hitl && a.summary !== b.summary, "levelImplications differ");
  }

  // PR4 — auth helpers
  {
    const saved: Record<string, string | undefined> = {};
    for (const k of ["VERCEL_ENV", "APP_BASE_URL", "MCP_AUTH_REQUIRED"]) {
      saved[k] = process.env[k];
    }
    try {
      process.env.VERCEL_ENV = "production";
      delete process.env.APP_BASE_URL;
      assert(isProductionLike() === true, "production-like");

      process.env.MCP_AUTH_REQUIRED = "false";
      assert(mcpAuthMisconfigured() === true, "misconfigured when auth off");

      process.env.MCP_AUTH_REQUIRED = "true";
      assert(mcpAuthMisconfigured() === false, "ok when auth on");

      process.env.VERCEL_ENV = "development";
      process.env.MCP_AUTH_REQUIRED = "false";
      const callReq = new Request("https://example.com/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/call", params: {}, id: 1 }),
      });
      const listReq = new Request("https://example.com/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 2 }),
      });
      assert((await requestCountsTowardQuota(callReq)) === true, "tools/call counts");
      assert((await requestCountsTowardQuota(listReq)) === false, "tools/list free");
    } finally {
      for (const [k, v] of Object.entries(saved)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    }
  }

  console.log("ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
