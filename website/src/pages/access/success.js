import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

/**
 * Checkout success — shows API key once via /api/access/reveal.
 */
export default function AccessSuccess() {
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const token = params.get('token');
    if (!sessionId && !token) {
      setError('Missing checkout session. If you just paid, open the link from your confirmation email or use Manage access.');
      setLoading(false);
      return;
    }
    const q = token
      ? `token=${encodeURIComponent(token)}`
      : `session_id=${encodeURIComponent(sessionId)}`;
    fetch(`/api/access/reveal?${q}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Could not reveal key');
        setApiKey(data.apiKey);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="MCP Access" description="Your AAF MCP API key">
      <main style={{ padding: '2rem 1rem', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>MCP Access</h1>
        <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
          £3/month · 1,000 MCP requests · hard cap
        </p>

        {loading && <p>Loading your API key…</p>}

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
            <p style={{ marginTop: '1rem' }}>
              <Link to="/tools">Back to Tools</Link>
              {' · '}
              <Link to="/manage-access">Manage access</Link>
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
}
