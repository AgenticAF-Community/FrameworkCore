/**
 * Run: npx tsx tools/tests/run-aaf-mcp-content.ts
 */
import {
  getGuide,
  getDocContent,
  rankWorkloads,
  analyseTradeoffs,
  getChecklist,
} from "../../api/lib/aaf-mcp-content.ts";

const g = getGuide("design");
if (!g.steps.some((s: any) => s.tool === "aaf_list_workloads")) {
  throw new Error("design guide missing workloads");
}

const bad = getDocContent("../etc/passwd");
if (!("error" in bad)) throw new Error("expected path error");

const ranked = rankWorkloads("customer support refund chatbot escalation");
if (ranked[0].id !== "customer-chatbot") {
  throw new Error("expected customer-chatbot first, got " + ranked[0].id);
}

const trades = analyseTradeoffs({}, "knowledge-assistant");
if (!trades.some((t: any) => t.workloadId === "knowledge-assistant")) {
  throw new Error("missing workload trades");
}

const design = getChecklist("design");
if (design.length < 100) throw new Error("design checklist too short");

console.log("ok");
