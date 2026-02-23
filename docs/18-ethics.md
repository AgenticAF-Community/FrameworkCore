---
title: "Ethical Considerations (Draft)"
sidebar_position: 18
---

# **Ethical Considerations — Draft**

> **This section is a draft.** It captures non-technical ethical dimensions that the six technical pillars do not address. It is expected to evolve through community discussion and is intentionally marked as a working document.

The preceding pillars answer the question *"how do we build agentic systems that are secure, reliable, cost-effective, observable, performant, and sustainable?"* This section asks a different question:

*Should we?*

Not all capabilities that can be delegated to an agent should be. The decision to hand a task to an autonomous system is not purely technical — it carries consequences for human growth, accountability, and purpose. This section offers a framework for thinking about those consequences.

---

### **17.1 The Human Agency Paradox**

Every process that a human performs involves some combination of friction, learning, and growth. When we automate that process, we remove the friction — but we may also remove the learning.

This is the human agency paradox: **the efficiency gains from delegation can come at the cost of human capability.**

Consider a junior engineer who never reviews code because an agent does it. The immediate output improves — reviews are faster and more consistent. But the engineer stops developing the pattern recognition, architectural judgement, and quality instinct that code review builds. Over time, the team becomes dependent on the agent not because the agent is better, but because the humans have stopped growing.

The question architects should ask is not *"can the agent do this?"* but **"what happens to the human when the agent does this?"**

This is not an argument against automation. It is an argument for *intentional* automation — knowing what you are gaining and what you are giving up.

---

### **17.2 Meaningful Friction**

Not all friction is waste.

In lean thinking, we distinguish between value-adding work, necessary non-value-adding work, and waste. The same distinction applies to agentic systems — but with an additional category: **developmental friction.**

Developmental friction is the difficulty that builds human skill, judgement, and expertise. It includes:

- Debugging a production issue and learning how the system actually works
- Writing a design document and discovering the requirements are contradictory
- Reviewing a colleague's code and seeing a pattern you hadn't considered
- Manually deploying a release and understanding the operational dependencies

Bureaucratic friction — approval chains with no decision authority, copy-paste data entry, status report formatting — is waste. Automate it freely.

But before delegating a task to an agent, the responsible question is: **is this friction bureaucratic or developmental?** If it's developmental, automating it removes the mechanism by which humans get better at their work.

A practical recommendation: when defining autonomy levels for an agent (assistive, delegated, bounded autonomous, supervisory), consider not just the risk and cost of the task, but also its **learning value** to the human in the loop. Tasks with high learning value may warrant lower autonomy levels — not because the agent can't handle them, but because the human should.

---

### **17.3 Informed Delegation**

When a human delegates a task to an agent, they should understand three things:

1. **What the agent will do** — the scope of action, tools it will use, and decisions it will make.
2. **What the human will stop doing** — the skills, context, and judgement that the human will no longer exercise.
3. **What happens when it goes wrong** — who is responsible, how the failure will be detected, and whether the human can still intervene.

This is the principle of **informed delegation**: the human equivalent of informed consent, applied to agent autonomy.

Over-delegation is a systemic risk. When humans delegate tasks repeatedly without understanding the underlying work, they lose the ability to perform, evaluate, or even supervise those tasks. This creates a dependency that is invisible until the agent fails — at which point the human lacks the knowledge to recover.

The framework's autonomy levels and epistemic gates are designed with this risk in mind. The higher the autonomy level, the more important it is that the delegating human understands what they are handing over and retains the ability to intervene.

---

### **17.4 Accountability and Moral Agency**

Agents act, but they do not have moral agency. They cannot be held accountable for their actions in any meaningful sense. They do not experience consequences, learn from guilt, or carry responsibility.

This means that **accountability for an agent's actions always rests with a human** — the architect who designed it, the operator who deployed it, the user who triggered it, or the organisation that approved its use.

The framework's epistemic gates serve a dual purpose here. Technically, they are validation checkpoints that prevent probabilistic outputs from becoming authoritative actions. Ethically, they are the points where **human judgement should be applied** — especially for high-risk, irreversible, or consequential decisions.

A system that routes all decisions through an agent without human oversight is not just a technical risk — it is an ethical one. It creates a chain of action without a chain of accountability.

The practical test: for any action an agent takes, can you identify the human who is accountable for it? If the answer is "no one" or "it's unclear," the system's governance is inadequate — not just technically, but ethically.

---

### **17.5 Bias, Fairness, and Representation**

Agentic systems amplify. They amplify human capability, but they also amplify the biases embedded in their training data, their tool access, and their operational context.

This amplification operates at multiple levels:

- **Data bias:** The agent's reasoning is shaped by its training data. If that data under-represents certain perspectives, the agent's outputs will too.
- **Access bias:** The tools and data sources an agent can access determine whose information it can act on. If certain populations lack digital presence or tooling, agents will systematically under-serve them.
- **Outcome bias:** Automation benefits accrue to those who deploy it. If agentic systems primarily reduce costs for organisations, the efficiency gains may come at the expense of the workers whose tasks are automated.

Architects should ask: **whose perspectives are missing from the agent's context?** And more broadly: **who benefits from this automation, and who bears the cost?**

Fairness in agentic systems is not just about model output debiasing. It is about the structural decisions — which tasks to automate, who retains oversight, and how the gains are distributed.

---

### **17.6 Purpose and Human Flourishing**

The ultimate question for any technology is whether it contributes to human flourishing — not just productivity, but meaning, growth, and purpose.

Agentic AI systems are extraordinarily powerful. They can reason, plan, act, and adapt. They can operate at speeds and scales that humans cannot match. But power without direction serves no one.

A well-governed agentic system should make the human **more capable, not less relevant.** It should free the human from mechanical work to focus on creative, strategic, and interpersonal work. It should augment judgement, not replace it.

The risk is that we optimise for throughput and forget about purpose. That we build systems that are efficient, secure, reliable, and sustainable — but that leave the humans who use them feeling less capable, less needed, and less fulfilled than before.

This framework does not prescribe specific ethical policies. Those depend on context, culture, and values that vary across organisations and communities. But it does assert that **the ethical dimension is not optional.** Building agentic systems without considering their impact on human agency, accountability, and flourishing is an architectural failure — not because the system will break, but because it will work exactly as designed, and the humans around it will be diminished by its success.

---

### **17.7 Practical Questions for Architects**

When designing an agentic system, consider these questions alongside the technical pillars:

1. **Human growth:** Does this automation remove developmental friction? If so, how will the affected humans continue to grow their skills?
2. **Informed delegation:** Do the users understand what they are delegating? Can they still do the task themselves if needed?
3. **Accountability chain:** For every action the agent takes, is there a clear human accountable for it?
4. **Bias audit:** Whose perspectives are missing from the agent's training data, tool access, and operational context?
5. **Distribution of benefit:** Who benefits from this automation? Who bears the costs or displacement?
6. **Purpose alignment:** Does this system make the humans around it more capable, or less relevant?

These questions do not have universal answers. But the act of asking them — and documenting the answers in the Agent Control Contract — is what separates responsible engineering from optimisation without conscience.
