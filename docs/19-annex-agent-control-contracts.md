---
title: "Annex: Agent Control Contracts"
sidebar_position: 19
---

# **Annex - Agent Control Contracts** 

## **A. Agent-Enforced Governance: Master Agents as Policy Supervisors**

(Defense-in-depth: platform-enforced controls + agent-enforced controls)

In mature agentic systems, governance should not rely on a single mechanism. The platform must enforce hard boundaries (tool allowlists, permission scopes, budgets, approvals), but agents—particularly master/supervisor agents—can and should enforce governance within the agent ecosystem by applying policy constraints during planning, delegation, and verification.

This yields a practical and scalable model:

*The platform prevents violations. The master agent prevents intent drift.*  
*Platform enforcement is non-bypassable. Master-agent enforcement is the first line of governance inside the agent loop.*

Master-agent enforcement becomes especially valuable in multi-agent architectures where work is delegated to junior agents. It provides:

* consistent policy interpretation across tasks and teams,

* reduced policy-block churn (fewer “try and fail” tool calls),

* a structured escalation mechanism, and

* a governance “culture” among agents: workers learn to operate inside constraints rather than bouncing off hard blocks. 

An Agent Control Contract pairs naturally with the AGENTS.md pattern because both exist to make an execution environment legible and governed for agents—while remaining version-controlled and reviewable by humans. 

In practice, AGENTS.md provides the agent with repository- and team-specific operating instructions (how to run tests, where configs live, what not to touch, contribution conventions), whereas the Agent Control Contract defines the workflow’s governance envelope (autonomy level, allowed tools and scopes, budgets, required verification steps, escalation triggers, and Definition of Done). 

The two artifacts should be explicitly linked: AGENTS.md should reference the relevant Agent Control Contract(s) for that codebase or workflow, and—where feasible—the orchestrator should load a short “Policy Summary” from the contract alongside AGENTS.md at runtime. 

This creates a layered control model: AGENTS.md guides how the agent works in a specific environment, and the Agent Control Contract constrains what the agent is permitted to attempt and what evidence it must produce before any output can cross an epistemic gate into authority.

### **A.1 Architecture pattern: Policy Supervisor + Workers**

![Anatomy of Governed Multi-Agent Orchestration](./assets/anatomy-multiagent-v1.png)

Supervisor (Master) agent responsibilities

* Reads the Agent Control Contract (ACC) and treats it as binding.

* Converts policy into an execution plan that is policy-compliant by construction.

* Selects which tools and which worker agents may be used.

* Enforces budgets at the orchestration layer (step limits, tool-call quotas, timeouts).

* Applies required epistemic gates:  
  * ensures validation steps exist in the plan,

  * ensures evidence collection is included,

  * blocks or escalates when the DoD cannot be verified.

* Produces an audit-oriented “decision record” explaining policy-sensitive decisions.

Worker (Junior) agent responsibilities

* Receives narrow, task-scoped context and instructions and a tailored AGENTS.md.

* Operates with limited tool access (or no direct tool access).

* Returns candidate outputs and evidence to the supervisor.

* Never unilaterally escalates autonomy or expands scope.

This maps cleanly to your “master/junior” concept: the master controls and the junior executes.

### **A.2 What agent-enforced governance can do (and what it cannot)**

Agent-enforced governance is effective for:

* preventing policy-violating plans from being generated,

* reducing unnecessary tool calls and budget waste,

* enforcing consistent “stop and escalate” behavior,

* orchestrating validation and evidence collection,

* checking worker outputs against policy and DoD before action.

Agent-enforced governance is not sufficient for:

* preventing a compromised agent from attempting disallowed actions,

* preventing prompt injection from producing malicious tool arguments,

* enforcing permissions at runtime.

Therefore:

Master-agent enforcement is an internal governance layer.  
Platform enforcement remains the safety boundary.

### **A.3 Treat the Agent Control Contract as a shared policy object**

To make governance “among agents,” the ACC needs to become a shared object with:

* a version,

* a hash,

* a canonical structured policy (YAML/JSON), and

* an agent-readable summary.

Recommended:

* Canonical: policy.yaml (machine enforced and machine readable)

* Human/agent readable: AGENT\_CONTROL\_CONTRACT.md generated from YAML

* Summary: a short “Policy Summary” injected into worker prompts

Workers should not receive the full policy; they should receive:

* the policy summary,

* explicit budgets for their subtask,

* and strict scope boundaries.

**ACC as canonical machine contract + nested sub-contracts**

To prevent governance from degrading into prose, the ACC should have a **canonical structured form** (YAML/JSON) that is enforced by the platform and referenced by hash in traces, approvals, and artifacts. Human-readable summaries (e.g., generated markdown) are derived views—not the source of truth.

In multi-agent systems, the supervisor should generate **nested sub-contracts** for workers (Worker Sub-Contracts) that narrow:

