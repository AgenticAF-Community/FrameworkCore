import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const sectionStyle = { marginBottom: '2rem' };
const textStyle = { fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' };
const listStyle = { ...textStyle, paddingLeft: '1.5rem', marginTop: '0.5rem' };
const h2Style = { fontSize: '1.25rem', marginBottom: '0.75rem' };
const h3Style = { fontSize: '1.05rem', marginTop: '1.25rem', marginBottom: '0.5rem' };

function Section({ title, children }) {
  return (
    <section style={sectionStyle}>
      <h2 style={h2Style}>{title}</h2>
      {children}
    </section>
  );
}

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy"
      description="Privacy Policy for agenticaf.io and AAF MCP Access, operated by WrangleAI Ltd."
    >
      <main style={{ padding: '2rem 1rem', maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ ...textStyle, color: 'var(--ifm-font-color-secondary)', marginBottom: '1.5rem' }}>
          Effective date: 8 August 2026 · Last updated: 8 August 2026
        </p>

        <Section title="1. Who we are">
          <p style={textStyle}>
            The Agentic Architecture Framework site at{' '}
            <a href="https://www.agenticaf.io">agenticaf.io</a> (the &quot;Site&quot;) and paid MCP Access
            (the &quot;Service&quot;) are enabled and operated by:
          </p>
          <ul style={listStyle}>
            <li>
              <strong>WrangleAI Ltd</strong> (&quot;WrangleAI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            </li>
            <li>Company number: 16670149</li>
            <li>Registered office: 11a Abbey Road, Malvern, England, WR14 3ES</li>
            <li>
              Privacy: <a href="mailto:privacy@wrangleai.com">privacy@wrangleai.com</a>
            </li>
            <li>
              Data Protection Officer: <a href="mailto:dpo@wrangleai.com">dpo@wrangleai.com</a>
            </li>
          </ul>
          <p style={textStyle}>
            WrangleAI Ltd is the data controller for personal data processed through this Site and Service.
            The broader WrangleAI platform at{' '}
            <a href="https://wrangleai.com" target="_blank" rel="noopener noreferrer">
              wrangleai.com
            </a>{' '}
            is covered by the{' '}
            <a href="https://wrangleai.com/privacy-policy" target="_blank" rel="noopener noreferrer">
              WrangleAI Privacy Policy
            </a>
            . This policy applies only to agenticaf.io and AAF MCP Access.
          </p>
        </Section>

        <Section title="2. Scope">
          <p style={textStyle}>This Privacy Policy covers:</p>
          <ul style={listStyle}>
            <li>Visitors to the Site (including framework documentation and community pages)</li>
            <li>Customers who subscribe to MCP Access</li>
            <li>People who contact us about the Site or Service</li>
          </ul>
        </Section>

        <Section title="3. Personal data we collect">
          <h3 style={h3Style}>3.1 Account and billing (MCP Access)</h3>
          <ul style={listStyle}>
            <li>
              <strong>Email address</strong> — required for checkout, receipts, magic-link sign-in, and support
            </li>
            <li>
              <strong>Stripe identifiers</strong> — customer ID, subscription ID, and related billing metadata
            </li>
            <li>
              <strong>Subscription status</strong> — active/cancelled, period end, included call allowance, calls used
            </li>
            <li>
              <strong>API key material</strong> — we store a cryptographic hash of your API key, not the plaintext key
              after initial reveal
            </li>
          </ul>
          <p style={textStyle}>
            <strong>Payment card details</strong> are collected and processed by Stripe. We do not store full card
            numbers on our systems.
          </p>

          <h3 style={h3Style}>3.2 Authentication</h3>
          <ul style={listStyle}>
            <li>Short-lived magic-link tokens (emailed via Resend)</li>
            <li>Session cookies used to keep you signed in on Manage Access</li>
          </ul>

          <h3 style={h3Style}>3.3 Service usage</h3>
          <ul style={listStyle}>
            <li>MCP request counts against your monthly allowance</li>
            <li>
              Aggregate, non-identifying telemetry used for public Site stats (for example total tool-call counts),
              where enabled
            </li>
          </ul>
          <p style={textStyle}>
            We do not intentionally store the content of your MCP tool arguments, prompts, or document payloads as
            part of the paid Service.
          </p>

          <h3 style={h3Style}>3.4 Technical data</h3>
          <p style={textStyle}>
            Standard server and edge logs may include IP address, User-Agent, timestamps, and request paths as needed
            to operate, secure, and debug the Site and Service (hosted on Vercel and related infrastructure).
          </p>

          <h3 style={h3Style}>3.5 Communications</h3>
          <p style={textStyle}>
            If you email us for support, we process the content of that correspondence and your email address.
          </p>

          <h3 style={h3Style}>3.6 Community / third-party embeds</h3>
          <p style={textStyle}>
            Some pages may embed GitHub Discussions via Giscus. Interaction with those embeds is also subject to
            GitHub&apos;s privacy practices.
          </p>
        </Section>

        <Section title="4. How we use personal data">
          <ul style={listStyle}>
            <li>Provide MCP Access, authenticate you, and enforce the monthly request limit</li>
            <li>Process payments and manage subscriptions via Stripe</li>
            <li>Send transactional email (magic links, billing-related notices, security notices)</li>
            <li>Provide email support</li>
            <li>Secure the Service, prevent abuse, and investigate incidents</li>
            <li>Comply with legal and accounting obligations</li>
            <li>Improve reliability using aggregate usage statistics</li>
          </ul>
          <p style={textStyle}>
            We do not use your MCP Access email for marketing unless you separately opt in. Transactional messages
            required to run the Service may still be sent.
          </p>
        </Section>

        <Section title="5. Legal bases (UK GDPR / EU GDPR)">
          <ul style={listStyle}>
            <li>
              <strong>Contract</strong> — providing MCP Access, billing, authentication, and support
            </li>
            <li>
              <strong>Legitimate interests</strong> — security, abuse prevention, service improvement, essential
              cookies/sessions
            </li>
            <li>
              <strong>Legal obligation</strong> — tax, accounting, and regulatory requirements
            </li>
            <li>
              <strong>Consent</strong> — where required for optional cookies or marketing (if introduced later)
            </li>
          </ul>
        </Section>

        <Section title="6. Sharing and processors">
          <p style={textStyle}>We do not sell personal data. We share data with processors who help us run the Service:</p>
          <ul style={listStyle}>
            <li>
              <strong>Stripe</strong> — payments and subscription management
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery
            </li>
            <li>
              <strong>Vercel</strong> — hosting, serverless APIs, and related infrastructure
            </li>
            <li>
              <strong>Upstash (Redis/KV)</strong> — subscription and auth records
            </li>
            <li>
              <strong>GitHub / Giscus</strong> — optional comments and community features
            </li>
          </ul>
          <p style={textStyle}>
            We may also disclose data if required by law, to protect rights and safety, or in connection with a
            business transfer (merger, acquisition, or asset sale), with notice where appropriate.
          </p>
        </Section>

        <Section title="7. International transfers">
          <p style={textStyle}>
            We serve users in the UK, EU, US, and elsewhere. Some processors (including Stripe and US-based cloud
            providers) may process data outside the UK/EEA. Where required, we rely on appropriate safeguards such as
            Standard Contractual Clauses and the UK International Data Transfer Addendum, and on adequacy decisions
            where applicable.
          </p>
        </Section>

        <Section title="8. Retention">
          <ul style={listStyle}>
            <li>
              <strong>Active subscriptions</strong> — retained while your subscription is active
            </li>
            <li>
              <strong>After cancellation</strong> — access records may be retained for a limited period for support,
              fraud prevention, and accounting, then deleted or anonymised when no longer needed
            </li>
            <li>
              <strong>Billing / financial records</strong> — typically up to 7 years where required for tax and
              accounting
            </li>
            <li>
              <strong>Magic-link tokens</strong> — short-lived; deleted after use or expiry
            </li>
            <li>
              <strong>Support emails</strong> — retained as needed to resolve your request and for legitimate business
              records
            </li>
          </ul>
        </Section>

        <Section title="9. Cookies">
          <p style={textStyle}>
            We use strictly necessary cookies/session storage for Manage Access authentication. Theme preferences may
            also be stored locally in your browser. We do not currently rely on advertising cookies on this Site. If
            we add non-essential analytics cookies, we will update this policy and obtain consent where required.
          </p>
        </Section>

        <Section title="10. Security">
          <p style={textStyle}>
            We use industry-standard measures appropriate to the Service, including TLS in transit, hashed API keys,
            access controls, and processor security commitments. No method of transmission or storage is perfectly
            secure.
          </p>
          <p style={textStyle}>
            If a personal data breach is likely to result in a risk to your rights and freedoms, we will notify
            affected individuals without undue delay (target: within 48 hours of becoming aware, where feasible) and
            notify the ICO within 72 hours where required by UK GDPR.
          </p>
        </Section>

        <Section title="11. Your rights">
          <p style={textStyle}>
            Depending on where you live (UK, EEA, California, and other jurisdictions), you may have rights to access,
            rectify, erase, restrict, object to processing, port your data, and withdraw consent. California residents
            may have CCPA/CPRA rights including the right to know, delete, and opt out of &quot;sale&quot; or
            &quot;sharing&quot; (we do not sell personal information).
          </p>
          <p style={textStyle}>
            To exercise rights, email{' '}
            <a href="mailto:privacy@wrangleai.com">privacy@wrangleai.com</a> or{' '}
            <a href="mailto:dpo@wrangleai.com">dpo@wrangleai.com</a>. We may need to verify your identity. You may also
            lodge a complaint with the{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              Information Commissioner&apos;s Office (ICO)
            </a>{' '}
            or your local supervisory authority.
          </p>
        </Section>

        <Section title="12. Children">
          <p style={textStyle}>
            The Site and Service are not directed to children under 18. We do not knowingly collect personal data from
            children under 18.
          </p>
        </Section>

        <Section title="13. Changes">
          <p style={textStyle}>
            We may update this policy from time to time. Material changes will be posted on this page with an updated
            &quot;Last updated&quot; date. Continued use of the Site or Service after changes take effect constitutes
            acceptance of the updated policy where permitted by law.
          </p>
        </Section>

        <Section title="14. Contact">
          <p style={textStyle}>
            WrangleAI Ltd, 11a Abbey Road, Malvern, England, WR14 3ES
            <br />
            Privacy: <a href="mailto:privacy@wrangleai.com">privacy@wrangleai.com</a>
            <br />
            DPO: <a href="mailto:dpo@wrangleai.com">dpo@wrangleai.com</a>
            <br />
            Support: <a href="mailto:support@agenticaf.io">support@agenticaf.io</a>
          </p>
          <p style={{ ...textStyle, marginTop: '1.5rem' }}>
            Related: <Link to="/terms">Terms of Use</Link>
          </p>
        </Section>
      </main>
    </Layout>
  );
}
