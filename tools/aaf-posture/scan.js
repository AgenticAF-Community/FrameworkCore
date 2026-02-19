/**
 * Scan a directory for file paths and sample content (for heuristic checks).
 * Skips node_modules, .git, build outputs, and common binary/lockfile paths.
 */
import fs from "fs";
import path from "path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".venv",
  "venv",
  "__pycache__",
]);
const SKIP_EXT = new Set([".lock", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff2", ".woff", ".ttf", ".pdf"]);

const MAX_FILE_SIZE = 200 * 1024; // 200 KiB
const MAX_FILES = 2000;

/**
 * @param {string} rootDir - Absolute path to scan
 * @param {object} opts - { maxFiles, readContent }
 * @returns {{ paths: string[], content: Map<string, string> }}
 */
export function scan(rootDir, opts = {}) {
  const maxFiles = opts.maxFiles ?? MAX_FILES;
  const readContent = opts.readContent !== false;
  const paths = [];
  const content = new Map();

  function walk(dir, base = "") {
    if (paths.length >= maxFiles) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (paths.length >= maxFiles) break;
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        walk(path.join(dir, e.name), rel);
      } else {
        const ext = path.extname(e.name).toLowerCase();
        if (SKIP_EXT.has(ext)) continue;
        paths.push(rel);
        if (readContent) {
          const full = path.join(dir, e.name);
          try {
            const stat = fs.statSync(full);
            if (stat.size <= MAX_FILE_SIZE) {
              const text = fs.readFileSync(full, "utf8");
              content.set(rel, text);
            }
          } catch {
            // skip unreadable or binary
          }
        }
      }
    }
  }

  walk(rootDir);
  return { paths, content };
}