* budgets (steps/tokens/time),

* tool allowlists (often none),

* context scope, and

* required output schema + evidence requirements.

This makes delegation auditable and composable: the system can prove not only what the overall workflow permitted, but what each delegated agent was allowed to attempt.

### **A.4 Example: “governance among agents” in practice**

#### **Scenario: Email triage + CRM update workflow**

Supervisor agent

* Reads ACC: CRM updates require approval + staging only + allowed fields only.

* Delegates extraction and classification to a worker agent (no CRM tool access).

* Validates output: does the email contain enough evidence to justify a CRM update?

* If yes: prepares a proposed CRM.update call and routes it to approval.

* If approved: executes CRM.update, then verifies DoD evidence.

Worker agent

* Classifies email intent and proposes structured updates:  
* status, owner, next\_action\_date  
* Returns reasoning + extracted evidence.  
* Never calls CRM tools.

This is governance among agents: the worker cannot violate policy, and the supervisor ensures the workflow remains policy-compliant and verifiable.

## **A.5 Implementation methods**

### **Method A: Supervisor-only tool access (strongest)**

* Only the supervisor can call tools.

* Workers cannot call tools; they produce candidate outputs.

Pros: simplest, strongest containment

Cons: supervisor can become a bottleneck; higher load on supervisor

### **Method B: Scoped tool access per worker (scalable)**

* Supervisor can allocate per-worker “capability tokens”:

  * e.g., worker gets gmail.read only, or crm.read only.

* Tool gateway validates capability tokens against policy.

Pros: more parallelism

Cons: needs robust identity + delegation model

### **Method C: Nested ACCs (composable governance)**

* Global ACC defines workflow-level controls.

* Supervisor generates sub-contracts for workers:

  * smaller budgets,

  * narrower tool allowlists,

  * narrower context policy.

Pros: composable, auditable delegation

Cons: requires careful design to avoid drift and loopholes

## **A.6 Example artifacts: nested contracts**

### **Global policy summary (supervisor)**

Policy Summary (binding)

- Workflow: email\_triage\_crm\_update

- Autonomy: Delegated (approval for crm.update)

- Env: staging only

- Allowed fields for crm.update: status, owner, next\_action\_date

- Budgets: steps\<=10, tool\_calls\<=12, wall\_time\<=180s

- DoD: email labelled + crm receipt + evidence recorded

### **Worker sub-contract summary (generated by supervisor)**

Worker Sub-Contract (binding)

- Role: classify email + propose CRM updates (no tool calls)

- Budget: steps\<=4, tokens\<=2000

- Output schema: {crm\_record\_id, proposed\_fields, evidence\_snippets}

- Stop and ask if: crm\_record\_id missing or evidence unclear

## **A.7 Code example: supervisor-enforced governance in orchestration (Python)**

This is deliberately minimal: it shows the concept of a supervisor refusing to delegate or execute when policy would be violated, while also shaping worker tasks to be policy-safe.

