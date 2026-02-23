#!/usr/bin/env node

/**
 * Render trade-off recommendation blocks and inject into pillar docs.
 *
 * Usage:
 *   node tools/scripts/render-tradeoffs.js            # inject blocks into docs
 *   node tools/scripts/render-tradeoffs.js --dry-run   # preview changes without writing
 */
import { renderAll } from "../engine/renderer.js";

const dryRun = process.argv.includes("--dry-run");

console.log(dryRun ? "DRY RUN — previewing changes (no files will be written)\n" : "Rendering and injecting trade-off blocks into pillar docs...\n");

const results = renderAll(undefined, dryRun);

let changed = 0;
let skipped = 0;

for (const r of results) {
  if (r.changed) {
    changed++;
    console.log(`  ✓ ${r.doc} — ${r.pillarId}${dryRun ? " (would update)" : " updated"}`);
  } else {
    skipped++;
    console.log(`  – ${r.doc} — ${r.reason || "no change needed"}`);
  }
}

console.log(`\nDone: ${changed} updated, ${skipped} skipped${dryRun ? " (dry run, nothing written)" : ""}`);
