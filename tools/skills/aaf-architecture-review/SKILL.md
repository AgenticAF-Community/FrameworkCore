---
name: aaf-architecture-review
description: Applies the Agentic Architecture Framework when designing or reviewing agentic systems. Covers pillar checklist, trade-offs, design-time spec and pre-production review. Use when designing agentic systems, reviewing architectures, pre-production readiness, or discussing autonomy and governance trade-offs.
---

# AAF Architecture Review

Use this skill when designing new agentic systems or reviewing existing architectures against the Agentic Architecture Framework (AAF). The framework is a set of architectural lenses and a method for surfacing trade-offs—not a one-size-fits-all checklist.

## When to use

- Designing an agentic system (before you build).
- Conducting an architecture review (pre-production readiness).
- Discussing autonomy levels, epistemic gates, or pillar trade-offs.
- Aligning with AAF pillars (security, reliability, cost, operations, performance, sustainability) and cross-cutting foundations (context optimization, autonomy & outcome governance).

## Mode 1: Design-time (before you build)

A design spec should answer, at minimum:

**Autonomy declaration**

- What autonomy level: assistive, delegated, bounded autonomous, or supervisory?
- What tasks are permitted at each level?

**Authority model (epistemic gates)**

- Where are the gates between generation → validation → authority?
- Which gates are deterministic checks, human approval, or policy-engine enforced?

**Outcome specification**

- Definition of Done for each task class.
- Evidence required to validate completion.

**Tool governance**

- Which tools exist? Read vs write vs irreversible?
- Least-privilege scopes; verification after each tool call.

**Budgets**

- Step/tool/token/time/spend budgets.
- Behavior on budget exhaustion (escalation, defer, degrade).

**Context policy**

- How context is constructed and bounded.
- Separation of memory from task context; provenance (trusted vs untrusted).

**Failure and escalation**

- Escalation triggers (uncertainty, verification failure, high-risk action, suspected injection, tool failures).
- Degraded modes (read-only, observe-only, human-required).

## Mode 2: Architecture review (pre-production)

Apply pillars as structured review lenses. Absence of budgets, verification, and observability is a strong indicator the system is not production-ready.

**Security Architecture**

- [ ] Are all entry points authenticated and authorized?
- [ ] Are tool scopes least privilege?
- [ ] Are write actions gated and verified?
- [ ] Are untrusted inputs (including retrieved content) treated as hostile?

**Reliability**

- [ ] Is success defined as a verifiable end state?
- [ ] Are tool failures expected and handled?
- [ ] Are actions idempotent or checkpointed?
- [ ] Are retries safe?

**Cost Optimization**

- [ ] Are budgets enforced at runtime?
- [ ] Is model routing explicit by phase and risk?
- [ ] Is context budgeted (no uncontrolled prompt accumulation)?
- [ ] Are caching and early stopping designed in?

**Operational Excellence**

- [ ] Is the full control loop observable (Trigger → Decide → Act → Verify), with observability traces (intent → plan → act → verify) captured?
- [ ] Is there an evaluation harness and regression suite?
- [ ] Is rollout staged with rollback?
- [ ] Are skills/tools versioned and reviewed?

**Performance Efficiency**

- [ ] Is topology justified by task structure (single-agent by default; orchestration only where it helps)?
- [ ] Are tool round trips minimized?
- [ ] Is work partitioned into interactive vs batch?

**Sustainability**

- [ ] Is usage measured and visible?
- [ ] Are efficiency levers used as defaults (minimal context, concise outputs, cached prefixes, bounded loops)?

**Context Optimization**

- [ ] Is context separated from memory (task-scoped vs durable)?
- [ ] Is context budgeted per task/step with explicit allocations?
- [ ] Is provenance tracked (trusted policy vs untrusted data)?
- [ ] Is retrieval/context construction minimal and explainable?

**Autonomy & Outcome Governance**

- [ ] Is autonomy level declared (assistive, delegated, bounded autonomous, supervisory)?
- [ ] Is there a Definition of Done with acceptance checks and evidence per task class?
- [ ] Are budgets (steps/tools/tokens/time/spend) enforced and visible?
- [ ] Are escalation triggers and degraded modes defined?

## Maturity model (scaling autonomy safely)

- **Stage 0 — Assistive:** Read-only tools; human decision authority; logging and evaluation baselines.
- **Stage 1 — Delegated:** Preview/approve for write actions; deterministic outcome verification; scoped tool permissions.
- **Stage 2 — Bounded autonomy:** Enforced budgets; policy gates for privileged actions; escalation triggers and degraded modes; canary and rollback.
- **Stage 3 — Supervisory:** Orchestrator as validation bottleneck; specialist agents with narrow scopes; cross-agent budgets and provenance.
- **Stage 4 — Interoperable:** MCP/A2A under strict governance; shared policy and audit; cross-domain budgets and verification.

## Key principle

*Epistemic and autonomy gates must scale with risk.* Low-stakes workloads can tolerate lighter gates; high-stakes require strong, unavoidable gates and explicit accountability.

## Additional resources

- Framework overview and pillars: `docs/05-framework-overview.md`
- Application method (design + review): `docs/15-application-method.md`
- Whitepaper and website: https://agenticaf.io/
