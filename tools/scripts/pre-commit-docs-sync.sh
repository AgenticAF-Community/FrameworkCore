#!/bin/sh
# When core framework docs are staged, run sync-from-docs and re-stage any updated files.
# Install with: node tools/scripts/install-docs-sync-hook.js

STAGED_DOCS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '^docs/.*\.md$' || true)
if [ -z "$STAGED_DOCS" ]; then
  exit 0
fi

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
node tools/scripts/sync-from-docs.js || exit 1

# Re-stage files that the sync may have updated
git add tools/aaf-posture/pillars.js tools/skills/aaf-architecture-review/SKILL.md 2>/dev/null || true
exit 0
