#!/usr/bin/env node

/**
 * Install the pre-commit hook that runs sync-from-docs when docs/*.md are committed.
 * Run once after clone (or add to README/setup): node tools/scripts/install-docs-sync-hook.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookPath = path.join(hooksDir, "pre-commit");
const sourceHook = path.join(__dirname, "pre-commit-docs-sync.sh");

if (!fs.existsSync(path.join(repoRoot, ".git"))) {
  console.warn("Not a git repo; skipping hook install.");
  process.exit(0);
}

const hookContent = `#!/bin/sh
# AAF: run sync-from-docs when framework docs change (installed by tools/scripts/install-docs-sync-hook.js)
STAGED_DOCS=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '^docs/.*\\.md$' || true)
if [ -n "$STAGED_DOCS" ]; then
  ROOT=$(git rev-parse --show-toplevel)
  cd "$ROOT" && node tools/scripts/sync-from-docs.js
  git add tools/aaf-posture/pillars.js tools/skills/aaf-architecture-review/SKILL.md 2>/dev/null || true
fi
`;

try {
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }
  let existing = "";
  if (fs.existsSync(hookPath)) {
    existing = fs.readFileSync(hookPath, "utf8");
    if (existing.includes("sync-from-docs")) {
      console.log("Pre-commit hook already includes docs sync.");
      process.exit(0);
    }
  }
  const toWrite = existing
    ? existing.trimEnd() + "\n\n" + hookContent
    : "#!/bin/sh\n\n" + hookContent;
  fs.writeFileSync(hookPath, toWrite, "utf8");
  fs.chmodSync(hookPath, "755");
  console.log("Installed pre-commit hook:", hookPath);
} catch (e) {
  console.error("Could not install hook:", e.message);
  process.exit(1);
}
