# AAF Skills

Prebuilt instruction sets so agents can apply the Agentic Architecture Framework when designing or reviewing agentic systems. Each skill is a Cursor-style `SKILL.md` that can be used locally or served via the AAF MCP server.

## Skills index

| Skill | Purpose | When to use |
|-------|---------|-------------|
| **aaf-architecture-review** | Apply AAF when designing or reviewing agentic systems; pillar checklist, trade-offs, design vs review modes. | Designing new agentic systems, reviewing architectures, pre-production readiness, trade-off discussions. |
| **aaf-security** | Security pillar guidance: boundaries, tool actuation, epistemic gatekeeping, supply chain. | Security design, tool gateway design, prompt-injection mitigations, privilege separation. |
| **aaf-epistemic-gates** | When/where to place epistemic gates; candidate → validated → authority; gates scale with risk. | Defining validation vs authority, reducing “AI said so” authority, high-stakes decisions. |
| **aaf-cost-context** | Cost pillar + context optimization; when to apply budgets, model routing, context discipline. | Cost control, context budgeting, model routing, token economics. |

## Usage

- **Via MCP (recommended):** Use the AAF MCP server and call the `aaf_get_skill` tool with a skill id (e.g. `aaf-architecture-review`). See [../mcp-server/README.md](../mcp-server/README.md).
- **Local/copy:** Use the skill directories under `tools/skills/` and copy or reference `SKILL.md` in Cursor (e.g. project or personal skills).

## Source

Content is distilled from the AAF whitepaper in `docs/`. The whitepaper remains the single source of truth; skills are concise, actionable views for agents and practitioners.

## Whitepaper

Full framework: [Agentic Architecture Framework](https://agenticaf.io/) (website) and `docs/` in this repo.
