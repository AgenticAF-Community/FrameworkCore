---
name: aaf-cross-cutting
description: Applies the two AAF cross-cutting foundations—Context Optimization and Autonomy & Outcome Governance. Use when designing context vs memory, context budgeting, autonomy levels, Definition of Done, budgets, or escalation.
---

# AAF Cross-Cutting Foundations

This skill covers the two horizontal foundations of the Agentic Architecture Framework that cut across all six pillars: **Context Optimization** and **Autonomy & Outcome Governance**.

## When to use

- Designing how context and memory are separated and budgeted.
- Defining autonomy level (assistive, delegated, bounded autonomous, supervisory).
- Defining “what done means” (Definition of Done, acceptance checks, evidence).
- Setting budgets (steps, tools, tokens, time, spend) and escalation behaviour.
- When context, cost, security, or reliability decisions depend on how much the agent can do and what it “knows.”

---

## 1. Context Optimization (cross-cutting)

Context is the working memory of the agent loop. It cross-cuts security, reliability, cost, performance, and operations.

**Objective:** Provide the minimum sufficient context for the task, in a controlled and explainable form, while preserving verification signals and preventing unsafe information flow.

### Context vs memory (non-negotiable separation)

| Context | Memory |
|--------|--------|
| Task-scoped, ephemeral, minimal, disposable | Durable, high-signal, policy-controlled, audited |
| Curated for the specific step | Versioned or reversible |

Failure to separate leads to context bloat, memory pollution, and security leakage.

### Context budgeting

Treat context as a budgeted resource (like time or tool calls). Define per task/step:

- System and policy envelope (stable instructions, guardrails).
- Current task state (goal, constraints, risk class, autonomy level, budgets).
- Tool definitions and results (minimize; consider on-demand discovery).
- Retrieval/output slots with explicit limits.

### Provenance and control

- Tag and separate trusted policy from untrusted data (e.g. user input, retrieved content).
- Make context construction explainable and minimal; avoid “everything in the prompt.”

### Checklist (context)

- [ ] Context and memory are architecturally separated.
- [ ] Context is budgeted (per task/step); no uncontrolled accumulation.
- [ ] Provenance is tracked (trusted vs untrusted).
- [ ] Retrieval and context construction are minimal and explainable.

---

## 2. Autonomy & Outcome Governance (cross-cutting)

This is the control layer that determines whether the system is merely useful or operationally safe and scalable. Probabilistic outputs must not become unearned authority.

**Objective:** Grant the minimum necessary autonomy, constrain it with budgets and policy gates, and ensure outcomes are verified against explicit definitions of done before the system confers authority.

### Autonomy ladder (declare a level)

- **Assistive:** Agent proposes/drafts; human actuates and is accountable.
- **Delegated:** Agent proposes; execution requires explicit approval (preview → approve → execute).
- **Autonomous (bounded):** Agent executes within budgets and policy; humans intervene by exception; requires strong verification and rollback.
- **Supervisory:** Manager agent coordinates workers and enforces validation bottlenecks.

Autonomy is not a feature—it is a controlled operating mode. Scale it with risk.

### Definition of Done and outcome governance

- Every task class has a **Definition of Done (DoD)**.
- Every DoD has **acceptance checks** and **evidence artifacts** (state, checksums, logs, IDs).
- “Done” is a verifiable end state, not a narrative claim. Judge outcomes by final environment state, not transcript.

### Budgets and escalation

- Enforce budgets: steps, tool calls, tokens, time, spend (where measurable).
- Define **escalation triggers**: cannot verify DoD, ambiguous tool output, irreversible action, budget threshold, security signals (e.g. suspected injection).
- Define **degraded modes**: read-only, observe-only, human-required.
- Escalation should be a first-class interrupt (e.g. APPROVAL_REQUIRED) with a structured packet: proposed action, risk class, evidence, resume semantics.

### Checklist (autonomy & outcome)

- [ ] Autonomy level declared per workflow/task class.
- [ ] Definition of Done and acceptance checks per task class; evidence collected.
- [ ] Budgets enforced and visible to the system (and optionally the agent).
- [ ] Escalation triggers and degraded modes defined; approval flow is auditable.

---

## Additional resources

- Context optimization: `docs/12-context-optimization.md`
- Autonomy & outcome governance: `docs/13-autonomy-governance.md`
- Framework overview (pillars + cross-cutting): `docs/05-framework-overview.md`
- Whitepaper: https://agenticaf.io/
