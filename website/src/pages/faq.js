import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';

const faqData = [
  {
    question: 'What is an AI agent?',
    answer:
      'An AI agent is a software system that combines a foundation model (typically an LLM) with tool access, memory, and a control loop to autonomously interpret instructions, make decisions, and take actions. Unlike simple chatbots, agents can execute multi-step tasks, call external APIs, and modify external state.',
    link: '/what-is-an-agent',
  },
  {
    question: 'What is the Agentic Architecture Framework?',
    answer:
      'The Agentic Architecture Framework (AAF) is a community-driven, vendor-agnostic set of architecture guidance for building safe, reliable, and governed agentic AI systems. It defines six pillars (Security, Reliability, Cost, Operations, Performance, Sustainability) and two cross-cutting foundations (Context Optimization, Autonomy Governance).',
    link: '/framework-overview',
  },
  {
    question: 'What is an agentic control loop?',
    answer:
      'The agentic control loop is the repeating cycle an agent follows: Trigger → Interpret Context → Decide → Act → Observe Results → Verify → [Adapt / Stop]. A simplified form is Trigger → Decide → Act → Verify. Every architectural decision in the framework maps to a stage of this loop.',
    link: '/framework-overview',
  },
  {
    question: 'How do you secure AI agents?',
    answer:
      'Securing AI agents requires a systems-security approach: least-privilege tool access, tool gateways that validate every call, prompt injection defences, privilege separation between reasoning and execution, and applying the CIA triad (Confidentiality, Integrity, Availability) to every component of the agent system.',
    link: '/pillar-security',
  },
  {
    question: 'What is prompt injection and how do you defend against it?',
    answer:
      'Prompt injection is an attack where malicious instructions are hidden in data the agent processes, causing it to deviate from its intended behaviour. Defences include instruction hierarchy enforcement, input sanitisation, output filtering, separating trusted instructions from untrusted data, and never allowing user-supplied content to modify the system prompt.',
    link: '/pillar-security',
  },
  {
    question: 'How do you manage AI agent costs?',
    answer:
      'Agent costs are controlled through token budgets per task, compute quotas, model routing (using smaller models for simpler steps), caching strategies, loop limits to prevent runaway iterations, and explicit cost gates that halt execution when spend thresholds are reached.',
    link: '/pillar-cost',
  },
  {
    question: 'What is an Agent Control Contract (ACC)?',
    answer:
      'An Agent Control Contract is a structured governance specification that defines an agent\'s permissions, tool access, autonomy level, escalation policies, and audit requirements. It acts as a declarative policy document that both humans and supervisory agents can enforce at runtime.',
    link: '/annex-agent-control-contracts',
  },
  {
    question: 'What are autonomy levels for AI agents?',
    answer:
      'The framework defines four autonomy levels: Assistive (agent suggests, human acts), Delegated (agent proposes a plan, human approves), Bounded Autonomous (agent acts within constraints, escalating edge cases), and Supervisory (agent manages other agents). Each level requires different governance controls.',
    link: '/autonomy-governance',
  },
  {
    question: 'What is an epistemic gate?',
    answer:
      'An epistemic gate is a verification checkpoint in an agent\'s control loop where the system must demonstrate sufficient confidence or evidence before proceeding. Gates prevent agents from acting on hallucinated or uncertain information by requiring explicit justification at critical decision points.',
    link: '/what-is-an-agent',
  },
  {
    question: 'What is harness engineering?',
    answer:
      'Harness engineering is the practice of designing the execution environment and constraints around an agent to improve its performance, rather than only optimising the model itself. Deliberate constraints on token budgets, tool access, and elapsed time have been shown to improve task completion rates by forcing focused, efficient execution.',
    link: '/pillar-performance',
  },
  {
    question: 'What is the AAF MCP server?',
    answer:
      'The AAF MCP (Model Context Protocol) server is a hosted API that exposes the framework as tools for AI assistants such as Cursor, Claude, VS Code, and others. Assistants can look up framework terms, run checklists, load skills, generate Agent Control Contracts, and more — without re-reading the full whitepaper every time. Setup details are on the Tools page.',
    link: '/tools',
  },
  {
    question: 'Why is hosted MCP access paid?',
    answer:
      'The framework documentation, GitHub repo, skills, and local CLI remain free. Hosted MCP runs on shared infrastructure with authentication, usage metering, and support. AAF MCP Access is £3/month and includes 1,000 requests with a hard monthly cap (no overage). That covers operating the service so the community docs can stay free to read.',
    link: '/tools',
  },
  {
    question: 'What do I get with MCP Access, and how do I manage it?',
    answer:
      'You get an API key (shown once after purchase or rotate) to call https://www.agenticaf.io/api/mcp with Authorization: Bearer <key>. Use Manage access on the site to request a magic-link sign-in, see usage (calls used / 1000), rotate your key, or open the Stripe billing portal. Docs and the local posture CLI do not require a key.',
    link: '/tools',
  },
  {
    question: 'Who is WrangleAI?',
    answer:
      'WrangleAI Ltd operates agenticaf.io and the paid AAF MCP Access service (company number 16670149, Malvern, England). WrangleAI builds enterprise AI operations tooling and sponsors the hosted MCP so the Agentic Architecture Framework stays available as open, community-oriented guidance. Stripe Checkout may show WrangleAI as the merchant — that is expected. The framework content itself remains community-driven under its published licence.',
    link: '/terms',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

function FAQItem({ question, answer, link }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        padding: '1.25rem 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          padding: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--ifm-font-color-base)',
          }}
        >
          {question}
        </h3>
        <span
          style={{
            fontSize: '1.25rem',
            color: 'var(--ifm-color-primary)',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(45deg)' : 'none',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div style={{ marginTop: '0.75rem' }}>
          <p
            style={{
              lineHeight: 1.7,
              color: 'var(--ifm-font-color-secondary)',
              margin: 0,
            }}
          >
            {answer}
          </p>
          {link && (
            <a
              href={link}
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              {link === '/tools' || link === '/terms' || link === '/manage-access'
                ? 'Learn more'
                : 'Read more in the framework'}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <Layout
      title="FAQ — Agentic Architecture Framework"
      description="Frequently asked questions about AI agents, the Agentic Architecture Framework, AAF MCP Access, pricing, and WrangleAI."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>
      <main style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Frequently Asked Questions
        </h1>
        <p
          style={{
            color: 'var(--ifm-font-color-secondary)',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Common questions about AI agents, the Agentic Architecture Framework, hosted MCP Access, and who operates the service. Framework answers link into the whitepaper; product answers link to Tools or Terms.
        </p>
        <div>
          {faqData.map((item, idx) => (
            <FAQItem key={idx} {...item} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
