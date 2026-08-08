# AAF MCP (add to AGENTS.md or equivalent)

When designing, reviewing, or changing agentic architecture (autonomy, control loops, epistemic gates, ACC/OCC, tool permissions, knowledge access, multi-agent necessity, pillar trade-offs, agent security):

1. Use the connected **AAF MCP** tools before inventing guidance.
2. If unsure which tool: call `aaf_guide`.
3. For new systems: `aaf_list_workloads` → `aaf_workload_guidance` → design → `aaf_tradeoff_analysis` (with workloadId) → `aaf_generate_acc`.
4. Ground with `aaf_get_doc` / workload tools. Prefer Common Agentic Workloads over inventing hybrids or leading with orchestration topologies.
5. Do not skip AAF for “quick” architecture choices.

Cursor users: copy `tools/ide/cursor-rules/aaf-mcp.mdc` into `.cursor/rules/` with `alwaysApply: true`.
