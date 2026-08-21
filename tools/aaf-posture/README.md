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

## Evidence and claims

The scanner separates what a codebase **does** from what it **says**. Code and
config can evidence a control. Documentation can only claim one.

Every question resolves to one of four statuses:

| Status | Badge | Meaning |
|--------|-------|---------|
| `found` | `✓` | A signal appeared in code or config. The control is evidenced. |
| `asserted` | `◐` | A signal appeared only in documentation. The control is claimed, not evidenced. Verify it. |
| `not_found` | `○` | No signal anywhere. |
| `unclear` | `?` | No heuristic is registered for the question. |

`asserted` does not count toward a pillar score. A control described in a
README but absent from the code is not in place, and scoring it would restate
the claim as a result. This is the framework's own distinction between a
plausible statement and an authoritative one, applied to the tool itself.

To see the difference, scan a directory that holds only prose:

```bash
node cli.js ../../docs      # the whitepaper: 0 evidenced, 28 documented only
```

### Adding or changing a signal

Signals live in [`signals.js`](signals.js) as anchored regular expressions, in
the same single-source-of-truth style as `tools/aaf-security/patterns.js`. When
editing them:

- Use `\b` word boundaries. A bare word is almost always a substring of an
  unrelated one — `act` once matched `contactForm`.
- Keep patterns case-insensitive with the `i` flag, not by lowercasing the text.
- Do not add a term shorter than four characters.

`pillars.js` is generated from `docs/` by `tools/scripts/sync-from-docs.js`, and
heuristics in `checks.js` are keyed by question text. Rewording a question in the
docs therefore orphans its heuristic. `tools/tests/posture.test.js` fails on that
drift in both directions, so run `npm test` after a docs sync.

## Output

- **Markdown** (default): Section per pillar with checklist-style items and status (evidenced / documented only / no signal / unclear), plus a summary line. Print to stdout, or use `--output <file>` to write to a file.
- **JSON**: Machine-readable structure for CI or dashboards. Use `--output <file>` to write to a file.
- **HTML**: AAF-branded, self-contained report (single file) with header, meta, all eight pillars, and status badges. Writes to `aaf-posture-report.html` in the current directory unless `--output <file>` is set. Suitable for sharing and printing.

Consumers of the JSON — `aaf_posture_interpret`, `aaf_review_against_acc`, and
`aaf review` — treat `asserted` as a gap, not as a pass.

## References

- Framework application method: `docs/15-application-method.md`
- Pillar docs: `docs/06-pillar-security.md` through `docs/11-pillar-sustainability.md`
