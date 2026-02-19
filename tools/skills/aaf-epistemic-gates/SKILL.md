---
name: aaf-epistemic-gates
description: Guides when and where to place epistemic gates; candidate → validated → authority; gates scale with risk. Use when defining validation vs authority, reducing "AI said so" authority, or designing high-stakes decision flows.
---

# AAF Epistemic Gates

An **epistemic gate** is the point where an AI output stops being a possibility and becomes something the system (or a human) treats as knowledge, decision, or action. This skill helps place and scale those gates.

## Core rule

*Epistemic gates must scale with risk.*

- Low-stakes use can tolerate lighter validation gates.
- High-stakes use requires strong, unavoidable gates and explicit accountability.

## Three phases (separate them)

**1. Generation**

The model produces candidates: drafts, options, plans, hypotheses, tool arguments. At this stage treat outputs as **candidates**, not truth.

**2. Validation**

Truth and constraints are reintroduced through mechanisms the model does **not** control:

- Deterministic checks (schemas, assertions, policies)
- Grounding (databases, verified APIs, retrieval with attribution)
- Human review for high-risk classes

**3. Authority**

A defined actor (human, policy engine, or supervisor under strict rules) converts **validated** output into action. If authority is implicitly granted to the model (“because the AI said so”), the epistemic boundary has collapsed.

## Where to place gates

- **Before any write or irreversible action:** Validate arguments and policy; require approval when risk is high.
- **Before treating model output as “done”:** Check against Definition of Done and collect evidence (state, checksums, logs).
- **At handoffs:** When one agent or step passes output to another, treat the handoff as a gate (validation + scope).
- **At external boundaries:** Before data or commands leave the system (APIs, tools, user-facing decisions).

## Design questions

- Where are the boundaries between generation → validation → authority in this flow?
- Which gates are deterministic (schema, policy engine) vs human approval vs automated-but-auditable?
- Who or what is authorized to convert validated output into action at each risk level?
- What evidence is required before authority is conferred?

## Escalation as a gate

When the agent cannot verify, or action is high-risk or irreversible, the system should **stop and escalate**—not proceed. Escalation should be a first-class interrupt (e.g. APPROVAL_REQUIRED) with a structured packet: proposed action, risk class, policy binding, evidence so far, resume semantics. This makes approvals auditable and resumption deterministic.

## Outcome governance link

“Done” cannot be a narrative claim. Every task class should have a Definition of Done, acceptance checks, and evidence artifacts. Validation gates should be deterministic where possible; verification evidence should be surfaced to operations.

## Glossary (AAF)

- **Policy gate:** Permission/authorization decision (e.g. “allowed to call this tool?”).
- **Validation gate:** Correctness check against truth/constraints (schema, tests, evidence).
- **Epistemic gate:** The boundary where output transitions from candidate → validated → authoritative decision/action.

## Additional resources

- What is an agent (epistemic gates): `docs/03-what-is-an-agent.md` (§2.5)
- Autonomy & outcome governance: `docs/13-autonomy-governance.md`
- Executive summary: `docs/01-executive-summary.md`
- Whitepaper: https://agenticaf.io/
