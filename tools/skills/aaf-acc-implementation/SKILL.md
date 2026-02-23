---
name: aaf-acc-implementation
description: Helps agents and developers implement Agent Control Contracts (ACC) well. Provides a comprehensive template, where to place ACC in the architecture, and how ACC differs from AGENTS.md. Use when defining workflow governance, policy envelopes, or linking AGENTS.md to governance.
---

# AAF Agent Control Contract (ACC) Implementation

Use this skill when implementing or reviewing **Agent Control Contracts**: the governance envelope that declares what a workflow is permitted to do and what evidence it must produce before outputs gain authority.

## What an ACC is

An **Agent Control Contract** is a **per-workflow** declaration of:

- Autonomy level and permitted tasks
- Allowed tools and scopes (least privilege)
- Write actions that require approval
- Budgets (steps, tools, tokens, time, spend)
- Definition of Done and required evidence
- Escalation triggers and logging/trace requirements
- Rollback/recovery plan

It converts agent behaviour from **emergent** to **intentional** and sits in the **Governance Layer** (non-bypassable). The platform or supervisor enforces it; the orchestrator does not replace it.

## Where to implement the ACC in your architecture

- **Governance layer:** The ACC is a **policy object** read and enforced by the platform (e.g. tool gateway, approval service) and/or by a **supervisor (master) agent** in multi-agent setups. It is **not** owned by the orchestration engine.
- **Per workflow:** One ACC (or one global ACC plus nested sub-contracts per worker) per workflow or task class. Version and reference by hash in traces and approvals.
- **Load point:** The orchestrator (or runtime) should **load** the ACC (or a short Policy Summary) and pass it to the supervisor; the supervisor treats it as binding. Workers receive only a **policy summary** and narrow sub-contract, not the full policy.
- **Canonical form:** Prefer a **canonical structured form** (YAML/JSON) as source of truth, enforced by the platform. Human-readable markdown can be generated from it—not the other way around.

## ACC vs AGENTS.md (or agents.md)

| | **AGENTS.md** | **Agent Control Contract (ACC)** |
|---|---------------|-----------------------------------|
| **Purpose** | Repository- and team-specific **operating instructions** for the agent | **Governance envelope**: what the workflow is permitted to attempt and what evidence is required |
| **Content** | How to run tests, where configs live, what not to touch, contribution conventions, repo norms | Autonomy level, allowed tools/scopes, budgets, DoD, verification steps, escalation triggers, logging |
| **Scope** | “How we work in this repo” | “What this workflow is allowed to do and how we verify it” |
| **Authority** | Guidance for the agent | Binding policy; platform/supervisor enforces it |
| **Epistemic gate** | Does not define authority | Defines what must be true before output becomes authoritative (DoD, evidence) |

**Link them:** AGENTS.md should **reference** the relevant ACC(s) for the codebase or workflow. At runtime, the orchestrator can load a short Policy Summary from the ACC **alongside** AGENTS.md. Result: AGENTS.md guides *how* the agent works in the environment; the ACC constrains *what* it is permitted to attempt and what evidence it must produce before crossing an epistemic gate into authority.

## Comprehensive ACC template

Use this as the checklist for each workflow. Prefer a **structured form** (YAML/JSON) as canonical; markdown below is for readability.

```yaml
# Agent Control Contract (canonical form — enforce via platform/supervisor)
workflow_name: string
version: string
policy_hash: string  # e.g. hash of canonical policy for trace binding

autonomy_level: assistive | delegated | bounded_autonomous | supervisory

allowed_tools: [{ name, scope, read_only }]
write_actions_requiring_approval: [list of tool/action]

budgets:
  max_steps: number
  max_tool_calls: number
  max_tokens: number | null
  max_wall_time_seconds: number | null
  max_spend: number | null

definition_of_done: string
validation_checks: [list of required checks]
evidence_required: [artifacts: state query, links, diffs, IDs, etc.]

escalation_triggers:
  - cannot_verify_dod
  - ambiguous_tool_output
  - irreversible_action
  - budget_exhausted
  - security_signal

logging_trace_requirements: string
rollback_recovery_plan: string
```

**Markdown view (template for human review):**

- **Workflow name:** 
- **Autonomy level:** assistive | delegated | bounded autonomous | supervisory
- **Allowed tools + scopes:** (least privilege; read vs write vs irreversible)
- **Write actions requiring approval:** (list)
- **Budgets:** steps / tools / tokens / time / spend
- **Definition of Done:** (verifiable end state)
- **Validation checks + evidence required:** (what must be true; what artifacts)
- **Escalation triggers:** (when to stop and ask / defer)
- **Logging / trace requirements:** (what to emit for audit)
- **Rollback / recovery plan:** (how to revert or recover)

## Multi-agent: nested sub-contracts

When a **supervisor** delegates to **workers**, use **nested ACCs** (worker sub-contracts):

- **Global ACC** defines workflow-level controls.
- **Supervisor** generates **worker sub-contracts** that narrow: budgets (steps/tokens/time), tool allowlists (often none for workers), context scope, required output schema and evidence.
- Workers receive only the **policy summary** and their **sub-contract**, not the full policy. This keeps delegation auditable and composable.

## What the ACC cannot do

Agent-enforced governance (supervisor reading ACC) is **not** sufficient for:

- Stopping a compromised agent from attempting disallowed actions
- Preventing prompt injection from producing malicious tool arguments
- Enforcing permissions at runtime

**Platform enforcement** (tool gateway, budgets, approvals) remains the **safety boundary**. The ACC defines the policy; the platform enforces it.

## Checklist

- [ ] ACC exists per workflow in canonical form (YAML/JSON) and is versioned/hashed.
- [ ] ACC is loaded and enforced in the governance layer (platform and/or supervisor).
- [ ] AGENTS.md references the relevant ACC(s); runtime loads Policy Summary alongside AGENTS.md where feasible.
- [ ] Template fields are filled: autonomy, tools, budgets, DoD, evidence, escalation, logging, rollback.
- [ ] In multi-agent setups, worker sub-contracts narrow scope and are generated from the global ACC.

## Additional resources

- Annex: Agent Control Contracts: `docs/19-annex-agent-control-contracts.md`
- Application method (design-time, ACC template): `docs/15-application-method.md`
- Governance vs orchestration: `docs/02-introduction.md`
- Whitepaper: https://agenticaf.io/
