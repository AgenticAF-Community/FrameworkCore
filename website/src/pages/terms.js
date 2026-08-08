import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const sectionStyle = { marginBottom: '2rem' };
const textStyle = { fontSize: '1rem', lineHeight: 1.7, color: 'var(--ifm-font-color-base)' };
const listStyle = { ...textStyle, paddingLeft: '1.5rem', marginTop: '0.5rem' };
const h2Style = { fontSize: '1.25rem', marginBottom: '0.75rem' };

function Section({ title, children }) {
  return (
    <section style={sectionStyle}>
      <h2 style={h2Style}>{title}</h2>
      {children}
    </section>
  );
}

export default function Terms() {
  return (
    <Layout
      title="Terms of Use"
      description="Terms of Use for agenticaf.io and AAF MCP Access, operated by WrangleAI Ltd."
    >
      <main style={{ padding: '2rem 1rem', maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Terms of Use</h1>
        <p style={{ ...textStyle, color: 'var(--ifm-font-color-secondary)', marginBottom: '1.5rem' }}>
          Effective date: 8 August 2026 · Last updated: 8 August 2026
        </p>

        <Section title="1. Agreement">
          <p style={textStyle}>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of{' '}
            <a href="https://www.agenticaf.io">agenticaf.io</a> (the &quot;Site&quot;) and paid AAF MCP Access (the
            &quot;Service&quot;). The Site and Service are enabled and operated by{' '}
            <strong>WrangleAI Ltd</strong> (&quot;WrangleAI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
            company number 16670149, registered office 11a Abbey Road, Malvern, England, WR14 3ES.
          </p>
          <p style={textStyle}>
            By accessing the Site or purchasing the Service, you agree to these Terms and our{' '}
            <Link to="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Site or Service.
          </p>
        </Section>

        <Section title="2. The Service">
          <p style={textStyle}>
            <strong>MCP Access</strong> is a single-seat subscription that provides authenticated access to the hosted
            Agentic Architecture Framework MCP server, subject to the limits stated at purchase and on the Site.
          </p>
          <ul style={listStyle}>
            <li>
              <strong>Price:</strong> £3 per month, inclusive of VAT where applicable
            </li>
            <li>
              <strong>Included usage:</strong> 1,000 MCP tool calls per billing month (hard cap; initialize and tools/list do not count)
            </li>
            <li>
              <strong>Seats:</strong> one seat / one primary API key per subscription (keys may be rotated)
            </li>
            <li>
              <strong>Support:</strong> email support only; no committed SLA or uptime guarantee
            </li>
          </ul>
          <p style={textStyle}>
            Framework documentation on the Site may be read without a subscription. Paid access applies to the hosted
            MCP Service and related account features (for example Manage Access).
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p style={textStyle}>
            You must be at least 18 years old and able to form a binding contract. If you use the Service on behalf of
            an organisation, you represent that you have authority to bind that organisation to these Terms.
          </p>
        </Section>

        <Section title="4. Accounts, API keys, and security">
          <ul style={listStyle}>
            <li>You must provide an accurate email address at checkout.</li>
            <li>
              Your API key is confidential. You are responsible for all activity under your key. Do not share it
              publicly or with unauthorised third parties.
            </li>
            <li>
              Plaintext keys are shown once at issuance (or after rotation). We store key hashes for authentication.
            </li>
            <li>
              You can manage billing and rotate keys via Manage Access and the Stripe customer portal where available.
            </li>
            <li>Notify us promptly at support@agenticaf.io if you suspect unauthorised use of your key.</li>
          </ul>
        </Section>

        <Section title="5. Billing, cancellation, and refunds">
          <ul style={listStyle}>
            <li>
              Subscriptions renew monthly until cancelled. Payment is processed by Stripe.
            </li>
            <li>
              You may cancel at any time via the Stripe billing portal (or by contacting support). Cancellation takes
              effect at the <strong>end of the current paid monthly period</strong>; you retain access until then.
            </li>
            <li>
              We do not provide prorated refunds for unused days in a billing period, except where required by law or
              where we choose to do so for a failed/duplicate charge or clear billing error.
            </li>
            <li>
              Nothing in these Terms limits non-waivable statutory consumer rights that may apply in your jurisdiction.
            </li>
            <li>
              If payment fails or the subscription is terminated for non-payment, we may suspend or revoke API access
              immediately.
            </li>
          </ul>
        </Section>

        <Section title="6. Fair use and tool-call limits">
          <p style={textStyle}>
            The 1,000 tool-call monthly allowance is a hard cap. Only MCP <code>tools/call</code> operations count
            toward the allowance; protocol handshake calls such as initialize and tools/list do not. When the cap is
            reached, further tool calls may be rejected until the next billing period (or until you renew/upgrade if
            such options are offered). Circumventing metering, sharing a single subscription across many unrelated
            users or systems beyond a single seat, or abusing the Service is prohibited.
          </p>
        </Section>

        <Section title="7. Acceptable use">
          <p style={textStyle}>You must not:</p>
          <ul style={listStyle}>
            <li>Use the Service unlawfully or to infringe others&apos; rights</li>
            <li>Attempt to gain unauthorised access to systems, data, or other customers&apos; accounts</li>
            <li>Interfere with or disrupt the Site, Service, or underlying infrastructure</li>
            <li>Resell, sublicense, or publicly redistribute API keys or paid access without our written consent</li>
            <li>Scrape or overload the Service in a way that degrades availability for others</li>
            <li>Misrepresent affiliation with WrangleAI, AgenticAF, or the framework community</li>
            <li>Use the Service to develop or distribute malware or to conduct attacks</li>
          </ul>
          <p style={textStyle}>
            We may suspend or terminate access for violations, suspected fraud, or risk to the Service or other users.
          </p>
        </Section>

        <Section title="8. Intellectual property and framework licence">
          <p style={textStyle}>
            Framework documentation and related content made available on the Site are licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
            </a>
            , unless a specific page states otherwise. You must give appropriate credit and may not use the material
            for commercial purposes except as permitted by that licence (including using the framework guidance to
            build commercial products, as described on the Site).
          </p>
          <p style={textStyle}>
            The hosted MCP Service, software, APIs, branding, and related technology are owned by WrangleAI Ltd (and
            its licensors). Your subscription grants a limited, non-exclusive, non-transferable right to use the
            Service for your own internal purposes during the paid term, subject to these Terms. No ownership rights
            are transferred.
          </p>
        </Section>

        <Section title="9. Community content and third-party services">
          <p style={textStyle}>
            The Site may link to GitHub, third-party tools, or other websites. We are not responsible for third-party
            content or practices. Payment processing is provided by Stripe under Stripe&apos;s terms.
          </p>
        </Section>

        <Section title="10. Disclaimers">
          <p style={textStyle}>
            THE SITE AND SERVICE ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
            KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
          </p>
          <p style={textStyle}>
            Framework guidance is informational architecture content. It is not legal, security, or professional advice.
            You remain responsible for how you design, deploy, and operate your own systems.
          </p>
        </Section>

        <Section title="11. Limitation of liability">
          <p style={textStyle}>
            To the maximum extent permitted by law, WrangleAI Ltd will not be liable for indirect, incidental,
            special, consequential, or punitive damages, or for lost profits, revenue, data, or goodwill, arising from
            your use of the Site or Service.
          </p>
          <p style={textStyle}>
            Our aggregate liability arising out of or relating to these Terms or the Service in any twelve-month period
            will not exceed the greater of (a) the amounts you paid to us for MCP Access in that period, or (b) £36.
          </p>
          <p style={textStyle}>
            Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence,
            fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under applicable law.
          </p>
        </Section>

        <Section title="12. Indemnity">
          <p style={textStyle}>
            You will defend and indemnify WrangleAI Ltd against claims, damages, and expenses arising from your misuse
            of the Service, violation of these Terms, or infringement of third-party rights, except to the extent
            caused by our wilful misconduct.
          </p>
        </Section>

        <Section title="13. Changes to the Service or Terms">
          <p style={textStyle}>
            We may modify the Service (including pricing, limits, and features) or these Terms. Material changes will
            be posted on this page with an updated date. If you continue using the Service after changes take effect,
            you accept the updated Terms. If you do not agree, cancel before the changes apply to you.
          </p>
        </Section>

        <Section title="14. Termination">
          <p style={textStyle}>
            You may stop using the Site at any time and cancel MCP Access as described above. We may suspend or
            terminate access for breach, non-payment, legal risk, or discontinuation of the Service. On termination,
            your right to use the paid Service ends; provisions that by nature should survive (including IP,
            disclaimers, liability limits, and governing law) will survive.
          </p>
        </Section>

        <Section title="15. Governing law and disputes">
          <p style={textStyle}>
            These Terms are governed by the laws of England and Wales. Courts of England and Wales have exclusive
            jurisdiction, except that consumers in the UK/EEA may bring claims in their country of residence where
            mandatory law so requires.
          </p>
        </Section>

        <Section title="16. Contact">
          <p style={textStyle}>
            Support: <a href="mailto:support@agenticaf.io">support@agenticaf.io</a>
            <br />
            Legal: <a href="mailto:legal@wrangleai.com">legal@wrangleai.com</a>
            <br />
            Privacy: <a href="mailto:privacy@wrangleai.com">privacy@wrangleai.com</a>
            <br />
            WrangleAI Ltd, 11a Abbey Road, Malvern, England, WR14 3ES
          </p>
          <p style={{ ...textStyle, marginTop: '1.5rem' }}>
            Related: <Link to="/privacy">Privacy Policy</Link>
          </p>
        </Section>
      </main>
    </Layout>
  );
}
