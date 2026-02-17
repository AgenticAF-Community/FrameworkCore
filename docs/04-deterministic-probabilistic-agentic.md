---
title: "Deterministic, Probabilistic, and Agentic Systems"
sidebar_position: 4
---

# 

# **Deterministic, Probabilistic, and Agentic Systems**

(Choosing the right paradigm—and combining them safely)

One of the most important claims in this paper is also one of the least fashionable: AI (and agents) are not the solution to every problem. A well-architected agentic system is not “AI-first”; it is outcome-first. That means being explicit about when to use deterministic systems, when probabilistic reasoning is justified, and how to combine both without creating fragility.

The goal of this section is to establish a clear mental model:

* Deterministic systems are the backbone of reliability and correctness.  
  Probabilistic systems (LLMs) introduce flexible reasoning, but with variance and uncertainty.

* Agentic systems sit above both: they use probabilistic reasoning to orchestrate deterministic execution toward an outcome.

### **3.1 Deterministic Systems: Predictable, Testable, and Auditable**

A deterministic system is one where the same inputs produce the same outputs under the same conditions. This is the foundational assumption behind:

* scripts and services,

* workflow engines,

* business rules,

* ETL and data pipelines,

* CI/CD pipelines,

* standard APIs.

Deterministic systems are strongest when:

* correctness is non-negotiable,

* inputs and outputs can be specified, and

* The system must be testable and auditable.

In well-architected agentic systems, deterministic components are not “legacy”; they are the stability layer. They provide:

* reproducibility (debugging is possible),

* formal verification (unit tests, assertions, schemas),

* bounded behavior (clear failure modes),

* crisp compliance and audit trails.

**A key architectural principle emerges:**

Where the required behavior can be specified precisely, use deterministic systems.  
Save probabilistic reasoning for the parts that genuinely require judgment under uncertainty.

### **3.2 Probabilistic Systems: Flexible Reasoning With Variance and Uncertainty**

LLM-driven systems are probabilistic because they generate outputs conditioned on likelihoods rather than executing a fully specified program. Imitative and proactive action are opportunities within probabilistic systems and form the secret sauce within good agentic systems. This introduces strengths, particularly when navigating ambiguity, natural language, fuzzy intent, and partial information, but it also introduces variance:

* the same prompt can yield different outputs, in the same way a human will interpret a task differently.  
* intermediate reasoning steps may shift run-to-run,  
* formatting and tool-selection can drift.

This is not theoretical. Reliability research on tool-using agents shows that production readiness is not captured by “single-run success.” ReliabilityBench explicitly argues that agent benchmarks must measure:

* consistency under repeated execution,

* robustness to semantically equivalent perturbations, and

* fault tolerance under tool/API failures. 

It also introduces action metamorphic relations, where correctness is graded by end-state equivalence, not transcript similarity—an important move away from “did it say the right thing?” to “did it land the right outcome?” 

The implication for architecture is direct:

Probabilistic systems require verification, not trust.  
Their outputs should be treated as candidates that must be validated.

### **3.3 Agentic Systems: Probabilistic Reasoning Orchestrating Deterministic Execution**

Agents are not “just probabilistic systems.” They are software systems that loop: interpret context → decide → act via tools → observe results → adapt → verify → stop.

This is why agents are distinct from workflows. 

A useful distinction: workflows tend to solve structured problems via pre-defined steps, whereas agents solve more unstructured problems that require flexible decision-making and dynamic tool selection, and that dynamic selection introduces additional nondeterminism. 

ReAct is a canonical example of how agents interweave reasoning and acting: reasoning updates the plan, while actions interact with external systems to gather information or change state, reducing hallucination and improving interpretability. 

This is the architectural “sweet spot”:

* The agent handles judgment, sequencing, exception handling, and coordination.

* Deterministic systems handle execution, guarantees, constraints, and repeatability.

A simple framing that tends to hold up in production:

Probabilistic in, deterministic out.  
Let models interpret and decide; let deterministic systems execute and enforce.

### **3.4 Where Things Break: Frictions Between Deterministic and Agentic Systems**

