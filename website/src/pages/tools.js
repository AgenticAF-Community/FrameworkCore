import React from 'react';
import Layout from '@theme/Layout';

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
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)', marginBottom: '1.5rem' }}>
          The whitepaper is the source of truth. This section describes how we turn it into a <strong>utility</strong>—so
          agents and humans can apply the framework without re-reading the full document every time.
        </p>

        <h2 style={{ fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
          Three layers
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-base)', marginBottom: '1.5rem' }}>
          We are building three complementary ways to use AAF programmatically:
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Skills</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' }}>
            Reusable instruction sets that agents (e.g. in Cursor, Claude Projects) can load to apply AAF when
            designing or reviewing agentic systems. Examples: architecture review checklist, security pillar guidance,
            epistemic gates patterns. Skills live in the repo under <code>tools/skills/</code> and can be referenced
            or copied into your environment.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
            Status: Planned. Directory and initial skills coming next.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. MCP server</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' }}>
            A Model Context Protocol (MCP) server that exposes the framework as tools: lookup definitions and pillars,
            retrieve pillar-specific checklists, and (optionally) run a posture check against a codebase. AI assistants
            that support MCP can call these tools so users get accurate, framework-grounded answers without opening
            the PDF.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
            Status: Planned. Will be implemented after the posture CLI and initial skills.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. AAF Posture report</h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' }}>
            A CLI that scans a codebase and produces an AAF posture report: how well the project aligns with the six
            pillars (security, reliability, cost, operations, performance, sustainability). Output is human-readable
            markdown and optional JSON for CI. Run it locally or in pipelines to track alignment over time.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
            Status: Planned. CLI and default rules will live under <code>tools/aaf-posture/</code>.
          </p>
        </div>

        <h2 style={{ fontSize: '1.35rem', marginTop: '2rem', marginBottom: '0.75rem' }}>
          How to use this (when available)
        </h2>
        <ul style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)', paddingLeft: '1.5rem' }}>
          <li><strong>Humans:</strong> Run the posture CLI on your repo; read the report. Use the framework docs and skills as checklists during design reviews.</li>
          <li><strong>Agents:</strong> Load an AAF skill for architecture or security guidance. Use the MCP server to query the framework and run posture checks from within your assistant.</li>
          <li><strong>CI/CD:</strong> Add <code>aaf-posture --format json</code> to your pipeline; fail or warn on low posture scores or specific pillars.</li>
        </ul>

        <p style={{ fontSize: '0.95rem', color: 'var(--ifm-font-color-secondary)', marginTop: '2rem' }}>
          For the current roadmap and repo layout, see <a href="https://github.com/AgenticAF-Community/FrameworkCore/tree/main/tools">tools/ on GitHub</a>.
        </p>
      </main>
    </Layout>
  );
}
