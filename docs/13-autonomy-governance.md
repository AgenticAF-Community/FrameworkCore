---
title: "Cross-Cutting Foundation: Autonomy & Outcome Governance"
sidebar_position: 13
---

## 

# 

# **Cross-Cutting Foundation: Autonomy & Outcome Governance**

(Define “how much agency,” define “what done means,” and design the gates that prevent probabilistic outputs from becoming unearned authority)

Autonomy and outcome governance is the second horizontal foundation of this framework because it is the control layer that determines whether an agentic system is merely useful—or operationally safe and scalable.

The core issue is simple:

* Agentic systems are probabilistic at the reasoning layer.

* Yet their outputs can become decisions and actions that look deterministic to humans and downstream systems.

Without explicit governance, probabilistic outputs quietly cross the epistemic boundary from “candidate” to “authority.” This is the failure pattern behind many high-impact incidents: not that the model was probabilistic, but that the system treated probabilistic outputs as deterministic truth.

This foundation formalizes how to prevent that.

The autonomy & outcome governance objective is:

*Grant the minimum necessary autonomy, constrain it with budgets and policy gates, and ensure outcomes are verified against explicit definitions of done before the system confers authority.*

### **12.1 Autonomy Is Not a Feature. It Is a Controlled Operating Mode.**

Most teams talk about autonomy as if it were a capability upgrade: “the agent can do more.” Architecturally, autonomy is closer to granting production permissions: it changes the risk profile of every step.

OWASP’s GenAI risk taxonomy provides a useful framing here. “Excessive Agency” is defined as the vulnerability that enables damaging actions to be performed in response to unexpected or ambiguous outputs from an LLM, regardless of whether the trigger was hallucination, prompt injection, malicious tools, or poor prompting. OWASP identifies root causes as excessive functionality, excessive permissions, or excessive autonomy. 

In other words: autonomy is not intrinsically good or bad. Unbounded autonomy is simply ungoverned risk in the pursuit of more initiative or less development time. 

### **12.2 The Autonomy Ladder: Explicit Levels With Explicit Controls**

A well-architected agent does not have “autonomy.” It has a declared autonomy level that maps to governance controls.

A practical taxonomy:

1. **Assistive (Human-led)**

* Agent proposes, drafts, summarizes, recommends.

* Human remains the actuator and accountable decision-maker.

2. **Delegated (Human-approved execution)**

* Agent proposes actions and generates execution plans.

* Execution requires explicit approval at an epistemic gate (preview → approve → execute).

3. **Autonomous (Bounded autonomy)**

* Agent executes within explicit budgets and policy constraints.

* Humans intervene by exception, not by default.

* Requires rigorous verification and strong rollback.

4. **Supervisory / Orchestrator**

* A manager agent coordinates workers and enforces validation bottlenecks.

* This topology is often necessary to scale autonomy safely (especially in multi-agent environments), but it must be designed explicitly; “agents checking each other” is not governance.

This ladder matters because the framework is not trying to maximize autonomy. It is trying to make autonomy safe, explainable, and economically bounded.

### **12.3 Outcome Governance Begins With a Formal “Definition of Done”**

In agentic systems, “done” cannot be a narrative claim. It must be a verifiable end state.

Anthropic’s evaluation guidance makes this explicit: the outcome of an agent trial should be judged by the final environment state, not by the transcript. 

This is the basis of outcome governance:

* Every task class has a Definition of Done (DoD).

* Every DoD has associated acceptance checks.

* Every acceptance check has evidence artifacts (state query results, links, diffs, screenshots, IDs, etc.).

Implement validation checks as deterministic gates (and treat verification evidence as a first-class artifact surfaced to operations; see Section 8 on observability)

Examples:

* “Email triage complete” → mailbox state reflects label moves + no duplicates + audit log exists.

* “Deployment complete” → target endpoint responds + health checks pass + version tag matches.

* “Data moved” → checksum/record counts match + lineage recorded.

Outcome governance is therefore the discipline of making success testable and making failure diagnosable.

### **12.4 Epistemic Gates: Where Possibility Becomes Authority**

Autonomy and outcome governance is, in practice, the architecture of epistemic gates.

An epistemic gate is the point where the system converts an AI output from:

