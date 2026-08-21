/**
 * File classification for posture evidence.
 *
 * A posture report claims a control exists. That claim is only as good as the
 * file it came from. Prose in a README says what a team intends; code and
 * config say what the system does. The scanner must not confuse the two, so
 * every scanned file gets a class and only code and config can prove a control.
 */
import path from "path";

const CODE_EXT = new Set([
  ".js", ".mjs", ".cjs", ".jsx",
  ".ts", ".mts", ".cts", ".tsx",
  ".py", ".rb", ".go", ".rs", ".java", ".kt", ".kts", ".scala",
  ".cs", ".php", ".swift", ".m", ".mm",
  ".c", ".h", ".cc", ".cpp", ".hpp",
  ".sh", ".bash", ".zsh", ".ps1",
  ".sql", ".vue", ".svelte",
]);

const CONFIG_EXT = new Set([
  ".json", ".jsonc", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
  ".properties", ".env", ".tf", ".tfvars", ".hcl", ".gradle", ".xml",
]);

const DOC_EXT = new Set([
  ".md", ".mdx", ".markdown", ".rst", ".adoc", ".asciidoc", ".txt", ".rtf",
]);

/** Config files that carry no extension. */
const CONFIG_NAMES = new Set([
  "dockerfile", "containerfile", "makefile", "procfile", "jenkinsfile",
  "vagrantfile", "gemfile", "rakefile", "brewfile", "justfile", "caddyfile",
]);

/** Doc files that carry no extension. */
const DOC_NAMES = new Set(["license", "licence", "notice", "authors", "codeowners"]);

export const CODE = "code";
export const CONFIG = "config";
export const DOCS = "docs";
export const OTHER = "other";

/** Classes whose contents count as evidence that a control is implemented. */
export const EVIDENCE_CLASSES = new Set([CODE, CONFIG]);

/**
 * Classify a scanned file by its path.
 *
 * @param {string} relPath - Path relative to the scan root.
 * @returns {"code"|"config"|"docs"|"other"}
 */
export function classifyFile(relPath) {
  const base = path.basename(relPath).toLowerCase();
  const ext = path.extname(base);

  // Dotfiles such as .env or .gitignore have no extension by this measure.
  if (!ext) {
    if (CONFIG_NAMES.has(base)) return CONFIG;
    if (DOC_NAMES.has(base)) return DOCS;
    if (base.startsWith(".")) return CONFIG;
    return OTHER;
  }

  if (base.startsWith("dockerfile.") || base.startsWith(".env.")) return CONFIG;
  if (CODE_EXT.has(ext)) return CODE;
  if (CONFIG_EXT.has(ext)) return CONFIG;
  if (DOC_EXT.has(ext)) return DOCS;
  return OTHER;
}

/**
 * Split scanned entries into the files that can prove a control and the files
 * that can only claim one.
 *
 * @param {Array<[string, string]>} entries - [relativePath, contents] pairs.
 * @returns {{ evidence: Array<[string,string]>, docs: Array<[string,string]> }}
 */
export function partitionByClass(entries) {
  const evidence = [];
  const docs = [];
  for (const entry of entries) {
    const cls = classifyFile(entry[0]);
    if (EVIDENCE_CLASSES.has(cls)) evidence.push(entry);
    else if (cls === DOCS) docs.push(entry);
  }
  return { evidence, docs };
}
