# AAF Infographic Generation Prompt — NotebookLM

> **Purpose**: Generate branded, social-media-ready infographics for each section of the Agentic Architecture Framework. Upload the framework PDF as your source context before using this prompt.
>
> **Source context**: Upload `agentic-architecture-framework-v1.pdf` to NotebookLM as the primary source.

---

## Branding Specification

Every infographic MUST include ALL of the following branding elements:

### Footer strip (bottom of every image)

- **Bottom-left**: The AAF logo (the "AAF" wordmark with the purple/blue wave motif and "AGENTIC ARCHITECTURE FRAMEWORK" text). Keep it small but legible.
- **Bottom-centre**: The website URL `agenticaf.io` in clean sans-serif type.
- **Bottom-right**: The copyright line: `© All Rights Reserved AAF 2026`

### Visual identity

- **Background**: White or very light grey (#FAFAFA). Clean, uncluttered.
- **Primary accent**: Deep navy/charcoal (#1A1A2E) for headings and key labels.
- **Secondary accents**: AAF purple (#7B61FF to #A78BFA gradient range) and AAF blue (#3B82F6) for highlights, arrows, callout boxes.
- **Typography**: Clean sans-serif (Inter, Helvetica Neue, or similar). Bold for headings, regular for body. No decorative or serif fonts.
- **Icons**: Minimal, flat, monochrome or two-tone. No 3D renders or photo-realistic elements.
- **Aspect ratio**: 16:9 landscape (1600×900px target). This works for both website embedding and social media (LinkedIn, X). No portrait or square layouts.

### Social media requirements

- Each infographic must work as a **standalone social media post**. A viewer who sees only the image (no surrounding article) should understand the core concept.
- No references to "see section X" or "as described on page Y". The graphic is self-contained.
- Titles should be bold, short, and descriptive — designed to stop a LinkedIn scroll.
- Keep content **conceptual and timeless**: no specific vendor names, tool versions, model names, or dates in the diagram content (the copyright date in the footer is the only date).
- The NotebookLM watermark must NOT appear. The AAF branding footer replaces it entirely.

---

## Infographic Specifications

Generate each infographic according to the spec below. You can generate them individually by number or as a batch.

---

### Infographic 1: The Blueprint

- **Filename**: `primer-aaf-overview.png`
- **Title**: "The Blueprint: Agentic Architecture Framework"
- **Source section**: Executive Summary (Section 1)
- **Core concept**: A high-level architectural overview showing the three layers (Orchestration, Governance, Execution) with the Epistemic Gate as the central control point. Below the layers, show the six pillars grouped by function: Safeguard (Security, Reliability), Efficiency (Cost, Sustainability), and Delivery (Operations, Performance). Show the two cross-cutting foundations (Context Optimization, Autonomy Governance) as a base.
- **Key elements**:
  - Three horizontal layers with clear labels
  - Epistemic Gate as the bridge between probabilistic and deterministic
  - Six pillars as columns grouped into three pairs
  - Two cross-cutting foundations as a horizontal base
  - Flow arrows showing: Candidate → Epistemic Gate → Authoritative Action

---

### Infographic 2: The Epistemic Gate (Introduction)

- **Filename**: `section-1-epistemic-gate.png`
- **Title**: "The Epistemic Gate: Turning AI Probability into Production Authority"
- **Source section**: Introduction (Section 2)
- **Core concept**: A three-stage left-to-right flow: Generation (probabilistic candidates) → Validation (the Epistemic Gate) → Authority (deterministic actions). The gate filters fuzzy reasoning into verified, actionable outputs.
- **Key elements**:
  - Left zone: "Generation" — a probabilistic wave/cloud representing fuzzy reasoning, drafts, hypotheses
  - Centre zone: "Epistemic Gate" — a strong structural barrier (gate/checkpoint metaphor) with labels: schema validation, policy checks, human approval for high-risk
  - Right zone: "Authority" — clean, authoritative outputs (tool calls, decisions, API actions)
  - Callout: "Gates Must Scale with Risk" — low-stakes = light validation; high-stakes = strong, unavoidable gates

---

### Infographic 3: The Epistemic Gate (Detailed)

- **Filename**: `aaf-epistemic-gates-v1.png`
- **Title**: "The Epistemic Gate: Turning AI Probabilities into Production Authority"
- **Source section**: What Is an Agent (Section 3)
- **Core concept**: A more detailed version of the Epistemic Gate showing the three validation mechanisms: Security (constrains agency, enforces least-privilege), Schema (deterministic checks, assertions, policy rules), and Approval (human review for high-risk or irreversible actions).
- **Key elements**:
  - Left: Generation zone with probabilistic wave — "fuzzy reasoning, plans, hypotheses"
  - Centre: The gate as a strong structural element with three sub-components (Security, Schema, Approval) each with a brief description
  - Right: Authority zone — validated output becomes an authoritative tool call or decision
  - Clear left-to-right arrow flow

---

### Infographic 4: The Autonomy Spectrum

- **Filename**: `aaf-autonomy-spectrum-v1.png`
- **Title**: "The AAF Autonomy Spectrum: Scaling Agency with Governance"
- **Source section**: What Is an Agent (Section 3)
- **Core concept**: A four-level staircase or ladder showing autonomy levels from bottom to top: Level 1 Assistive (human-led), Level 2 Delegated (human-approved), Level 3 Bounded Autonomous (budget-constrained), Level 4 Supervisory (orchestrated). As autonomy increases, governance requirements (epistemic gates, budgets, verification) must also increase.
- **Key elements**:
  - Four levels as ascending steps/tiers with clear labels and one-line descriptions
  - Right-side callouts: "Epistemic Gates Must Scale with Risk", "Autonomy is a Budgeted Resource", "Verification vs. Trust"
  - Visual indication that governance scales proportionally with autonomy

---

### Infographic 5: Security — The Tool Gateway Pattern

- **Filename**: `security-pillar-graphic.png`
- **Title**: "AAF Security: The Tool Gateway Pattern"
- **Source section**: Pillar 1: Security Architecture (Section 5)
- **Core concept**: The non-bypassable Tool Gateway as the central security mechanism. A probabilistic agent proposes an action; the gateway evaluates it against policies, budgets, and risk class; only validated requests proceed to the deterministic execution layer.
- **Key elements**:
  - Left: Agent / probabilistic reasoning layer proposing an action
  - Centre: The Tool Gateway as a strong shield/checkpoint — evaluates against ACC, identity, scopes, risk class, budgets
  - Right: Deterministic execution layer (sandboxed tools, APIs, databases)
  - Gateway outcomes: Allowed, Blocked, Approval Required, Budget Exhausted
  - Callout: "Separation of Concerns" — the orchestrator decides what happens next; the gateway determines what is allowed
  - CIA triad annotation: "Primary CIA dimension: Integrity"

---

### Infographic 6: Reliability — The Verification Checkpoint

- **Filename**: `reliability-pillar.png`
- **Title**: "Reliability: The Verification Checkpoint"
- **Source section**: Pillar 2: Reliability (Section 6)
- **Core concept**: Reliability is defined by verified end-states, not plausible conversation. A central "Verify" checkpoint receives probabilistic input and either passes it to authoritative action or loops back for adaptation.
- **Key elements**:
  - Left: "Input: Probabilistic Reasoning" — agent generates a candidate output
  - Centre: "Verify" diamond/checkpoint
  - Top branch: "Fail: Adapt and Iterate" — loops back with feedback
  - Right branch: "Pass: Authoritative Action" — output becomes deterministic
  - Right callouts: "Done is a Verified State", "Repeatable Reliability"

---

### Infographic 7: Cost — The Model Router

- **Filename**: `cost-optimisation-pillar.png`
- **Title**: "The Model Router: Precision Economics for Agentic Loops"
- **Source section**: Pillar 3: Cost Optimisation (Section 7)
- **Core concept**: A budget-aware routing node that directs tasks to the right model tier. Complex reasoning goes to capable (expensive) models; routine execution goes to fast (cheap) models. This prevents over-spending on simple deterministic tasks.
- **Key elements**:
  - Centre: "Routing Node: Budget-Aware Decision Point"
  - Upper branch: "The Planner (High Reasoning)" — capable models for complex decomposition and planning
  - Lower branch: "The Executor (High Speed)" — fast models for routine tool calls and schema-heavy execution
  - Left: incoming task with model routing
  - Callouts: "The Right Model for the Right Phase", "Dynamic Escalation"

---

### Infographic 8: Operations — The Observable Trace

- **Filename**: `operational-excellence.png`
- **Title**: "The Observable Trace: Operational Excellence in Agentic Systems"
- **Source section**: Pillar 4: Operational Excellence (Section 8)
- **Core concept**: The four-phase observability trace: Intent → Plan → Act → Verify. Each phase captures specific telemetry to make agent behaviour diagnosable and auditable.
- **Key elements**:
  - Four columns left-to-right: Intent (probabilistic), Plan (probabilistic), Act (deterministic), Verify (deterministic)
  - Under each column: what gets captured (risk class, autonomy level / decision records, logic branching / tool inputs, API traces / evidence artifacts, DoD validation)
  - Bottom bar: Run lifecycle (Queued → Running → Verifying → Completed)

---

### Infographic 9: Performance — Topology Trade-offs

- **Filename**: `aaf-topology-tradeoffs-v1.png`
- **Title**: "Topology Trade-offs: Orchestration vs. Chaos"
- **Source section**: Pillar 5: Performance Efficiency (Section 9)
- **Core concept**: A side-by-side comparison of unstructured "bag of agents" (mesh topology with error amplification) vs. structured orchestrated topology (hub-and-spoke with a central supervisor acting as a validation bottleneck).
- **Key elements**:
  - Left panel: "Bag of Agents" — messy mesh network with many crossing connections, labelled "Error Amplification"
  - Right panel: "Orchestrated Topology" — clean hub-and-spoke with supervisor at centre, labelled "Validation Bottleneck"
  - Key metrics: error multiplier comparison, coordination overhead vs. engineered governance
  - Clear visual: chaos on left, order on right

---

### Infographic 10: Context Optimization — The Curated Backpack

- **Filename**: `context-optimisation.png`
- **Title**: "The Curated Backpack: Context Optimization for AI Agents"
- **Source section**: Context Optimization (Section 11)
- **Core concept**: Contrast between "prompt stuffing" (dumping everything into context) and "context curation" (engineering the minimum sufficient context). The curated approach uses structured blocks: System (rules), Memory (state), and Tools (capabilities).
- **Key elements**:
  - Left side: "The Chaos of Prompt Stuffing" — messy, overloaded, with problems listed (noise, security friction, performance degradation)
  - Centre: Structured blocks diagram — System (Rules), Memory (State), Tools (Capabilities)
  - Right side: "The Curated Backpack" — clean, efficient, with benefits listed (precision, budget-awareness)
  - Bottom comparison table: Prompt Stuffing vs. Context Curation on token usage, reasoning quality, cost

---

### Infographic 11: Sustainability — The Compute Filter

- **Filename**: `sustainability-pillar.png`
- **Title**: "The Compute Filter: Engineering Sustainable AI Agents"
- **Source section**: Pillar 6: Sustainability (Section 10)
- **Core concept**: A funnel/filter metaphor. Bloated input (excess tokens, redundant loops, full tool catalogues) enters the top. The filter grid applies three mechanisms: on-demand tool discovery, model routing and caching, verification-based termination. Clean, minimal compute emerges at the bottom.
- **Key elements**:
  - Top: "The Input" — context bloat, redundant reasoning loops
  - Middle: "Filter Grid" — three filtering mechanisms with brief descriptions
  - Bottom: "The Output" — high-signal execution, energy reduction
  - Funnel shape narrowing from bloated input to clean output

---

### Infographic 12: Ecosystem and Interoperability

- **Filename**: `ecosystem.png`
- **Title**: "Ecosystem and Interoperability"
- **Source section**: Ecosystem Interoperability (Section 13)
- **Core concept**: Comparison of mesh (unconstrained) vs. orchestrator (star) topologies for multi-agent and multi-protocol ecosystems. The orchestrated approach contains errors and delivers performance gains through structured coordination.
- **Key elements**:
  - Left panel: "Mesh (Unconstrained)" — tangled connections, error amplification metric, high coordination overhead
  - Right panel: "Orchestrator (Star)" — clean hub-and-spoke, error containment metric, performance boost metric
  - Clear visual contrast: tangled vs. structured

---

### Infographic 13: Multi-Agent Orchestration Anatomy

- **Filename**: `anatomy-multiagent-v1.png`
- **Title**: "Anatomy of Governed Multi-Agent Orchestration"
- **Source section**: Annex: Agent Control Contracts (Section 16)
- **Core concept**: A governed multi-agent topology with three roles: Supervisor Agent (broad scope, strategic autonomy, high-level planning), Planner Worker (narrow scope, no tools, reasoning only), and Executor Worker (narrow scope, action-specific tool permissions). A sub-contract (non-bypassable gate) enforces constraints on budgets, tool allowlists, and output schemas.
- **Key elements**:
  - Top: Supervisor Agent (purple, prominent) with "Strategic Autonomy" and "Delegation" arrows
  - Bottom-left: Planner Worker with "No Tools" constraint
  - Bottom-right: Executor Worker with specific tool permissions (e.g., database access)
  - Left: Sub-Contract gate enforcing rigid constraints
  - Clear delegation flows from supervisor to workers

---

## How to Use This Prompt

### Generate all 13 infographics

Copy this entire document into NotebookLM with the PDF uploaded as source context. Ask:

> "Generate all 13 infographics as described in the specification. Follow the branding spec exactly. Each image should be 1600x900px, 16:9 landscape. Include the AAF logo in the bottom-left, 'agenticaf.io' in the bottom-centre, and '© All Rights Reserved AAF 2026' in the bottom-right of every image."

### Generate a single infographic

Ask:

> "Generate Infographic [NUMBER]: [TITLE] following the branding specification and infographic spec from my prompt document."

### Regeneration notes

- If an infographic needs updating due to framework changes, regenerate only that infographic using the single-infographic approach above.
- Always use the latest PDF as source context to ensure accuracy.
- The branding elements (logo, URL, copyright) are constants and should not change between regenerations.
