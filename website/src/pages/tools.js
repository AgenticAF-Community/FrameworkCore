import React from 'react';
import Layout from '@theme/Layout';

const SKILLS = [
  { id: 'aaf-architecture-review', title: 'Architecture Review', desc: 'Pillar checklist, design-time spec and pre-production review.' },
  { id: 'aaf-security', title: 'Security', desc: 'Boundaries, tool actuation, epistemic gatekeeping, supply chain.' },
  { id: 'aaf-epistemic-gates', title: 'Epistemic Gates', desc: 'When and where to place validation and authority gates.' },
  { id: 'aaf-cost-context', title: 'Cost & Context', desc: 'Budgets, model routing, token economics, context discipline.' },
  { id: 'aaf-cross-cutting', title: 'Cross-Cutting Foundations', desc: 'Context optimization and autonomy & outcome governance.' },
  { id: 'aaf-acc-implementation', title: 'ACC Implementation', desc: 'Agent Control Contract template, placement, and usage.' },
  { id: 'aaf-orchestration-occ', title: 'Orchestration & OCC', desc: 'Orchestrator Capability Contract and multi-agent governance.' },
];

const MCP_TOOLS = [
  { name: 'aaf_lookup', desc: 'Search the framework docs for a term or topic.', phase: 'Core' },
  { name: 'aaf_checklist', desc: 'Architecture review checklist (pre-production readiness).', phase: 'Core' },
  { name: 'aaf_pillars_summary', desc: 'Summary of the six pillars and cross-cutting foundations.', phase: 'Core' },
  { name: 'aaf_get_skill', desc: 'Retrieve the full content of any skill by ID.', phase: 'Core' },
  { name: 'aaf_design_questions', desc: 'Design questionnaire for a given autonomy level.', phase: 'Design' },
  { name: 'aaf_tradeoff_analysis', desc: 'Deterministic trade-off analysis from design choices.', phase: 'Design' },
  { name: 'aaf_generate_acc', desc: 'Generate an Agent Control Contract from design answers.', phase: 'Design' },
  { name: 'aaf_scaffold_spec', desc: 'File manifest for agent code scaffold generation.', phase: 'Build' },
  { name: 'aaf_posture_interpret', desc: 'Interpret posture report with trade-off tensions.', phase: 'Review' },
  { name: 'aaf_review_against_acc', desc: 'Gap analysis: ACC vs actual implementation.', phase: 'Review' },
  { name: 'aaf_pillar_guidance', desc: 'Targeted design guidance for a specific pillar.', phase: 'Cross-cutting' },
  { name: 'aaf_security_scan', desc: 'CIA-aligned security scan with actionable recommendations.', phase: 'Security' },
];

const sectionStyle = { marginBottom: '2rem' };
const headingStyle = { fontSize: '1.15rem', marginBottom: '0.5rem' };
const textStyle = { fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' };
const statusStyle = (live) => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: '4px',
  marginLeft: '0.5rem',
  backgroundColor: live ? 'var(--ifm-color-success-contrast-background)' : 'var(--ifm-color-warning-contrast-background)',
  color: live ? 'var(--ifm-color-success-darkest)' : 'var(--ifm-color-warning-darkest)',
});

