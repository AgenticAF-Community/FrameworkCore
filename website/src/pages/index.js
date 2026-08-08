import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageStats from '../components/HomepageStats';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const frameworkImage = useBaseUrl('/img/framework-overview.png');
  const pdfUrl = siteConfig.customFields?.pdfDownloadUrl || useBaseUrl('/pdf/agentic-architecture-framework-v1.pdf');

  return (
    <Layout title="Vendor-Agnostic Architecture for AI Agents" description="The Agentic Architecture Framework — community-driven, governance-first architecture guidance for building safe, reliable, and scalable agentic AI systems.">
      <main style={{ padding: '1.5rem 1rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Welcome to the Agentic Architecture Framework
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--ifm-font-color-base)', marginBottom: 0 }}>
            Vendor-agnostic, governance-first guidance for building agentic systems that are safe, reliable, and scalable.
            Browse the whitepaper in the menu — or put AAF directly into your AI tools.
          </p>
        </div>

        {/* Above-the-fold CTAs: MCP first for conversion; PDF secondary */}
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1.15rem 1.25rem',
            borderRadius: 8,
            border: '1px solid var(--ifm-color-emphasis-200)',
            background: 'var(--ifm-color-emphasis-100)',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ifm-color-primary)',
              marginBottom: '0.35rem',
            }}
          >
            Hosted MCP for your IDE
          </p>
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: 650,
              lineHeight: 1.35,
              color: 'var(--ifm-heading-color)',
              marginBottom: '0.4rem',
            }}
          >
            Stop pasting the whitepaper into every chat.
          </p>
          <p
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.55,
              color: 'var(--ifm-font-color-base)',
              marginBottom: '0.9rem',
              maxWidth: '38rem',
            }}
          >
            Give Cursor, Claude, and other MCP clients live AAF lookup, checklists, and skills —
            so agents design and review against the framework instead of guessing.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '0.65rem' }}>
            <a
              href="/api/stripe/checkout"
              className="button button--primary button--lg"
              style={{ textDecoration: 'none' }}
            >
              Get MCP Access — £3/mo
            </a>
            <a
              href={pdfUrl}
              className="button button--secondary button--lg"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Full PDF
            </a>
          </div>

          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--ifm-font-color-secondary)', marginBottom: '0.25rem' }}>
            <strong style={{ color: 'var(--ifm-font-color-base)' }}>1,000 requests / month · hard cap</strong>
            {' '}— no overage bills. Surplus supports keeping AAF open and maintained.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)', marginBottom: 0 }}>
            By purchasing you agree to our <a href="/terms">Terms</a> and{' '}
            <a href="/privacy">Privacy Policy</a>. Manage or rotate keys anytime at{' '}
            <a href="/manage-access">Manage access</a>.
          </p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <img
            src={frameworkImage}
            alt="The Blueprint: Agentic Architecture Framework (v1)"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-200)' }}
          />
        </div>

        <HomepageStats />

        <div style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          <strong>License (CC BY-NC 4.0):</strong> You may share and use this framework for non-commercial purposes.
          You must give appropriate credit. You may not sell the document or charge for training based on it.
          You <em>may</em> use the framework to build commercial products.{' '}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">Full license</a>
        </div>
      </main>
    </Layout>
  );
}
