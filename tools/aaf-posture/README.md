# AAF Posture

CLI that scans a codebase and produces an **AAF posture report**: an assessment of alignment with the six pillars (and optional cross-cutting foundations) of the Agentic Architecture Framework.

## Usage

```bash
# From repo root (install once)
cd tools/aaf-posture && npm install

# Scan current directory (markdown to stdout)
node cli.js .

# Scan a specific path
node cli.js /path/to/agent-project

# Output as JSON
node cli.js . --format json

# Generate AAF-branded HTML report (default: aaf-posture-report.html in cwd)
node cli.js . --format html

# HTML report to a specific file
node cli.js . --format html --output ./reports/posture.html
```

Or via `npx` from the repo root:

```bash
npx -C tools/aaf-posture . /path/to/project
npx -C tools/aaf-posture . --format html --output report.html
```

## What it does

The CLI walks the target directory (excluding common ignore patterns), runs **pillar checks** (heuristic lookups for patterns and config), and prints a markdown or JSON report:

- **Security** — Auth, tool scopes, write gating, untrusted input handling
- **Reliability** — Verifiable outcomes, tool failure handling, idempotency, retries
- **Cost** — Budgets, model routing, context budgeting, caching, early stopping
- **Operational Excellence** — Observability (observe→decide→act→verify), evals, rollback, versioning
- **Performance** — Topology, tool round trips, interactive vs batch
- **Sustainability** — Usage visibility, efficiency defaults
- **Context Optimization (cross-cutting)** — Context vs memory, context budgeting, provenance, minimal retrieval
- **Autonomy & Outcome Governance (cross-cutting)** — Autonomy level, Definition of Done, budgets, escalation

Findings are **indicative**, not definitive: the tool looks for signals (e.g. env vars, file names, keywords). Manual review is still required for production readiness.

## Output

- **Markdown** (default): Section per pillar with checklist-style items and status (found / not found / unclear). Print to stdout, or use `--output <file>` to write to a file.
- **JSON**: Machine-readable structure for CI or dashboards. Use `--output <file>` to write to a file.
- **HTML**: AAF-branded, self-contained report (single file) with header, meta, all eight pillars, and status badges. Writes to `aaf-posture-report.html` in the current directory unless `--output <file>` is set. Suitable for sharing and printing.

## References

- Framework application method: `docs/15-application-method.md`
- Pillar docs: `docs/06-pillar-security.md` through `docs/11-pillar-sustainability.md`