export default function Tools() {
  return (
    <Layout
      title="Tools & Skills"
      description="Make the AAF whitepaper a utility: skills for agents, MCP tools, and posture reports for codebases."
    >
      <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
          Tools & Skills
        </h1>
        <p style={{ ...textStyle, fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)', marginBottom: '1.5rem' }}>
          The whitepaper is the source of truth. These tools turn it into a <strong>utility</strong> so
          agents and humans can apply the framework without re-reading the full document every time.
        </p>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>
            1. Skills <span style={statusStyle(true)}>Live</span>
          </h2>
          <p style={textStyle}>
            Reusable instruction sets that agents (e.g. in Cursor, Claude Projects) can load to apply AAF when
            designing or reviewing agentic systems. Copy a skill into your project or reference it from the repo.
          </p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            {SKILLS.map((s) => (
              <li key={s.id} style={{ marginBottom: '0.35rem' }}>
                <strong>{s.title}</strong> <code style={{ fontSize: '0.8rem' }}>{s.id}</code> — {s.desc}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.5rem' }}>
            Skills live in <a href="https://github.com/AgenticAF-Community/FrameworkCore/tree/main/tools/skills"><code>tools/skills/</code></a> on GitHub.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>
            2. MCP Server <span style={statusStyle(true)}>Live</span>
          </h2>
          <p style={textStyle}>
            A Model Context Protocol server that exposes the framework as tools. AI assistants that support MCP
            can call these tools to get accurate, framework-grounded answers.
          </p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem', marginTop: '0.75rem' }}>
            {MCP_TOOLS.map((t) => (
              <li key={t.name} style={{ marginBottom: '0.35rem' }}>
                <code style={{ fontSize: '0.85rem' }}>{t.name}</code>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, marginLeft: '0.4rem', color: 'var(--ifm-font-color-secondary)', textTransform: 'uppercase' }}>{t.phase}</span>
                {' — '}{t.desc}
              </li>
            ))}
          </ul>
          <h3 style={{ ...headingStyle, marginTop: '1.25rem' }}>Using the MCP server in different IDEs</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--ifm-font-color-base)', marginBottom: '0.75rem' }}>
            The hosted AAF server speaks <strong>HTTP (Streamable MCP)</strong>. Editors differ in how they connect:
          </p>
          <ul style={{ ...textStyle, paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li><strong>Direct URL</strong> — Some clients let you register the server by URL only (no local process). Fastest when supported.</li>
            <li><strong>Local bridge (<code>mcp-remote</code>)</strong> — Many IDEs only launch <strong>stdio</strong> MCP servers. Use <code>npx mcp-remote …</code> so the editor talks to localhost while the bridge forwards to <code>agenticaf.io</code>. Requires <strong>Node.js 18+</strong>.</li>
          </ul>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', border: '1px solid var(--ifm-color-emphasis-300)' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-color-emphasis-100)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>IDE / product</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>How to connect</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>Where to configure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><strong>Cursor</strong></td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}>Direct URL (snippet below)</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>~/.cursor/mcp.json</code> or project <code>.cursor/mcp.json</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><strong>VS Code</strong> (GitHub Copilot agent / MCP)</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}>Use <strong>MCP: Add Server</strong> — HTTP/SSE URL when offered; otherwise same <code>mcp-remote</code> block as Claude Desktop</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}>Command Palette → MCP; see <a href="https://code.visualstudio.com/docs/copilot/guides/mcp-developer-guide" target="_blank" rel="noopener noreferrer">VS Code MCP docs</a></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><strong>Google Antigravity</strong></td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>mcp-remote</code> (stdio bridge)</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}>Agent panel → Manage MCP Servers → View raw config</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><strong>Claude Desktop</strong></td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>mcp-remote</code> (hosted server is not stdio)</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code>%APPDATA%\Claude\</code> (Windows)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><strong>Windsurf</strong></td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>mcp-remote</code> (same pattern as Claude)</td>
                  <td style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', verticalAlign: 'top' }}><code>~/.codeium/windsurf/mcp_config.json</code> — <a href="https://docs.codeium.com/windsurf/mcp" target="_blank" rel="noopener noreferrer">Windsurf MCP</a></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.65rem', verticalAlign: 'top' }}><strong>Other MCP clients</strong></td>
                  <td style={{ padding: '0.5rem 0.65rem', verticalAlign: 'top' }} colSpan={2}>If the app only lists <code>command</code> + <code>args</code>, paste the <code>mcp-remote</code> JSON below. If it accepts a server URL for HTTP MCP, use the URL snippet.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)', marginBottom: '0.35rem' }}>
            <strong>Option A — Direct URL</strong> (Cursor and clients that support remote HTTP MCP):
          </p>
          <pre style={{ fontSize: '0.8rem', padding: '0.75rem', borderRadius: '6px', overflow: 'auto' }}>
{JSON.stringify({ "mcpServers": { "aaf": { "url": "https://www.agenticaf.io/api/mcp" } } }, null, 2)}
          </pre>
          <p style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
            <strong>Option B — <code>mcp-remote</code> bridge</strong> (Antigravity, Claude Desktop, Windsurf, and any stdio-only MCP host). Merge under <code>mcpServers</code>:
          </p>
          <pre style={{ fontSize: '0.8rem', padding: '0.75rem', borderRadius: '6px', overflow: 'auto' }}>
{JSON.stringify({
  mcpServers: {
    aaf: {
      command: 'npx',
      args: ['-y', 'mcp-remote', 'https://www.agenticaf.io/api/mcp', '--transport', 'http-first'],
    },
  },
}, null, 2)}
          </pre>
          <p style={{ fontSize: '0.75rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
            After saving, restart the app or reload MCP. Ask the assistant what tools it has — you should see <code>aaf_lookup</code>, <code>aaf_checklist</code>, etc. If the deployment requires an API key, add <code>--header</code> <code>{'Authorization:${AAF_MCP_AUTHORIZATION}'}</code> and set <code>AAF_MCP_AUTHORIZATION</code> to <code>Bearer &lt;key&gt;</code> in <code>env</code> — see <a href="https://github.com/AgenticAF-Community/FrameworkCore/blob/main/api/README.md">api/README.md</a>.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)', marginTop: 0, marginBottom: 0, lineHeight: 1.6 }}>
            <strong>Note:</strong> Some clients rename the server (e.g. <code>user-aaf</code>). That is normal. Windsurf MCP availability may depend on your plan — check Codeium’s docs.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>
            3. AAF Posture Report <span style={statusStyle(true)}>Live</span>
          </h2>
          <p style={textStyle}>
            A CLI that scans a codebase and produces an AAF posture report: how well the project aligns with the
            eight pillars. Output is human-readable HTML/markdown and optional JSON for CI.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.5rem' }}>
            CLI lives in <a href="https://github.com/AgenticAF-Community/FrameworkCore/tree/main/tools/aaf-posture"><code>tools/aaf-posture/</code></a> on GitHub.
          </p>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
          How to use
        </h2>
        <ul style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)', paddingLeft: '1.5rem' }}>
          <li><strong>Humans:</strong> Run the posture CLI on your repo; read the report. Use the framework docs and skills as checklists during design reviews.</li>
          <li><strong>Agents:</strong> Load an AAF skill for architecture or security guidance. Use the MCP server to query the framework and run posture checks from within your assistant.</li>
          <li><strong>CI/CD:</strong> Add <code>aaf-posture --format json</code> to your pipeline; fail or warn on low posture scores or specific pillars.</li>
        </ul>

        <h2 style={{ fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Methodology
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' }}>
          Our tools use AI in one specific, documented place — extracting trade-offs from framework prose.
          Everything else is deterministic. Read the{' '}
          <a href="/methodology">full methodology</a> to understand what uses AI, what doesn't,
          and how to trace any recommendation to its source.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--ifm-font-color-secondary)', marginTop: '2rem' }}>
          For the current roadmap and repo layout, see <a href="https://github.com/AgenticAF-Community/FrameworkCore/tree/main/tools">tools/ on GitHub</a>.
        </p>
      </main>
    </Layout>
  );
}
