import React from 'react';
import Layout from '@theme/Layout';

const sectionStyle = { marginBottom: '2.5rem' };
const textStyle = { fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' };
const listStyle = { ...textStyle, paddingLeft: '1.5rem', marginTop: '0.5rem' };

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

function MemberCard({ name, role, github, areas }) {
  return (
    <div style={{
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{name}</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', marginBottom: '0.5rem' }}>{role}</div>
      {github && (
        <div style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
          <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer">@{github}</a>
        </div>
      )}
      {areas && (
        <div style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)' }}>
          {areas.join(' · ')}
        </div>
      )}
    </div>
  );
}

const MEMBERS = [
  {
    name: 'David Maddock',
    role: 'Founding Maintainer',
    github: 'davidjmaddock',
    areas: ['Framework content', 'Architecture', 'Tooling'],
  },
];

const APPLY_URL = 'https://github.com/AgenticAF-Community/FrameworkCore/issues/new?template=working-group-application.yml';

export default function WorkingGroup() {
  return (
    <Layout
      title="Working Group"
      description="The AAF Working Group: Terms of Reference, current members, and how to apply."
    >
      <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Working Group
        </h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)', marginBottom: '2rem' }}>
          The AAF Working Group stewards the framework's development: reviewing contributions,
          maintaining quality, and guiding the roadmap. Membership is open to practitioners
          who want to shape how agentic systems are governed.
        </p>

        <Section title="Terms of Reference">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Mission</h3>
          <p style={textStyle}>
            Develop and maintain a governance-first architecture framework for agentic AI systems
            that is practical, open, and grounded in production engineering experience.
          </p>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Scope</h3>
          <ul style={listStyle}>
            <li>Author, review, and refine the six pillar documents and cross-cutting foundations</li>
            <li>Maintain the toolchain: CLI tools, MCP server, trade-off engine, posture scanner</li>
            <li>Review AI-extracted trade-off data (the "air gap" review process)</li>
            <li>Guide community contributions and manage the public roadmap</li>
            <li>Ensure the framework stays technology-agnostic and grounded in evidence</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Member commitments</h3>
          <ul style={listStyle}>
            <li>Participate in at least one review or contribution per quarter</li>
            <li>Respond to assigned reviews within 7 days</li>
            <li>Act constructively and in accordance with the Code of Conduct</li>
            <li>Disclose conflicts of interest where relevant</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Decision-making</h3>
          <p style={textStyle}>
            Decisions are made by rough consensus among active members. For contentious changes,
            a simple majority of active members is sufficient. The founding maintainer holds a
            tie-breaking vote during the bootstrap phase (fewer than 5 active members).
          </p>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Intellectual property</h3>
          <p style={textStyle}>
            All contributions to the framework are licensed under{' '}
            <a href="https://github.com/AgenticAF-Community/FrameworkCore/blob/main/LICENSE">CC BY-NC 4.0</a>.
            Contributors retain copyright but grant the project a perpetual, irrevocable license
            to use, modify, and distribute their contributions under this license.
          </p>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Code of Conduct</h3>
          <p style={textStyle}>
            Members are expected to be respectful, inclusive, and focused on technical merit.
            Personal attacks, harassment, and bad-faith participation are grounds for removal.
            Disagreements should be resolved through evidence and discussion, not authority.
          </p>
        </Section>

        <Section title="Current members">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {MEMBERS.map((m) => (
              <MemberCard key={m.github} {...m} />
            ))}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', marginTop: '1rem' }}>
            The working group is in its bootstrap phase. We're actively looking for members
            with experience in agentic systems, security architecture, developer tooling, and
            AI governance.
          </p>
        </Section>

        <Section title="Apply to join">
          <Callout>
            We welcome applications from engineers, architects, researchers, and practitioners
            who are building or governing agentic systems. You don't need to be an expert in
            every pillar — bring your strengths and we'll build the team around complementary skills.
          </Callout>
          <p style={textStyle}>
            Applications are submitted as a GitHub Issue using a structured form.
            Existing members review applications and respond within two weeks.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <a
              href={APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#fff',
                backgroundColor: 'var(--ifm-color-primary)',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Apply to join the Working Group
            </a>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--ifm-font-color-secondary)', marginTop: '1rem' }}>
            Requires a GitHub account. Your application will be visible on the public repository.
          </p>
        </Section>

        <Section title="How it works">
          <ol style={listStyle}>
            <li>Submit your application using the button above</li>
            <li>Existing members review and may ask follow-up questions on the issue</li>
            <li>Once approved, you'll be added as a collaborator on the repository</li>
            <li>Your name and role appear on this page</li>
            <li>You'll be assigned to reviews and can propose changes to the framework</li>
          </ol>
        </Section>

        <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', marginTop: '2rem' }}>
          Questions?{' '}
          <a href="https://github.com/AgenticAF-Community/FrameworkCore/discussions">
            Start a discussion
          </a>{' '}
          on GitHub.
        </p>
      </main>
    </Layout>
  );
}