* a candidate (draft/hypothesis / plan), into

* an authoritative input that drives a decision or an action.

A well-governed system separates three phases:

1. **Generation**

* The model produces hypotheses, options, plans, drafts.  
    
2. **Validation**

* Truth and constraints are reintroduced through mechanisms the model does not control:

  * deterministic checks (schemas, assertions, policies)

  * grounded sources (databases, verified APIs, retrieval with attribution)

  * human review for high-risk classes

3. **Authority**

* A defined actor (human, policy engine, supervisor agent under strict rules) converts validated output into action.

This structure aligns with the NCSC’s warning about prompt injection: because prompt injection may not be fully mitigable, systems must be designed to reduce impact by limiting what a manipulated model can cause downstream. 

Epistemic gates are a concrete way to implement that impact-reduction philosophy.

### **12.5 Budgeted Autonomy: The Hard Limits That Prevent Runaway Systems**

Budgets are not just cost controls. They are governance controls.

As outlined already a well-architected agent operates under explicit budgets such as:

* maximum steps per task

* maximum tool calls per task

* maximum tokens per task

* maximum wall-clock time per task

* maximum spend (where measurable)

* maximum risk class allowed without escalation

Research on budget-constrained agents supports this directly. The paper Budget-Aware Tool-Use Enables Effective Agent Scaling shows that simply increasing tool-call budgets does not improve performance because agents lack budget awareness; budget-aware methods improve cost-performance scaling by adapting planning and verification strategies under explicit resource constraints. 

Architecturally, this yields a practical rule:

*Autonomy must be explicitly bounded by budgets, and budgets must be visible to the agent and enforceable by the system.*

Budgets also provide safe failure modes. When a budget is exhausted, the system does not “keep trying.” It escalates, requests clarification, or defers.

### **12.6 Escalation Policies: When the Agent Must Stop and Ask**

Autonomy governance is defined as much by when the agent stops as by what it can do.

Escalation should be mandatory when:

* the agent cannot verify the DoD,

* tool outputs are inconsistent or ambiguous,

* an action is irreversible or high blast-radius,

* permissions required exceed the agent’s assigned scope,

* a budget threshold is reached,

* security signals appear (suspected prompt injection, suspicious content).

OWASP’s “Excessive Agency” framing is again directly relevant: one of the core failure causes is allowing the model to proceed into damaging actions without sufficient constraints or safeguards. 

In mature systems, escalation is not a “nice to have.” It is a first-class mechanism of control.

**Standard interrupt protocol: approvals and escalation as first-class system events**  
 Escalation must be expressed as a structured interrupt, not as a vague conversational “I need approval.” When an agent hits a gate, the system should transition the run to **APPROVAL\_REQUIRED** (or a related interrupt state) and emit an approval packet that can be reviewed and resumed deterministically.

A minimal approval/interrupt packet should contain:

* **Proposed action:** the exact tool call or state change requested

* **Risk class:** read / write / irreversible

* **Policy binding:** ACC version + policy hash + run id

* **Change summary:** diff summary or tool-argument summary (not raw dumps)

* **Evidence so far:** tests/logs/queries that justify the action

* **Resume semantics:** what happens on approve vs deny (and which step resumes)

This protocol turns escalation into a governable mechanism: approvals become auditable decisions tied to policy and evidence, and resumption becomes deterministic rather than ad-hoc.

### **12.7 Multi-Agent Governance: Coordination Does Not Replace Control**

As systems scale, multi-agent orchestration becomes common (specialists, workers, sub-agents). The governance requirement increases, not decreases:

* agents can coerce or mislead other agents, intentionally or accidentally,

* messages can carry hidden instructions,

* tool access can multiply,

* error propagation becomes harder to contain.

The governance implication is:

Multi-agent systems must have explicit coordination control points (supervisors, policy gates, validation bottlenecks) and shared budgets.

Without these controls, you risk building an autonomy amplification engine: more agents, more loops, more context churn, more tool calls, more failure surface.

### **12.8 Operationalizing Autonomy & Outcome Governance**

A practical implementation model is:

* Declare autonomy level per workflow/task class

* Assign budgets per level (steps/tools/tokens/time/spend)

* Define Definition of Done per task class

* Implement validation checks as deterministic gates

