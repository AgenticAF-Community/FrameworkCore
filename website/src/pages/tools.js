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
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.75rem' }}>
            <strong>Connect your agent:</strong> Add the MCP server to your client's configuration:
          </p>
          <pre style={{ fontSize: '0.8rem', padding: '0.75rem', borderRadius: '6px', overflow: 'auto' }}>
{JSON.stringify({ "mcpServers": { "aaf": { "url": "https://www.agenticaf.io/api/mcp" } } }, null, 2)}
          </pre>
          <div style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            <strong>Where to put this config:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', marginBottom: 0 }}>
              <li><strong>Cursor</strong> — <code>~/.cursor/mcp.json</code> (global) or <code>&lt;project&gt;/.cursor/mcp.json</code> (workspace). Reload after saving.</li>
              <li><strong>Claude Desktop</strong> — <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or <code>%APPDATA%\Claude\claude_desktop_config.json</code> (Windows).</li>
              <li><strong>Windsurf</strong> — <code>~/.windsurf/mcp.json</code> (global) or <code>&lt;project&gt;/.windsurf/mcp.json</code> (workspace).</li>
            </ul>
            <p style={{ marginTop: '0.35rem', marginBottom: 0 }}>
              Note: some clients prefix the server name (e.g. Cursor registers <code>aaf</code> as <code>user-aaf</code>). This is normal client behaviour and doesn't affect functionality.
            </p>
          </div>
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
