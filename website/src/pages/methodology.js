import React from 'react';
import Layout from '@theme/Layout';

const sectionStyle = { marginBottom: '2.5rem' };
const textStyle = { fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' };
const subTextStyle = { ...textStyle, color: 'var(--ifm-font-color-secondary)' };
const listStyle = { ...textStyle, paddingLeft: '1.5rem', marginTop: '0.5rem' };
const codeBlockStyle = {
  fontSize: '0.8rem',
  padding: '1rem',
  borderRadius: '6px',
  overflow: 'auto',
  marginTop: '0.75rem',
  backgroundColor: 'var(--ifm-code-background)',
};

function Section({ title, children }) {
  return (
    <div style={sectionStyle}>
      <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>{title}</h2>
      {children}
    </div>
  );
}

function Callout({ children }) {
  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderLeft: '4px solid var(--ifm-color-primary)',
      backgroundColor: 'var(--ifm-color-emphasis-100)',
      borderRadius: '0 6px 6px 0',
      marginBottom: '1.5rem',
      fontSize: '0.95rem',
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

export default function Methodology() {
  return (
    <Layout
      title="Methodology"
      description="How the AAF recommendation engine works: what uses AI, what is deterministic, and how to trace any recommendation to its source."
    >
      <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Methodology: How the Recommendation Engine Works
        </h1>
        <p style={{ ...subTextStyle, marginBottom: '2rem' }}>
          Transparency is a first-class requirement. This page documents exactly how the AAF toolchain
          produces trade-off analysis, design recommendations, and posture interpretations — including
          where AI is used and where it is not.
        </p>

        <Section title="1. Source of truth">
          <p style={textStyle}>
            The <a href="https://github.com/AgenticAF-Community/FrameworkCore/tree/main/docs">framework documents</a> are
            community-authored and community-governed. Every tool output — trade-off analysis, design recommendations,
            posture interpretations — is derived from these docs. The docs are the root.
          </p>
        </Section>

        <Section title="2. Where AI is used">
          <Callout>
            AI is used in exactly one place: extracting structured trade-off data from framework prose.
            Everything downstream is deterministic.
          </Callout>
          <ul style={listStyle}>
            <li>
              A script (<code>extract-tradeoffs.js</code>) reads the pillar documents and sends them to an LLM
              with a strict extraction prompt.
            </li>
            <li>
              The extraction prompt is{' '}
              <a href="https://github.com/AgenticAF-Community/FrameworkCore/blob/main/tools/scripts/prompts/extract-tradeoffs.md">
                version-controlled in the repo
              </a>{' '}
              — anyone can inspect exactly what the AI is instructed to do.
            </li>
            <li>
              The prompt explicitly constrains the AI: <em>"Extract only. Do not add insights, opinions,
              or recommendations not explicitly stated in the source material."</em>
            </li>
            <li>
              Every AI extraction includes the exact source quote from the document so reviewers
              can verify the extraction matches the prose.
            </li>
            <li>
              Items the AI considers implied rather than explicit are flagged as{' '}
              <code>confidence: "inferred"</code> for extra scrutiny during review.
            </li>
          </ul>
        </Section>

        <Section title="3. Where AI is NOT used (deterministic)">
          <p style={textStyle}>Everything downstream of the approved data model is purely deterministic:</p>
          <ul style={listStyle}>
            <li>
              <strong>Pattern-matching engine</strong> — given your design choices, it looks up applicable trade-offs
              using rule-based matching. No AI. Same input always produces the same output.
            </li>
            <li>
              <strong>Doc block renderer</strong> — generates the "Design Recommendations & Trade-offs" sections
              at the bottom of each pillar doc directly from the approved data model.
            </li>
            <li>
              <strong>Design questionnaire</strong> — questions are extracted from pillar docs structurally
              (headings and bullet lists), not by AI.
            </li>
            <li>
              <strong>Posture scoring</strong> — heuristic checks match codebase patterns against known indicators.
              No AI involved.
            </li>
            <li>
              <strong>MCP tool responses</strong> — deterministic lookups against the approved data model.
            </li>
          </ul>
        </Section>

        <Section title="4. The air gap">
          <Callout>
            AI output never enters the data model automatically. Every change requires a maintainer-approved pull request.
          </Callout>
          <p style={textStyle}>The governance flow:</p>
          <ol style={listStyle}>
            <li>Framework docs change (community PR merged to main)</li>
            <li>GitHub Action runs the AI extraction script against updated docs</li>
            <li>Script opens a PR with proposed changes to the trade-off data model</li>
            <li>Each proposed trade-off is shown alongside its source quote from the docs</li>
            <li>Items flagged <code>confidence: "inferred"</code> are highlighted for extra scrutiny</li>
            <li>Maintainers review: verify accuracy, adjust wording, reject overreach</li>
            <li>Only after a maintainer merges the PR does the data model update</li>
            <li>Git history shows who approved what and when</li>
          </ol>
        </Section>

        <Section title="5. How to trace a recommendation">
          <p style={textStyle}>
            Every trade-off entry in the data model includes citation fields:
          </p>
          <pre style={codeBlockStyle}>
{JSON.stringify({
  tension: "Every validation gate costs tokens and time",
  sourceQuote: "Cost optimization sits tightly adjacent to...",
  source: { doc: "docs/08-pillar-cost.md", section: "7.8" },
  confidence: "explicit",
}, null, 2)}
          </pre>
          <ul style={listStyle}>
            <li>
              <code>source.doc</code> and <code>source.section</code> point to the exact framework document and section.
            </li>
            <li>
              <code>sourceQuote</code> contains the verbatim text from the document that supports the trade-off.
            </li>
            <li>
              <code>confidence</code> indicates whether the trade-off is explicitly stated or inferred from the text.
            </li>
            <li>
              The CLI and MCP tools include these citations in their output, so users can always trace
              a recommendation back to its source.
            </li>
          </ul>
        </Section>

        <Section title="6. How to challenge or improve">
          <ul style={listStyle}>
            <li>
              The{' '}
              <a href="https://github.com/AgenticAF-Community/FrameworkCore/blob/main/tools/data/trade-offs.json">
                trade-off data model
              </a>{' '}
              is version-controlled — open a PR to add, modify, or dispute any entry.
            </li>
            <li>
              The{' '}
              <a href="https://github.com/AgenticAF-Community/FrameworkCore/blob/main/tools/scripts/prompts/extract-tradeoffs.md">
                extraction prompt
              </a>{' '}
              is also open for community review and improvement.
            </li>
            <li>
              Changes to the framework docs automatically trigger new AI extraction proposals,
              which go through the same maintainer review process.
            </li>
            <li>
              If you believe a trade-off is missing, inaccurate, or goes beyond what the docs say,
              open an issue or PR on the{' '}
              <a href="https://github.com/AgenticAF-Community/FrameworkCore">FrameworkCore repo</a>.
            </li>
          </ul>
        </Section>

        <Section title="7. Architecture overview">
          <p style={textStyle}>
            Five layers, clearly separated:
          </p>
          <ol style={listStyle}>
            <li>
              <strong>Layer 1 — Community-authored framework:</strong> The pillar docs (<code>docs/*.md</code>).
              Source of truth. Community-governed.
            </li>
            <li>
              <strong>Layer 2 — AI extraction:</strong> Script reads docs, LLM proposes structured trade-offs
              with citations. Transparent, constrained, auditable.
            </li>
            <li>
              <strong>Layer 3 — Air gap:</strong> GitHub PR. Maintainers review, adjust, merge.
              Nothing enters the data model without human approval.
            </li>
            <li>
              <strong>Layer 4 — Approved data model:</strong>{' '}
              <code>trade-offs.json</code>. Version-controlled, human-reviewed, every entry cited.
            </li>
            <li>
              <strong>Layer 5 — Deterministic rendering:</strong> Pattern matcher, doc block renderer,
              MCP tools, CLI. No AI. Same input → same output. Always.
            </li>
          </ol>
        </Section>

        <p style={{ ...subTextStyle, marginTop: '2rem', fontSize: '0.9rem' }}>
          Questions about this methodology?{' '}
          <a href="https://github.com/AgenticAF-Community/FrameworkCore/discussions">
            Start a discussion
          </a>{' '}
          on GitHub.
        </p>
      </main>
    </Layout>
  );
}
