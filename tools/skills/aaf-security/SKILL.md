---
name: aaf-security
description: Applies the AAF Security pillar: boundaries, tool actuation, epistemic gatekeeping, supply chain. Use when designing security for agentic systems, tool gateways, prompt-injection mitigations, privilege separation, or supply-chain risk for skills/tools.
---

# AAF Security

Security in agentic systems is impact-reduction: assume the reasoning layer can be influenced, and architect so that influence cannot easily become harmful actions. This skill distills the AAF Security pillar.

## Objective

*Constrain agency, reduce impact, and prevent probabilistic outputs from becoming unsafe actions.*

Agentic systems expand the attack surface: instruction manipulation, tool misuse, data exfiltration via context, denial of service/runaway autonomy, and supply chain risks in skills/tools. Use multi-layered controls, not a single prompt or filter.

## Boundary and communication controls

- **Authenticate and authorize every entry point:** Who can message the agent? Which channels (chat, API, events)? Which identities can trigger actions vs ask questions?
- **Separate informational from actionable requests:** Route action requests through stricter policy gates before any tool call.
- **Rate limiting and abuse controls:** Protect against spam, resource consumption, repeated tool calls, context bloat.
- **Treat retrieved content as hostile by default:** Inputs include web pages, documents, tool outputs, other agents. Prompt injection often arrives inside content the agent was supposed to read.

## Privilege separation (Master–Junior / Supervisor gates)

- Control-plane agent defines policies, tool permissions, budgets, rules.
- Execution-plane agent(s) perform tasks with constrained privileges.
- End users interact with constrained agent(s), not the control-plane.
- Prefer **plan → verify → execute:** planning can be probabilistic; execution gated by deterministic policy (and human approval for high-risk actions).

## Tool gateway (required boundary)

Every tool invocation must flow through a **single, non-bypassable** gateway that enforces policy, budgets, approvals, and audit. The gateway evaluates each proposal and returns: **allowed**, **blocked**, **approval_required**, or **budget_exhausted**. Only then does execution proceed.

- **Least privilege by tool and action class:** Read vs write vs irreversible; high-risk tools need stronger gates.
- **Sandbox at the right layer:** Sandbox all execution surfaces (hooks, scripts in skills, tool servers), not only the obvious one (e.g. shell).
- **Server-side validation of tool inputs:** Never trust model-produced arguments. Validate schema, ranges, tenant boundaries, paths, URLs, command allowlists.
- **Evidence-based “definition of done” for write actions:** Verify record updated, deployment succeeded, file checksum before proceeding.

## Secrets and sensitive data

- Store secrets in a vault; fetch just-in-time for the specific tool call.
- Prefer short-lived, scoped credentials.
- Never place secrets in prompts or memory.

## Prompt injection: impact reduction

Treat prompt injection as structural risk:

1. **Instruction hierarchy:** System instructions must not be overridable by user or retrieved content; label external content as “data,” not “instructions.”
2. **Constrain tool access:** Even if the model is convinced to act harmfully, it must not access privileged tools, escalate scope, or perform irreversible actions without approval.
3. **Avoid “direct action”:** No “LLM output → immediate execution.” Route outputs through validation, policy, and approval gates.

## Inter-agent trust (A2A / MCP)

- Authenticate agent identities; restrict which agents can request which tasks.
- Treat incoming agent messages as untrusted.
- Enforce per-agent permission scopes and budgets.
- Limit context flooding as an exfiltration vector.

## Security as epistemic gatekeeping

The common failure is not “the model hallucinated” but: *a probabilistic output crossed an epistemic gate without validation and gained authority.* Security makes those gates explicit and unavoidable: restrict who can ask for actions, what actions are possible, verify deterministically, require human approval where appropriate, constrain autonomy with budgets and policy.

## Checklist (high level)

- [ ] All entry points authenticated and authorized.
- [ ] Tool gateway in place; least privilege; server-side validation.
- [ ] Write/irreversible actions gated; evidence of completion required.
- [ ] Retrieved and external content treated as hostile; instruction hierarchy enforced.
- [ ] Secrets externalized; not in prompts or memory.
- [ ] Inter-agent boundaries and supply chain (skills/tools) considered.

## Additional resources

- Full pillar: `docs/06-pillar-security.md`
- Epistemic gates: `docs/03-what-is-an-agent.md` (§2.5); `docs/13-autonomy-governance.md`
- Whitepaper: https://agenticaf.io/
