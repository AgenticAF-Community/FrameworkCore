/**
 * Generate a compact, developer-focussed AAF HTML report.
 * Uses AAF visual guidelines; design is actionable (summary bar, action hints, collapsible pillars).
 */
import { PILLARS } from "./pillars.js";

const AAF_COLORS = {
  primary: "#007BFF",
  primaryDark: "#0062cc",
  white: "#FFFFFF",
  black: "#1a1a1a",
  scaffold: "#F0F2F5",
  iron: "#586069",
  purple: "#8A2BE2",
};

/** Doc reference for action hints by pillar id */
const PILLAR_DOC = {
  security: "docs/06-pillar-security.md",
  reliability: "docs/07-pillar-reliability.md",
  cost: "docs/08-pillar-cost.md",
  "operational-excellence": "docs/09-pillar-operations.md",
  performance: "docs/10-pillar-performance.md",
  sustainability: "docs/11-pillar-sustainability.md",
  "context-optimization": "docs/12-context-optimization.md",
  "autonomy-governance": "docs/13-autonomy-governance.md",
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusBadge(status) {
  if (status === "found") return '<span class="badge badge--found">Found</span>';
  if (status === "not_found") return '<span class="badge badge--not-found">Not found</span>';
  return '<span class="badge badge--unclear">Unclear</span>';
}

function actionHint(status, pillarId) {
  if (status === "found") return "";
  const doc = PILLAR_DOC[pillarId] || "docs/";
  const action = status === "not_found"
    ? `Add or implement this check. See ${doc}`
    : "Confirm manually; heuristic had no signal.";
  return `<div class="action-hint"><strong>Action:</strong> ${escapeHtml(action)}</div>`;
}

/**
 * @param {object} opts - { rootPath, scannedFiles, report (pillar id -> items[]) }
 * @returns {string} Full HTML document
 */
export function buildHtmlReport(opts) {
  const { rootPath, scannedFiles, report } = opts;
  const date = new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  let nFound = 0, nNotFound = 0, nUnclear = 0;
  for (const pillar of PILLARS) {
    const items = report[pillar.id] || [];
    for (const item of items) {
      if (item.status === "found") nFound++;
      else if (item.status === "not_found") nNotFound++;
      else nUnclear++;
    }
  }

  let pillarsHtml = "";
  for (const pillar of PILLARS) {
    const items = report[pillar.id] || [];
    const foundCount = items.filter((i) => i.status === "found").length;
    const countStr = `${foundCount}/${items.length} found`;
    const isCrossCutting = pillar.name.includes("cross-cutting");
    const sectionClass = isCrossCutting ? "pillar pillar--cross" : "pillar";
    let rows = "";
    for (const item of items) {
      const needsAction = item.status !== "found";
      const trClass = needsAction ? ' class="action"' : "";
      const evidence = item.evidence
        ? `<div class="evidence">${escapeHtml(item.evidence)}</div>`
        : "";
      const hint = actionHint(item.status, pillar.id);
      rows += `<tr${trClass}><td>${statusBadge(item.status)}</td><td>${escapeHtml(item.question)}${evidence}${hint}</td></tr>`;
    }
    pillarsHtml += `
    <section class="${sectionClass}" id="p-${escapeHtml(pillar.id)}">
      <div class="pillar-head" onclick="this.closest('.pillar').classList.toggle('collapsed')"><span>${escapeHtml(pillar.name)}</span><span class="count">${countStr}</span><span class="tog"></span></div>
      <div class="pillar-body">
        <table>
          <thead><tr><th>Status</th><th>Check</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AAF Posture Report</title>
  <style>
    :root {
      --aaf-primary: ${AAF_COLORS.primary};
      --aaf-primary-dark: ${AAF_COLORS.primaryDark};
      --aaf-white: ${AAF_COLORS.white};
      --aaf-black: ${AAF_COLORS.black};
      --aaf-scaffold: ${AAF_COLORS.scaffold};
      --aaf-iron: ${AAF_COLORS.iron};
      --aaf-purple: ${AAF_COLORS.purple};
      --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: var(--aaf-black);
      background: var(--aaf-scaffold);
      margin: 0;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, var(--aaf-primary) 0%, var(--aaf-primary-dark) 100%);
      color: var(--aaf-white);
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .header h1 { margin: 0; font-size: 1.1rem; font-weight: 600; }
    .header-meta { font-size: 0.8rem; opacity: 0.9; }
    .summary {
      display: flex;
      gap: 1.5rem;
      padding: 0.5rem 1.25rem;
      background: var(--aaf-white);
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.8rem;
    }
    .summary span { color: var(--aaf-iron); }
    .summary .n { font-weight: 600; color: var(--aaf-black); }
    .summary .found .n { color: #0d6832; }
    .summary .not-found .n { color: #721c24; }
    .summary .unclear .n { color: #856404; }
    .container { max-width: 960px; margin: 0 auto; padding: 0 1.25rem 1.25rem; }
    .disclaimer {
      padding: 0.4rem 0.6rem;
      margin: 0.75rem 0;
      font-size: 0.75rem;
      color: var(--aaf-iron);
      background: var(--aaf-white);
      border-radius: 4px;
      border: 1px solid #e8e8e8;
    }
    .pillar {
      background: var(--aaf-white);
      border-radius: 6px;
      margin-bottom: 0.75rem;
      border: 1px solid #e5e5e5;
      overflow: hidden;
    }
    .pillar--cross { border-left: 3px solid var(--aaf-purple); }
    .pillar-head {
      padding: 0.4rem 0.75rem;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--aaf-primary-dark);
      background: #fafafa;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pillar-head:hover { background: #f5f5f5; }
    .pillar-head .count { font-weight: 400; color: var(--aaf-iron); font-size: 0.8rem; }
    .pillar-body { padding: 0; }
    .pillar.collapsed .pillar-body { display: none; }
    .pillar.collapsed .pillar-head .tog::after { content: '▶'; }
    .pillar-head .tog::after { content: '▼'; font-size: 0.7rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th { text-align: left; padding: 0.35rem 0.75rem; font-weight: 600; color: var(--aaf-iron); background: #fafafa; border-bottom: 1px solid #eee; width: 5rem; }
    td { padding: 0.35rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.action td { background: #fffef5; }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .badge--found { background: #d4edda; color: #155724; }
    .badge--not-found { background: #f8d7da; color: #721c24; }
    .badge--unclear { background: #fff3cd; color: #856404; }
    .evidence {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--aaf-iron);
      margin-top: 0.2rem;
    }
    .action-hint {
      font-size: 0.7rem;
      color: var(--aaf-iron);
      margin-top: 0.2rem;
    }
    .action-hint strong { color: var(--aaf-primary-dark); }
    .footer {
      margin-top: 1rem;
      padding-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--aaf-iron);
      text-align: center;
    }
    .footer a { color: var(--aaf-primary); }
    @media print {
      body { background: white; }
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .pillar { box-shadow: none; }
      .pillar.collapsed .pillar-body { display: block; }
      .pillar-head { cursor: default; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>AAF Posture Report</h1>
    <span class="header-meta">${escapeHtml(rootPath)} · ${scannedFiles} files · ${date} ${time}</span>
  </header>
  <div class="summary">
    <span class="found"><span class="n">${nFound}</span> found</span>
    <span class="not-found"><span class="n">${nNotFound}</span> not found</span>
    <span class="unclear"><span class="n">${nUnclear}</span> unclear</span>
    <span>→ <strong>Focus on not found / unclear to action</strong></span>
  </div>
  <div class="container">
    <div class="disclaimer">Heuristic scan only. Manual review required for production readiness. Use "not found" rows as an action list.</div>
    ${pillarsHtml}
    <footer class="footer">AAF Posture CLI · <a href="https://agenticaf.io" target="_blank" rel="noopener">agenticaf.io</a></footer>
  </div>
  <script>
    document.querySelectorAll('.pillar-head').forEach(h => {
      h.addEventListener('click', () => h.closest('.pillar').classList.toggle('collapsed'));
    });
  </script>
</body>
</html>`;
}
