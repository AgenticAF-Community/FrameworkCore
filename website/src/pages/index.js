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
      <main style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            Welcome to the Agentic Architecture Framework
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' }}>
            Thank you for your interest in the Agentic Architecture Framework. This is a vendor-agnostic, 
            governance-first approach to building agentic AI systems that are safe, reliable, and scalable.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' }}>
            Use the <strong>Framework</strong> menu above to explore the full whitepaper section by section, 
            or download the complete PDF version below.
          </p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <img 
            src={frameworkImage} 
            alt="The Blueprint: Agentic Architecture Framework (v1)" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px', border: '1px solid var(--ifm-color-emphasis-200)' }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a
            href={pdfUrl}
            className="button button--primary button--lg"
            style={{ textDecoration: 'none' }}
          >
            Download Full PDF
          </a>
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
