---
title: "Emerging Thought"
id: emerging-thought
sidebar_position: 17
slug: /emerging-thought
description: "Concepts and issues observed across the agentic landscape that are not yet part of the framework but may mature into it."
keywords: [emerging thought, agentic landscape, agentic self-learning, system learning, agent identity, agent trust, epistemic integrity, liquid software, agent adaptation, gamification of building]
---

# **Emerging Thought**

This section captures concepts and issues we observe across the agentic landscape that are **not** yet part of the framework. Content here is exploratory, not normative. Ideas may mature through practice and community discussion and later be adopted into the pillars, foundations, or other framework sections.

---

## **Agentic Self-Learning**

**Agentic self-learning** refers to the **system** improving itself based on its own learnings from runs — for example, updating prompts, policies, workflows, or tool choices in response to observed outcomes. This is distinct from **model learning**: training, fine-tuning, or updating RAG indexes. In agentic self-learning, the change is in the agentic system’s configuration or behaviour over time, not in the underlying model’s parameters or knowledge store.

Why it appears here as emerging rather than in the core framework:

- **Governance and safety:** Who approves system changes derived from runs? How do we avoid drift, feedback loops, or optimising for the wrong signal? Epistemic gates today assume relatively stable system boundaries; self-modifying systems raise new questions about validation and authority.
- **Patterns not yet stable:** Practice is still evolving. The framework may later adopt agentic self-learning as a pillar theme or foundation once architectural patterns and controls stabilise.

---

## **Agent-to-Agent Identity, Trust, and Epistemic Integrity**

As agent ecosystems expand — through protocols like MCP and A2A, multi-vendor integrations, and cross-organisational workflows — **identity** moves beyond authenticating the human user to authenticating the **agent itself**. The question is no longer just "is this user who they claim to be?" but "is this agent who it claims to be, and should I trust what it sends me?"

The challenge deepens when we apply the framework's epistemic gate model to inter-agent communication. Within a single system, the architect controls both sides of the gate: generation, validation, and authority all happen inside a governed boundary. Across agent boundaries, that control breaks down. When Agent A passes an output to Agent B, Agent B may treat it as a validated fact — when from Agent A's perspective it was only a candidate, or when Agent A's validation standards do not meet Agent B's requirements. The epistemic gate collapses **between** systems, not within one.

This creates a set of problems that current protocols do not fully address:

- **Upstream reasoning is opaque:** The receiving agent cannot assess the quality or completeness of the reasoning that produced the output it receives.
- **Validation metadata does not travel with the data:** There is no standard mechanism for an agent to communicate what validation was applied to its output, by whom, and against what policy.
- **Trust is assumed, not earned:** Without provenance attestation, the receiving system defaults to treating inter-agent messages as authoritative — the exact failure pattern the epistemic gate model is designed to prevent.
- **The core question is unanswered:** "How do I know the other system verified this was fact, and do I trust their verification?"

This connects to the framework's Ecosystem and Interoperability section (Section 13), which establishes that governance must sit above the protocol layer, and to Autonomy & Outcome Governance (Section 12), which formalises epistemic gates. The emerging concern is that these concepts must extend across organisational and system boundaries — not just within a single agent's control loop.

Why it appears here as emerging rather than in the core framework:

- **Protocol-level identity and trust attestation standards are not yet mature:** Agent identity, provenance metadata, and cross-system trust negotiation are active areas of development but lack stable, widely-adopted patterns.
- **Cross-organisational epistemic governance is uncharted:** The framework defines epistemic gates within a system boundary. Extending that model to distributed, multi-owner agent ecosystems raises questions about shared verification standards, mutual trust policies, and liability that practice has not yet resolved.

---

## **Liquid Software: Agents as Continuous System Shapers**

Software is becoming **liquid**. The traditional model — humans design, humans build, humans deploy, users consume — is giving way to systems where agents observe user behaviour, feedback, and analytics, then adapt the system itself. Today this manifests as agents pushing UI changes: layouts, flows, component emphasis, personalised experiences. The trajectory points toward agents pushing **functional** changes: features, workflows, integrations, and business logic — all tailored to individual users or user segments and driven by data.

