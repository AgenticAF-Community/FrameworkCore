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

**Security**

- [ ] All entry points authenticated and authorized.
- [ ] Tool scopes least privilege; write actions gated and verified.
- [ ] Untrusted inputs (including retrieved content) treated as hostile.

**Reliability**

- [ ] Success defined as verifiable end state.
- [ ] Tool failures expected and handled; actions idempotent or checkpointed; retries safe.

**Cost**

- [ ] Budgets enforced at runtime.
- [ ] Model routing explicit by phase and risk; context budgeted; caching and early stopping designed.

**Operational excellence**

- [ ] Full loop observable (observe → decide → act → verify).
- [ ] Evaluation harness and regression suite; staged rollout with rollback; skills/tools versioned and reviewed.

**Performance**

- [ ] Topology justified (single-agent by default; orchestration only where it helps).
- [ ] Tool round trips minimized; work partitioned (interactive vs batch).

**Sustainability**

- [ ] Usage measured and visible; efficiency levers as defaults (minimal context, concise outputs, cached prefixes, bounded loops).

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
