---
title: "Introduction"
sidebar_position: 2
---


# **INTRODUCTION: WHY AGENTIC ARCHITECTURE MATTERS**

(From model capability to system discipline)

Agentic systems are rapidly becoming the default shape of applied AI: software that can interpret context, plan, call tools, observe outcomes, and iterate toward completion. The moment a system crosses that line, from producing text to initiating actions—it stops being “an LLM feature” and becomes a production software system with an expanded risk profile: larger attack surface, higher operational complexity, and materially greater blast radius when things go wrong.

This white paper introduces the Agentic Architecture Framework: a practical method for designing agentic systems that are safe, reliable, efficient, and governable in real environments. It is intentionally influenced by “well-architected” discipline from cloud engineering—not because agents are “cloud workloads,” but because the failure pattern is identical: when teams neglect foundational architectural pillars, systems become brittle, expensive, and hard to operate at scale. AWS describes this explicitly: neglecting core pillars makes it challenging to build systems that deliver on expectations and requirements. 

### **1.1 Why This Is Now a Systems Problem (Not a Model Problem)**

Early LLM adoption was dominated by single-turn applications: summarisation, drafting, classification, chat interfaces. These systems created value, but their architectural footprint was relatively contained: an answer was generated, a human consumed it, and the downstream impact of failure was usually limited.

Agentic systems change that. They introduce:

* Loops (plan → act → observe → verify), which compound cost, latency, and failure modes.

* Tool invocation, where outputs become API calls, database writes, deployments, messages, and workflow triggers.

* State over time (context + memory), which creates drift, persistence of errors, and non-reproducible behavior if not governed.

* Multi-component topologies (tools, gateways, retrieval systems, agent orchestration), which behave like distributed systems.

This is why “agent reliability” cannot be treated as “model accuracy,” and why “agent security” cannot be reduced to “prompt hardening.” The architecture must assume the reasoning layer is probabilistic and engineer controlled so that probabilistic behavior cannot easily translate into unsafe actions.

A concrete illustration is prompt injection. The UK NCSC warns that prompt injection is categorically not the same as SQL injection; treating it as such can undermine mitigations. The right response is system-level design that reduces risk and reduces impact when the model is manipulated. 

Agentic systems are easiest to reason about when we separate **how work is sequenced** from **what is permitted** and **where it executes**. This framework defines three layers:

* **Orchestration Layer (pluggable):** responsible for control-flow and coordination mechanics, graphs/state machines, agent handoffs, retries, branching logic, checkpointing, and interrupts/resume. Orchestration tools (e.g., graph-based or multi-agent orchestration frameworks) live here. Their job is to decide “what happens next,” not to decide “what is allowed.”

* **Governance Layer (non-bypassable):** responsible for policy and enforcement—Agent Control Contracts (ACC), budgets, approvals, tool allowlists/scopes, gate checks, audit logging, evidence requirements, and safe termination behavior. This layer is the authority boundary: it determines what actions can occur and under what conditions.

* **Execution Layer (isolated):** responsible for running the actual work—sandboxed environments, runners, and connectors where code execution and tool actions take place under strict isolation, network egress controls, and scoped credentials.

**Key constraint:** Orchestrators must **never** call tools directly. All tool actuation must be routed through the governance gateway so permissions, budgets, approvals, and auditability remain non-bypassable.

### **1.2 Where This Framework Came From: Building WrangleAI**

The Agentic Architecture Framework is informed by direct engineering experience building WrangleAI, a platform created to help teams govern and optimise AI usage in production: visibility into usage and cost, controls over access and policy, and mechanisms to prevent runaway spend and unsafe usage patterns.

While building WrangleAI, a recurring pattern emerged across organisations experimenting with agents and LLM-powered workflows:

* AI usage scales faster than governance.  
* Costs become unpredictable because tokens, retries, tool loops, and model selection are rarely budgeted.  
* Access control is often an afterthought (shared keys, unclear ownership, missing audit trails).  
* “It works in the demo” collapses under production realities: rate limits, tool failures, drift, and security constraints.

WrangleAI’s own guidance on AI governance frames the problem directly: governance is the set of systems, processes, and controls that help organisations manage use, cost, security, and compliance, precisely the discipline agentic systems require as they become operational infrastructure. 

Similarly, WrangleAI’s cost-focused writing highlights why spend is difficult to control in practice: lack of visibility, lack of limits, overuse of expensive models, and prompt waste—each of which becomes more acute in loop-based agent designs. 

In short: building WrangleAI forced the same realisation repeatedly—agentic capability is not the bottleneck; governed systems architecture is. This white paper documents the framework that emerged from those practical constraints.

### **1.3 What This White Paper Covers**

This document defines what “agentic” means in operational terms and provides a structured framework for building agentic systems across six architectural pillars:

1. Security Architecture

2. Reliability

3. Cost Optimization

4. Operational Excellence

5. Performance Efficiency

6. Sustainability 

It then introduces two cross-cutting foundations that are uniquely decisive in agentic systems:

* Context Optimization: context is the substrate of autonomy; it must be budgeted, curated, and governed.

* Autonomy & Outcome Governance: autonomy must be explicit, bounded, and gated by verification so probabilistic outputs do not become unearned authority.

The paper is designed to be used in three practical ways:

* Design method (before you build),  
* Architecture review lens (before you deploy), and  
* Maturity model (as you safely scale autonomy over time).

### **1.4 Intended Audience**

This is written for builders and operators of agentic systems:

* engineering leaders shipping LLM-enabled products.  
* platform teams responsible for governance and production controls.  
* security and risk teams assessing agentic architectures.  
* product teams designing agentic workflows with real-world constraints.

It is also relevant for organisations building “AI control planes” (like WrangleAI) or adopting them, because agent governance becomes a shared operational responsibility across engineering, finance, and compliance as usage scales. 

### **1.5 Positioning: Complementary to Existing Guidance, Focused on Agents in Practice**

There is increasing practical guidance on building agents, including frameworks for identifying use cases, designing orchestration, and deploying agents safely and predictably. 

This paper complements that work by focusing on architecture discipline: the repeatable pillars, cross-cutting foundations, and system-level gates that make agentic systems governable at scale, particularly in environments where tool access, data sensitivity, and operational reliability are non-negotiable.

### **Section 1 Citations (Sources & Links)**

1. AWS:  The pillars of the framework (six pillars)  
   https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html 

2. AWS: What is AWS Well-Architected Framework? (pillar basis + architecture review framing)  
    https://docs.aws.amazon.com/wellarchitected/latest/userguide/waf.html 

3. UK NCSC: Prompt injection is not SQL injection (it may be worse)  
    https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection 

4. UK NCSC:  Mistaking AI vulnerability could lead to large-scale breaches  
   https://www.ncsc.gov.uk/news/mistaking-ai-vulnerability-could-lead-to-large-scale-breaches 

5. WrangleAI:  What Is AI Governance? The New Pillar of Machine Learning (governance definition and elements)

   https://wrangleai.com/blog/what-is-ai-governance/ 

6. WrangleAI:  Generative AI cost: What Every CTO Should Know (why cost is hard to control; visibility/limits/model selection/prompt waste

   https://wrangleai.com/blog/generative-ai-cost/ 

7. OpenAI: A practical guide to building agents (deployment best practices and safe/predictable operation framing)

   https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf 

8. OpenAI:  A practical guide to building AI agents (orchestration and deployment overview)

   https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/ 