This is distinct from **agentic self-learning** (the preceding entry). Self-learning is the agent improving at its own tasks — updating prompts, policies, or tool choices based on run outcomes. Liquid software is the agent reshaping **the product itself** to better serve the end user or achieve the commercial aims of the system. The agent is not just performing work within the software; it is rewriting the software around the user.

The implications are significant:

- **Per-user adaptation at scale:** The system is never "done." It continuously reshapes around each user and context, driven by feedback loops, heuristics, and user analytics. This challenges the framework's Definition of Done, which is designed for discrete tasks with verifiable end states. Continuous adaptation makes "done" a moving target.
- **Governance of agent-generated changes:** Who approves a UI change that an agent generates for a specific user segment? How do you audit and explain per-user variations? What is the rollback model when there are N different versions of the experience running simultaneously?
- **Commercial-vs-user tension:** When agents optimise the product based on commercial KPIs — conversion, engagement, retention — the optimisation can easily diverge from what is genuinely good for the user. This is A/B testing on steroids, with the agent as the optimiser and no clear mechanism to distinguish "better for the business" from "better for the person."
- **Verification at the product level:** The framework's pillar controls (security, reliability, cost, operations) are designed for governed agent actions. Liquid software introduces a higher-order challenge: governing the cumulative effect of many small agent-driven changes on the product experience over time.

Why it appears here as emerging rather than in the core framework:

- **Governance patterns for continuous agent-driven product adaptation are immature:** There are no widely-adopted patterns for approving, auditing, and rolling back per-user agent-generated system changes at scale.
- **The commercial-vs-user tension is unresolved:** The incentive structures that drive agent-led product optimisation are not yet well-understood, and the architectural controls needed to keep them aligned are still forming.
- **Outcome governance for perpetually adapting systems is an open problem:** The framework's current model assumes tasks with beginnings and endings. Systems that continuously reshape themselves require a different governance model — one that practice has not yet produced.

---

## **The Gamification of Building: When "Can You?" Replaces "Should You?"**

Agentic coding tools have collapsed the friction of starting a project. What once took weeks of scaffolding, configuration, and iterative development can now be produced in an afternoon. The first 80% of a working prototype is trivially easy. This is, in many ways, remarkable — but it has introduced an unintended consequence: **entrepreneurship and app-building have been gamified.**

The dopamine loop is real: prompt an agent, see working code, deploy a prototype, share a screenshot. Model providers and IDE companies amplify this with marketing that encourages everyone to "build anything with AI." The result is a growing volume of projects that are started with enthusiasm but rarely reach production, product-market fit, or a single real user. They are built because they *can* be built, not because they *should* be.

The deeper issue is structural. Building software has always involved friction — technical friction, yes, but also the friction of thinking: validating a problem, understanding users, testing assumptions, confronting the gap between an idea and a viable product. That friction was not waste. It was a **filter** — a mechanism that forced people to engage with whether the thing they were building was worth building before they had invested significant effort. Agentic tools have removed the technical friction, but they have also removed the filter. The reduction in building cost has **decoupled "can I build it?" from "should I build it?"** — and the second question is being systematically skipped.

This connects directly to the framework's Ethical Considerations section (Section 17.2: Meaningful Friction), which distinguishes between bureaucratic friction (waste — automate freely) and developmental friction (the difficulty that builds human skill and judgement). The friction of building was, in many cases, developmental: it forced engagement with requirements, trade-offs, user needs, and technical constraints. Removing it wholesale removes the growth that came with it.

This is not an argument against agentic coding tools. It is an observation that the **ecosystem incentives** are currently misaligned: the tools optimise for starting, the marketing optimises for excitement, and no one is optimising for the question of whether the thing being built addresses a real need or has a credible path to value.

Why it appears here as emerging rather than in the core framework:

- **The trend is accelerating:** As agentic coding tools improve and become more accessible, the volume of low-viability projects will increase. The systemic effects — wasted human effort, unrealistic expectations, market noise, and the erosion of craft discipline — are becoming visible but are not yet well-characterised.
- **The concern is landscape-level, not architectural:** This is not a design pattern or a governance control. It is an observation about what agentic tooling is doing to the broader software ecosystem. The framework should acknowledge it because it shapes the environment in which agentic systems are built and deployed.
- **The corrective mechanisms are unclear:** What would "responsible" look like here? Better defaults in tooling? Validation gates before deployment? A cultural shift toward problem-first thinking? Practice has not converged on answers.
