import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

/**
 * Checkout success — shows API key once via /api/access/reveal.
 * Polls briefly so a slow Stripe webhook does not strand the user.
 */
export default function AccessSuccess() {
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const token = params.get('token');
    if (!sessionId && !token) {
      setError('Missing checkout session. If you just paid, open Manage access to rotate a new key.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const q = token
      ? `token=${encodeURIComponent(token)}`
      : `session_id=${encodeURIComponent(sessionId)}`;

    const attempt = async (triesLeft) => {
      try {
        const r = await fetch(`/api/access/reveal?${q}`);
        const data = await r.json();
        if (cancelled) return;
        if (r.ok && data.apiKey) {
          setApiKey(data.apiKey);
          setLoading(false);
          return;
        }
        if (r.status === 409 || data.reused) {
          setError(data.error || 'Key was already issued. Use Manage access to rotate.');
          setLoading(false);
          return;
        }
        if (triesLeft > 0 && (r.status === 410 || r.status === 400 || r.status === 404)) {
          setTimeout(() => attempt(triesLeft - 1), 1500);
          return;
        }
        throw new Error(data.error || 'Could not reveal key');
      } catch (e) {
        if (cancelled) return;
        if (triesLeft > 0) {
          setTimeout(() => attempt(triesLeft - 1), 1500);
          return;
        }
        setError(e.message);
        setLoading(false);
      }
    };

    attempt(sessionId ? 5 : 0);
    return () => {
      cancelled = true;
    };
  }, []);

  const copyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Layout title="MCP Access" description="Your AAF MCP API key">
      <main style={{ padding: '2rem 1rem', maxWidth: '720px', margin: '0 auto', color: 'var(--ifm-font-color-base)' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--ifm-heading-color)' }}>MCP Access</h1>
        <p style={{ lineHeight: 1.6, marginBottom: '1rem', color: 'var(--ifm-font-color-secondary)' }}>
          £3/month · 1,000 MCP tool calls · hard cap (initialize / tools/list do not count)
        </p>

        {loading && <p>Preparing your API key…</p>}

        {error && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--ifm-color-danger)' }}>{error}</p>
            <p>
              <Link to="/manage-access">Manage access</Link>
              {' · '}
              <Link to="/tools">Tools docs</Link>
            </p>
          </div>
        )}

        {apiKey && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600 }}>
              Copy this key now. It will not be shown again. Use Manage access to rotate later.
            </p>
            <pre
              style={{
                padding: '1rem',
                overflow: 'auto',
                background: 'var(--ifm-pre-background)',
                borderRadius: 4,
                fontSize: '0.85rem',
              }}
            >
              {apiKey}
            </pre>
            <button type="button" className="button button--primary" onClick={copyKey} style={{ marginBottom: '1rem' }}>
              {copied ? 'Copied' : 'Copy API key'}
            </button>
            <h2 style={{ fontSize: '1.15rem', marginTop: '1.5rem' }}>Cursor (HTTP)</h2>
            <pre style={{ padding: '1rem', overflow: 'auto', background: 'var(--ifm-pre-background)', borderRadius: 4, fontSize: '0.8rem' }}>
{`{
  "mcpServers": {
    "aaf": {
      "url": "https://www.agenticaf.io/api/mcp",
      "headers": {
        "Authorization": "Bearer ${apiKey}"
      }
    }
  }
}`}
            </pre>
            <h2 style={{ fontSize: '1.15rem', marginTop: '1.25rem' }}>mcp-remote (stdio clients)</h2>
            <pre style={{ padding: '1rem', overflow: 'auto', background: 'var(--ifm-pre-background)', borderRadius: 4, fontSize: '0.8rem' }}>
{`{
  "mcpServers": {
    "aaf": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.agenticaf.io/api/mcp",
        "--transport",
        "http-first",
        "--header",
        "Authorization:\${AAF_MCP_AUTHORIZATION}"
      ],
      "env": {
        "AAF_MCP_AUTHORIZATION": "Bearer ${apiKey}"
      }
    }
  }
}`}
            </pre>
            <h2 style={{ fontSize: '1.15rem', marginTop: '1.5rem' }}>Make agents default to AAF</h2>
            <p style={{ lineHeight: 1.6, color: 'var(--ifm-font-color-secondary)' }}>
              Save as <code>.cursor/rules/aaf-mcp.mdc</code> in your project so architecture decisions use AAF MCP first:
            </p>
            <pre style={{ padding: '1rem', overflow: 'auto', background: 'var(--ifm-pre-background)', borderRadius: 4, fontSize: '0.75rem' }}>
{`---
description: Use AAF MCP for agentic architecture decisions
alwaysApply: true
---

# AAF MCP — architecture authority

When designing, reviewing, or changing agentic architecture:
1. Use AAF MCP tools before inventing guidance.
2. If unsure: call aaf_guide.
3. New systems: aaf_list_workloads → aaf_workload_guidance → design → trade-offs → ACC.
4. For codebase review: run node tools/aaf-posture/cli.js . --format json --output ./aaf-posture.json then aaf_posture_interpret (hosted MCP cannot scan disk).
5. Prefer Common Agentic Workloads; ground with aaf_get_doc.
`}
            </pre>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/tools">Back to Tools</Link>
              {' · '}
              <Link to="/manage-access">Manage access</Link>
              {' · '}
              <Link to="/terms">Terms</Link>
              {' · '}
              <Link to="/privacy">Privacy</Link>
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
}