* Enforce policy gates before privileged tool calls

* Escalate on uncertainty, budget exhaustion, or high-risk actions

* Log observability traces (intent → plan → act → verify) for audit and improvement

* Evaluate outcomes continuously (regression + production sampling)

This converts autonomy from an implicit emergent property into an explicit governed operating mode.

### **12.9 A Governance Standard for Agentic Systems**

A useful standard statement for this foundation is:

We can explain what the agent is allowed to do, how far it can go, what “done” means, how success is verified, and who (or what) is authorized to convert outputs into actions—at every risk level.

If you cannot articulate those elements, you do not have autonomy governance. You have a system that is functioning on trust—and trust is not an architecture.

<!-- AAF-ENGINE:START — generated from trade-offs.js, do not edit manually -->

### 12.10 Design Recommendations & Trade-offs

**Key recommendations**

- Grant the minimum necessary autonomy for a task and constrain it with explicit policy gates, least-privilege tool access, and mandatory verification for write actions.
- Enforce explicit, non-bypassable budgets on steps, tool calls, tokens, time, and spend as a primary mechanism for governing autonomy.

**Cross-pillar trade-offs**

- **Autonomy x Security:** Increasing an agent's level of autonomy without sufficient governance controls like permissions and policy gates creates the 'Excessive Agency' security vulnerability. Grant the minimum necessary autonomy for a task and constrain it with explicit policy gates, least-privilege tool access, and mandatory verification for write actions. *(source: 4.2.B)*
- **Autonomy x Cost:** Granting an agent high levels of autonomy without enforced budgets for its actions (steps, tool calls, tokens) leads to unpredictable and potentially runaway operational costs. Enforce explicit, non-bypassable budgets on steps, tool calls, tokens, time, and spend as a primary mechanism for governing autonomy. *(source: intro)*

**By autonomy level**

- **Assistive:** Not applicable, as the human is the actuator and the agent has no direct autonomy to pose a security risk through its own actions.; The agent may propose a long, complex plan that would be costly to execute, but the cost is ultimately controlled by the human's decision to act.
- **Delegated:** The agent may propose a damaging action (due to manipulation or error), and security relies solely on the human approver catching it.; The agent's plan may not include a cost estimate, forcing the human to approve an action with unknown financial impact.
- **Bounded Autonomous:** This is the most critical level. An agent with excessive autonomy can be manipulated into performing harmful actions directly, as it operates without a default human-in-the-loop gate.; A fully autonomous agent without a budget can easily enter a retry loop or perform extensive, low-value exploration, leading to massive cost overruns. This is the highest-risk level for this trade-off.
- **Supervisory:** A supervisory agent with excessive autonomy could mismanage worker agents, grant them elevated permissions, or approve harmful actions, leading to large-scale security incidents.; A supervisory agent can burn its entire budget orchestrating inefficient worker agents, or a single runaway worker can exhaust the shared budget for the whole team.

<!-- AAF-ENGINE:END -->

## **Section 12 Citations (Sources & Links)**

1. OWASP GenAI Security Project — LLM08: Excessive Agency (definition, root causes: excessive functionality/permissions/autonomy).  
    https://genai.owasp.org/llmrisk2023-24/llm08-excessive-agency/ 

2. UK NCSC — Prompt injection is not SQL injection (it may be worse) (impact-reduction framing; prompt injection as structurally different).  
   https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection 

3. UK NCSC — Mistaking AI vulnerability could lead to large-scale breaches (reinforces the risk of misunderstanding prompt injection and the need for system-level controls).

   https://www.ncsc.gov.uk/news/mistaking-ai-vulnerability-could-lead-to-large-scale-breaches 

4. Anthropic — Demystifying evals for AI agents (outcomes judged by final environment state; eval harness as infrastructure).  
   https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents 

5. Liu et al. — Budget-Aware Tool-Use Enables Effective Agent Scaling (explicit tool-call budgets; budget awareness improves cost-performance scaling).  
   https://arxiv.org/abs/2511.17006 

6. Liu et al. — Budget-Aware Tool-Use Enables Effective Agent Scaling (HTML; details on unified cost metric and adaptive planning/verification under budgets).

   https://arxiv.org/html/2511.17006v1 