```python
from dataclasses import dataclass

from typing import Dict, Any, List, Optional

import yaml

import hashlib

import json

import time

@dataclass

class Policy:

    raw: Dict\[str, Any\]

    hash: str

@dataclass

class TaskResult:

    ok: bool

    data: Dict\[str, Any\]

    reason: Optional\[str\] \= None

def load\_policy(path: str) -\> Policy:

    with open(path, "r") as f:

        raw \= yaml.safe\_load(f)

    h \= hashlib.sha256(json.dumps(raw, sort\_keys=True).encode("utf-8")).hexdigest()

    return Policy(raw=raw, hash=h)

def policy\_summary(policy: Policy) -\> str:

    b \= policy.raw.get("budgets", {})

    autonomy \= policy.raw.get("autonomy", {}).get("level", "unknown")

    env \= policy.raw.get("environment", "unknown")

    return (

        f"Policy hash: {policy.hash}\\n"

        f"Autonomy: {autonomy}\\n"

        f"Env: {env}\\n"

        f"Budgets: steps\<={b.get('max\_steps')}, tool\_calls\<={b.get('max\_tool\_calls')}, "

        f"wall\_time\<={b.get('max\_wall\_time\_seconds')}s\\n"

    )

def allowed\_crm\_fields(policy: Policy) -\> List\[str\]:

    for t in policy.raw.get("tools", {}).get("allow", \[\]):

        if t.get("name") \== "crm.update":

            return t.get("constraints", {}).get("fields\_allowlist", \[\])

    return \[\]

def supervisor\_delegate\_to\_worker(email\_text: str, sub\_budget\_steps: int, sub\_budget\_tokens: int) -\> TaskResult:

    \# In practice: call a worker agent here. We simulate structured output.

    \# Worker has NO tool access and must return evidence + proposed fields.

    simulated \= {

        "crm\_record\_id": "crm\_4711",

        "proposed\_fields": {"status": "Follow-up", "next\_action\_date": "2026-02-08"},

        "evidence\_snippets": \["Customer requested follow-up next week", "Meeting discussed status change"\]

    }

    return TaskResult(ok=True, data=simulated)

def supervisor\_enforce\_policy\_on\_worker\_output(policy: Policy, worker\_out: Dict\[str, Any\]) -\> TaskResult:

    fields \= worker\_out.get("proposed\_fields", {})

    allow \= set(allowed\_crm\_fields(policy))

    for k in fields.keys():

        if k not in allow:

            return TaskResult(ok=False, data={}, reason=f"Policy violation: crm.update field not allowed: {k}")

    if not worker\_out.get("crm\_record\_id"):

        return TaskResult(ok=False, data={}, reason="Missing crm\_record\_id; cannot proceed.")

    if not worker\_out.get("evidence\_snippets"):

        return TaskResult(ok=False, data={}, reason="Missing evidence; cannot validate proposal.")

    return TaskResult(ok=True, data=worker\_out)

def supervisor\_requires\_approval(policy: Policy, tool\_name: str) -\> bool:

    rules \= policy.raw.get("autonomy", {}).get("approvals", {}).get("required\_for", \[\])

    return any(r.get("action") \== "tool\_call" and r.get("tool") \== tool\_name for r in rules)

def create\_approval\_ticket(payload: Dict\[str, Any\]) -\> str:

    \# placeholder: integrate with ticketing/Slack/etc.

    return "TICKET-10291"

def supervisor\_run(policy\_path: str, email\_text: str) -\> Dict\[str, Any\]:

    policy \= load\_policy(policy\_path)

    start \= time.time()

    \# 1\) Read and internalize policy

    summary \= policy\_summary(policy)

    \# 2\) Delegate safe subtask to worker with a sub-contract (no tools)

    worker \= supervisor\_delegate\_to\_worker(email\_text, sub\_budget\_steps=4, sub\_budget\_tokens=2000)

    if not worker.ok:

        return {"status": "escalate", "reason": worker.reason, "policy\_hash": policy.hash}

    \# 3\) Enforce policy on worker output BEFORE any tool call

    checked \= supervisor\_enforce\_policy\_on\_worker\_output(policy, worker.data)

    if not checked.ok:

        return {"status": "blocked", "reason": checked.reason, "policy\_hash": policy.hash}

    \# 4\) Prepare proposed tool call (still no execution)

    crm\_payload \= {"record\_id": checked.data\["crm\_record\_id"\], "fields": checked.data\["proposed\_fields"\]}

    \# 5\) Apply approval gate

    if supervisor\_requires\_approval(policy, "crm.update"):

        ticket \= create\_approval\_ticket({"tool": "crm.update", "payload": crm\_payload, "policy\_hash": policy.hash})

        return {

            "status": "approval\_required",

            "ticket": ticket,

            "proposed\_action": crm\_payload,

            "policy\_hash": policy.hash,

            "policy\_summary": summary,

            "elapsed\_s": round(time.time() - start, 2),

        }

    \# 6\) If no approval needed (low-risk cases), execute via platform gateway (not shown)

    return {"status": "ready\_to\_execute", "proposed\_action": crm\_payload, "policy\_hash": policy.hash}
```

What this demonstrates

* The supervisor agent enforces policy before acting (pre-flight governance).

* The worker cannot violate policy because it never touches tools.

* Approval rules are applied before execution.

* The policy hash is attached to decisions for auditability.

In production, you would still route the final tool call through the platform tool gateway for hard enforcement.

## **A.8 Example: agent-to-agent governance prompt snippet (supervisor → worker)**

When delegating, the supervisor should pass a constrained “sub-contract” so the worker’s behavior is governed without full policy exposure:

You are a Worker Agent. Your task is limited to classification and proposal only.

You are not allowed to call tools. You must return JSON in the schema below.

Constraints (binding):

- Do not propose any fields outside: \["status", "owner", "next\_action\_date"\]

- If you cannot identify crm\_record\_id or evidence is weak, set "needs\_escalation": true.

Return JSON:

```json
{
  "crm_record_id": "...",
  "proposed_fields": {...},
  "evidence_snippets": ["...", "..."],
  "needs_escalation": false,
  "notes": "..."
}
```

This is an example of governance among agents by agents: the supervisor issues constrained instructions, and the worker is structurally incapable of executing actions.

## **A.9 Design guidance: when to rely more on agent enforcement vs platform enforcement**

Use supervisor enforcement heavily when:

* workflows are complex and need policy-aware planning,

* multi-agent delegation is required,

* you want to reduce hard policy blocks (better UX),

* you need strong DoD evidence collection.

Rely on platform enforcement always when:

* tool calls create side effects,

* permissions matter,

* budgets must be non-bypassable,

* audit requirements exist.

The correct posture is: agents enforce governance by design; platforms enforce governance by control.

