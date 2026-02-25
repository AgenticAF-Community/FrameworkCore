# AAF Tools & Skills

This directory will contain utilities that make the Agentic Architecture Framework actionable for both agents and humans.

## Contents

- **skills/** — Prebuilt instruction sets (e.g. Cursor/Claude skills) so agents can apply AAF when designing or reviewing systems.
- **aaf-posture/** — CLI that scans a codebase and produces an AAF posture report (alignment with the six pillars). See [aaf-posture/README.md](aaf-posture/README.md).
- **aaf-design/** — Interactive design questionnaire that generates an Agent Control Contract (ACC) and trade-off report.
- **aaf-build/** — Scaffold generator: reads an ACC and generates an agent project with control loop, gates, budgets, and observability.
- **aaf-review/** — Compares an ACC against a built codebase and produces a gap report.
- **engine/** — Deterministic trade-off pattern matcher and doc block renderer.
- **data/** — Approved trade-off data model (`trade-offs.json`) and pillar questions (`pillars.json`).
- **scripts/** — Sync pipeline, AI extraction script, and prompts.

The MCP server is hosted at `https://www.agenticaf.io/api/mcp` (11 tools, see [../api/README.md](../api/README.md)).

The whitepaper remains the single source of truth; these tools expose it in programmatic and reusable form.

## Keeping skills and CLI in sync with docs

When you update the core framework docs (`docs/`), run the sync script so the posture CLI and skills stay aligned:

- **Manual:** `npm run sync:from-docs` (from repo root)
- **Automatic:** A pre-commit hook runs the sync whenever you commit changes under `docs/*.md`. One-time setup: `npm run install:docs-sync-hook`

See [scripts/README.md](scripts/README.md) for details and config.

## Status

In development. See the [Tools & Skills](https://agenticaf.io/tools) section on the website for the full vision and updates.
