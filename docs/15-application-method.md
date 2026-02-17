---
title: "How to Apply the Framework in Practice"
sidebar_position: 15
---

## 

# **How to Apply the Framework in Practice**

(Design method, review method, and maturity model)

A framework is only valuable if it changes engineering outcomes. This section translates the Agentic Architecture Framework into a practical operating model for teams building and deploying agentic systems.

### **14.1 Mode 1: Design-Time Architecture (Before You Build)**

At design time, the objective is to make the system’s governance explicit before implementation choices calcify.

A design spec should answer, at minimum:

Autonomy declaration

* What autonomy level is granted (assistive, delegated, bounded autonomous, supervisory)?

* What tasks are permitted at each autonomy level?

Authority model (epistemic gates)

* Where are the gates between generation → validation → authority?

* Which gates are deterministic checks, which require human approval, and which are policy-engine enforced?

Outcome specification

* What is the Definition of Done for each task class?

* What evidence must be collected to validate completion?

Tool governance

* Which tools exist?

* Which tools are read vs write vs irreversible?

* What are the permission scopes (least privilege)?

* What verification checks are required after each tool call?

Budgets

* What are the step/tool/token/time/spend budgets?

* What happens on budget exhaustion (escalation, defer, degrade mode)?

Context policy

* How is context constructed and bounded?

* How is memory separated from task context?

* How is provenance tagged (trusted policy vs untrusted data)?

Failure and escalation

* What are the explicit escalation triggers (uncertainty, inability to verify, high-risk action, suspected injection, tool failures)?

* What are the degraded modes (read-only, observe-only, human-required)?

## **14.1.1 Agent control contracts** 

A useful artifact we have referred to throughout is an “Agent Control Contract” per workflow: a declaration of autonomy, tool permissions, budgets, verification gates, escalation triggers, and logging requirements. This converts “agent behavior” from emergent to intentional.

There is an in depth explanation of ACCs and their role within the anatomy of an agent at Annex A. 

An example of an ACC template :

Agent Control Contract (template)

Workflow name:

Autonomy level:

Allowed tools + scopes:

Write actions requiring approval:

Budgets: (steps/tools/tokens/time/spend)

Definition of Done:

Validation checks + evidence required:

Escalation triggers:

Logging / trace requirements:

Rollback / recovery plan:

See annex for further detail on this concept. 

### **14.2 Mode 2: Architecture Reviews (Pre-Production Readiness)**

Before deployment, apply the pillars as structured review lenses.

Security Architecture

* Are all entry points authenticated and authorized?

* Are tool scopes least privilege?

* Are write actions gated and verified?

* Are untrusted inputs (including retrieved content) treated as hostile?

Reliability

* Is success defined as a verifiable end state?

* Are tool failures expected and handled?

* Are actions idempotent or checkpointed?

* Are retries safe?

Cost Optimization

* Are budgets enforced at runtime?

* Is model routing explicit by phase and risk?

* Is context budgeted (no uncontrolled prompt accumulation)?

* Are caching and early stopping designed in?

Operational Excellence

* Is the full loop observable (observe → decide → act → verify)?

* Is there an evaluation harness and regression suite?

* Is rollout staged with rollback?

* Are skills/tools versioned and reviewed?

Performance Efficiency

* Is topology justified by task structure (single-agent by default; orchestration only where it helps)?

* Are tool round trips minimized?

* Is work partitioned into interactive vs batch?

Sustainability

* Is usage measured and visible?

* Are efficiency levers used as defaults (minimal context, concise outputs, cached prefixes, bounded loops)?

In practice, the absence of budgets, verification, and observability is the most reliable indicator that an agent system is not production-ready.

### **14.3 Mode 3: Operational Control: Tracing, Evidence, and Continuous Evaluation**

To operate agents safely, teams need a consistent record of what happened during a run: model calls, tool calls, handoffs, guardrails, and custom events.

OpenAI’s Agents SDK describes built-in tracing as collecting a comprehensive record of events during an agent run—including LLM generations, tool calls, handoffs, guardrails, and custom events—and frames tracing as a way to debug, visualize, and monitor workflows in development and production. 

Architecturally, tracing is not an observability “nice to have.” It is how you make probabilistic loops governable:

* you can audit what influenced a decision,

* you can reproduce failure contexts,

* you can measure budget consumption, and

* you can link outcomes to evidence artifacts.

### **14.4 A Practical Maturity Model for Scaling Autonomy Safely**

Most organisations should treat autonomy as a staged maturity journey:

**Stage 0 — Assistive**

* read-only tools

* strong human decision authority

* strong logging and evaluation baselines

**Stage 1 — Delegated (human-approved execution)**

* preview/approve gates for write actions

* deterministic verification of outcomes

* scoped tool permissions

**Stage 2 — Bounded autonomy**

* enforced budgets (steps/tools/tokens/time/spend)

* policy gates for privileged actions

* defined escalation triggers and degraded modes

* canary releases and rollback discipline

**Stage 3 — Supervisory orchestration**

* orchestrator as validation bottleneck

* specialist agents with narrow scopes

* cross-agent budgets and identity constraints

* explicit inter-agent provenance controls

**Stage 4 — Interoperable ecosystems**

* MCP/A2A integration under strict governance

* shared policy engines, shared audit trails

* cross-domain budgets and outcome verification

This maturity model reflects the paper’s central stance: autonomy must scale with risk, and governance must scale with autonomy.

Section 14 Citations

* OpenAI Agents SDK tracing (what traces include; production monitoring intent). 