A lot of production pain is caused by mismatches between what deterministic systems expect and what agentic systems naturally produce.

#### **Friction 1: Contract mismatch (strict schemas vs flexible language)**

Deterministic systems demand strict inputs: schemas, types, formats, and explicit parameters.

Agents often produce approximate or variably formatted outputs and present this as deterministic. 

Design requirement: Introduce adapters:

* schema validation,

* structured output constraints,

* robust parsing,

* explicit tool argument typing,

* rejection + repair loops when parsing fails.

#### **Friction 2: Failure modes (loud failure vs silent failure)**

Deterministic systems fail explicitly (exceptions, error codes).

Probabilistic systems can fail silently (confidently wrong).

Design requirement: Agents must:

* detect uncertainty,

* surface ambiguity,

* verify end-states,

* escalate on low confidence or high risk.

ReliabilityBench’s focus on robustness and fault tolerance under rate limits, schema drift, and partial tool responses highlights why production systems must assume these failure modes are normal, not edge cases. 

#### **Friction 3: Debuggability (replayable runs vs stochastic paths)**

Deterministic systems support replay, explainability and root-cause analysis.

Agentic behavior can vary depending on model sampling, tool selection paths, and context differences.

Design requirement: Observability must include:

* intent,

* plan steps (as permissible),

* tool calls,

* tool outputs,

* verification checks,

* final state and evidence artifacts.

This ties directly into operational excellence and outcome governance.

### **3.5 Core Design Patterns for Combining Them Safely**

These patterns show up repeatedly in stable agentic deployments.

#### **Pattern A: Deterministic Core, Agentic Edge**

Keep core business rules deterministic. Use agents for:

* interpretation,

* triage,

* routing,

* exception handling,

* decision support.

This reduces risk while retaining leverage.

#### **Pattern B: Agent Plans, Deterministic Execution**

Let agents generate plans or task graphs, but execution happens via:

* workflows,

* scripts,

* services,

* jobs,

* CI pipelines.

This creates a clean separation between “thinking” and “doing.”

#### **Pattern C: Deterministic Verification of Probabilistic Reasoning**

Treat verification as a separate stage:

* schema validation,

* assertions,

* unit tests,

* end-state checks,

* “definition of done” tests.

Anthropic’s evaluation guidance for agents reinforces that the grading target should be the final state/outcome rather than over-penalizing creative intermediate paths. 

#### **Pattern D: Bounded Autonomy Through Budgets and Gates**

Agents should operate under explicit limits (steps, tool calls, spend, time) and escalate when exceeding them. This is where autonomy governance intersects directly with context optimization and cost control (and becomes a horizontal layer across the framework).

### **3.6 A Practical Heuristic: When to Use Which**

A simple decision rule that avoids most mis-architecture:

* Use deterministic systems when you can specify the logic and test it.

* Use probabilistic components when the problem is ambiguous, language-heavy, or underspecified.

* Use agents when you need multi-step coordination across tools and evolving context to achieve an outcome.

And importantly:

If a deterministic workflow solves the problem cleanly, ship the workflow.

Use agents when they unlock leverage you cannot reasonably hard-code.

That discipline is foundational to “well-architected” agentic systems.

## **Section 3 Citations (Sources & Links)**

1. OpenAI: Evaluation best practices (agents introduce nondeterminism via dynamic tool selection; distinction vs workflows)

   https://platform.openai.com/docs/guides/evaluation-best-practices 

2. OpenAI: A practical guide to building AI agents (agent vs single-agent framing; tool-driven capability expansion)  
   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/ 

3. Gupta et al. — ReliabilityBench: Evaluating LLM Agent Reliability Under Production-Like Stress Conditions (consistency, robustness, fault tolerance; end-state evaluation)

    https://arxiv.org/abs/2601.06112 

4. Anthropic: Demystifying evals for AI agents (agent eval framing; outcome-focused evaluation)

    https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents 

5. Yao et al. — ReAct: Synergizing Reasoning and Acting in Language Models (agent loop; grounding via actions)  
   https://arxiv.org/abs/2210.03629 

6. Google Research:  ReAct blog (overview and framing for reasoning+acting loop)

   https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/ 
