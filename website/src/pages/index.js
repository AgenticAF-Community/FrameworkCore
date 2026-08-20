import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import HomepageStats from '../components/HomepageStats';

export default function Home() {
  const frameworkImage = useBaseUrl('/img/framework-overview.png');

  return (
    <Layout title="Vendor-Agnostic Architecture for AI Agents" description="The Agentic Architecture Framework — community-driven, governance-first architecture guidance for building safe, reliable, and scalable agentic AI systems.">
      <main
        style={{
          padding: '1.5rem 1rem 2rem',
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '1.25rem',
          alignItems: 'start',
        }}
        className="aaf-home"
      >
        <style>{`
          @media (min-width: 996px) {
            .aaf-home {
              grid-template-columns: 240px minmax(0, 1fr) !important;
              column-gap: 1.5rem !important;
            }
            .aaf-home-mcp {
              position: sticky;
              top: 5.5rem;
            }
          }
        `}</style>

        {/* Compact left-rail: MCP CTA + Product Hunt (stacks above content on mobile) */}
        <div className="aaf-home-mcp" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <aside
            style={{
              padding: '0.9rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--ifm-color-emphasis-200)',
              background: 'var(--ifm-color-emphasis-100)',
            }}
          >
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--ifm-color-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Hosted MCP
            </p>
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: 650,
                lineHeight: 1.3,
                color: 'var(--ifm-heading-color)',
                marginBottom: '0.45rem',
              }}
            >
              Build better agents with our MCP
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                lineHeight: 1.45,
                color: 'var(--ifm-font-color-base)',
                marginBottom: '0.75rem',
              }}
            >
              Let your agent build against a constant standard — not inconsistent design approaches.
            </p>

            <a
              href="/api/stripe/checkout"
              className="button button--sm"
              style={{
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
                marginBottom: '0.55rem',
                background: '#22a05a',
                borderColor: '#22a05a',
                color: '#fff',
              }}
            >
              Get access — £3/mo
            </a>
            <p
              style={{
                fontSize: '0.8rem',
                lineHeight: 1.4,
                color: 'var(--ifm-font-color-secondary)',
                marginBottom: '0.45rem',
              }}
            >
              <strong style={{ color: 'var(--ifm-font-color-base)' }}>1,000 tool calls / mo</strong>
              {' '}· hard cap · no overage
            </p>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'var(--ifm-font-color-secondary)', marginBottom: '0.55rem' }}>
              Helps fund hosting and ongoing framework updates.
            </p>
            <p style={{ fontSize: '0.72rem', lineHeight: 1.4, color: 'var(--ifm-font-color-secondary)', marginBottom: 0 }}>
              <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a>
              <br />
              <a href="/manage-access">Manage access</a>
            </p>
          </aside>

          <a
            href="https://www.producthunt.com/products/agentic-architecture-framework?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-agentic-architecture-framework"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', lineHeight: 0 }}
          >
            <img
              alt="Agentic Architecture Framework - Vendor Agnostic Opensource Architecture Framework | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1183799&theme=light&t=1787212626977"
              style={{ width: '100%', maxWidth: 250, height: 'auto' }}
            />
          </a>
        </div>

        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
              Welcome to the Agentic Architecture Framework
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.65, color: 'var(--ifm-font-color-base)', marginBottom: 0 }}>
              Vendor-agnostic, governance-first guidance for building agentic systems that are safe, reliable, and scalable.
              Browse the whitepaper in the menu — or put AAF directly into your AI tools.
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
        </div>
      </main>
    </Layout>
  );
}
