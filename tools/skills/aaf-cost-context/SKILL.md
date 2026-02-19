---
name: aaf-cost-context
description: Applies AAF Cost pillar and context optimization: budgets, model routing, token economics, context discipline. Use when controlling cost in agentic systems, budgeting context, choosing model routing, or designing for token economics.
---

# AAF Cost & Context

Cost optimization in agentic systems is an architectural requirement: autonomy without budgets is cost volatility by design. Context optimization cross-cuts cost, performance, reliability, and security—context is the working memory of the control loop and must be engineered deliberately.

## Cost: key drivers

1. **Model selection** — Different cost/latency/quality; routing everything to the most capable model is rarely economical at scale.
2. **Token volume** — System instructions, memory, retrieved docs, tool definitions, tool outputs, reasoning. All consume context budget.
3. **Tool calls** — API usage, search, compute, DB queries, pipelines.
4. **Loop depth** — Number of observe→decide→act→verify turns compounds the above.

## Budgets (first-class constraint)

Introduce explicit budgets for at least some of: max steps, max tool calls, max wall-clock time, max tokens, max spend per task. Define what happens when budgets are exceeded (escalation, defer, degrade). Budgets shape behavior: they force planning discipline, early stopping, and verification-based termination.

## Model routing

- **Static by task class:** e.g. planning → stronger model; formatting → smaller.
- **Dynamic by risk/uncertainty:** Escalate to stronger model or human when write tool or unverifiable outcome.
- **Cascaded:** Start cheap; escalate only if verification fails (cost-optimized and reliability-oriented).

## Token and context discipline

- **Control output length:** Structured, bounded, directly usable outputs; use max_tokens and stop sequences.
- **Reduce context bloat:** Avoid long histories, irrelevant memory, full tool catalogs in every request. Prefer on-demand tool discovery where supported.
- **Prompt caching:** Put stable instructions and static context in a consistent prefix; append variable task-specific context at the end. Design for repetition (system instructions, guardrails, tool definitions).
- **Context vs memory (hard separation):** Context = task-scoped, ephemeral, minimal. Memory = durable, high-signal, policy-controlled, audited. Mixing them causes bloat, leakage, and drift.

## Early stopping and verification-based termination

Stop as soon as verification passes against a Definition of Done—not when the agent “feels done.” This is both cost control and an epistemic gate.

## Workload shaping

- Schedule batch work off-peak; run background tasks async; coalesce triggers.
- Avoid per-event “immediate reasoning” when a queue can smooth load.
- Reduces peak load, tool failures, rate limiting, retries, and loop depth.

## Context optimization objective

*Provide the minimum sufficient context for the task, in a controlled and explainable form, while preserving verification signals and preventing unsafe information flow.*

Context tension: too little → poor decisions, unreliable outcomes; too much → high cost, latency, leakage risk, instruction collisions.

## Checklist (cost & context)

- [ ] Budgets defined and enforced at runtime (steps/tools/tokens/time/spend).
- [ ] Model routing explicit by phase and risk.
- [ ] Context budgeted; no uncontrolled prompt accumulation.
- [ ] Caching and early stopping designed in.
- [ ] Context vs memory separated; provenance (trusted vs untrusted) considered.
- [ ] Output length and structure controlled.

## Additional resources

- Cost pillar: `docs/08-pillar-cost.md`
- Context optimization: `docs/12-context-optimization.md`
- Whitepaper: https://agenticaf.io/
