# Tools scripts

Scripts that keep skills and the CLI in sync with the core framework docs.

## sync-from-docs.js

**What it does**

- Reads `docs/15-application-method.md` (section 14.2) and extracts the six pillar review questions.
- Merges in the two cross-cutting pillars from `sync-config.js`.
- **Writes** `tools/aaf-posture/pillars.js` (used by the AAF posture CLI).
- **Updates** the "Mode 2: Architecture review" section in `tools/skills/aaf-architecture-review/SKILL.md` so the checklist matches the pillars.

**When to run**

- After you edit `docs/15-application-method.md` (or any core framework doc that defines review questions).
- After you edit cross-cutting questions in `tools/scripts/sync-config.js` (aligned with docs 12 and 13).

**How to run**

```bash
npm run sync:from-docs
# or
node tools/scripts/sync-from-docs.js
```

## Automatic trigger when docs change

A **pre-commit hook** runs the sync whenever you commit changes under `docs/*.md`. That keeps `pillars.js` and the architecture-review skill’s Mode 2 section aligned with the framework without extra steps.

**One-time setup**

```bash
npm run install:docs-sync-hook
```

This installs the hook into `.git/hooks/pre-commit`. If you already have a pre-commit hook, the docs-sync logic is appended to it.

**Disable**

Remove or edit `.git/hooks/pre-commit` and delete the block that runs `sync-from-docs.js`.

## sync-config.js

Config for the sync script:

- **CROSS_CUTTING_PILLARS** — Questions for Context Optimization and Autonomy & Outcome Governance. When you update `docs/12-context-optimization.md` or `docs/13-autonomy-governance.md`, update this config so the CLI and skills stay aligned.
- **DOC15_PILLAR_MAP** — Maps pillar headings in doc 15 to pillar `id` and `name` for `pillars.js`.

## Future: more skills and CLI

The script can be extended to:

- Update other skill sections from other docs (add mapping in `sync-from-docs.js`).
- Regenerate or validate `tools/aaf-posture/checks.js` patterns from doc content (e.g. keyword lists per pillar).
