import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function ManageAccess() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    setLoading(true);
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && data.authenticated) setMe(data);
        else setMe(null);
      })
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'expired') setError('That magic link expired. Request a new one.');
    if (params.get('error') === 'missing_token') setError('Missing sign-in token.');
    refresh();
  }, []);

  const requestLink = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const r = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');
      setMessage(data.message || 'Check your email for the magic link.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const rotate = async () => {
    if (!window.confirm('Rotate your API key? The old key will stop working immediately.')) return;
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/auth/rotate-key', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Rotate failed');
      window.location.href = data.revealUrl;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/me', { method: 'POST', credentials: 'include' });
    setMe(null);
  };

  return (
    <Layout title="Manage MCP Access" description="Manage your AAF MCP subscription and API key">
      <main style={{ padding: '2rem 1rem', maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Manage MCP Access</h1>
        <p style={{ color: 'var(--ifm-font-color-secondary)', marginBottom: '1.5rem' }}>
          £3/month · 1,000 MCP requests · hard cap
        </p>

        {loading && <p>Loading…</p>}

        {error && <p style={{ color: 'var(--ifm-color-danger)' }}>{error}</p>}
        {message && <p style={{ color: 'var(--ifm-color-success-darkest)' }}>{message}</p>}

        {!loading && !me && (
          <form onSubmit={requestLink}>
            <p style={{ lineHeight: 1.6 }}>
              Enter the email you used at checkout. We will send a one-time magic link
              (subject: <strong>AAF MAGIC LINK FOR SIGN IN</strong>).
            </p>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.35rem' }}>Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', maxWidth: 360, padding: '0.5rem', marginBottom: '0.75rem' }}
            />
            <div>
              <button type="submit" className="button button--primary" disabled={busy}>
                {busy ? 'Sending…' : 'Email magic link'}
              </button>
            </div>
            <p style={{ marginTop: '1rem' }}>
              Need access? <a href="/api/stripe/checkout">Get MCP Access</a>
              {' · '}
              <Link to="/tools">Tools</Link>
            </p>
          </form>
        )}

        {!loading && me && (
          <div>
            <p><strong>Signed in as</strong> {me.email}</p>
            <p>
              Status: <code>{me.status}</code>
            </p>
            <p>
              Usage: <strong>{me.callsUsed}</strong> / {me.includedCalls}
            </p>
            {me.periodEnd && <p>Period end: {me.periodEnd}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="button button--primary" onClick={rotate} disabled={busy}>
                Rotate API key
              </button>
              {me.portalUrl && (
                <a href={me.portalUrl} className="button button--secondary" style={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                  Stripe billing portal
                </a>
              )}
              <button type="button" className="button button--secondary" onClick={signOut}>
                Sign out
              </button>
            </div>
            <p style={{ marginTop: '1.25rem' }}>
              <Link to="/tools">Back to Tools</Link>
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
}
