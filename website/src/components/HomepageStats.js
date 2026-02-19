import React, { useEffect, useState } from 'react';

const PILLAR_LABELS = {
  security: 'Security',
  reliability: 'Reliability',
  cost: 'Cost',
  'operational-excellence': 'Operations',
  performance: 'Performance',
  sustainability: 'Sustainability',
  'context-optimization': 'Context',
  'autonomy-governance': 'Autonomy',
};

const PILLAR_ORDER = [
  'security',
  'reliability',
  'cost',
  'operational-excellence',
  'performance',
  'sustainability',
  'context-optimization',
  'autonomy-governance',
];

function StatCard({ title, children }) {
  return (
    <div
      style={{
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: '8px',
        padding: '1rem 1.25rem',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--ifm-font-color-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function useStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = origin ? `${origin}/api/stats` : '/api/stats';
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Not ok'))))
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  return { data, loading, error };
}

export default function HomepageStats() {
  const { data, loading, error } = useStats();

  if (loading) {
    return (
      <section style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Community & usage</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} title="—">
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>—</div>
            </StatCard>
          ))}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--ifm-font-color-secondary)', marginTop: '0.75rem' }}>Loading stats…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Community & usage</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)' }}>
          Stats are temporarily unavailable. See the{' '}
          <a href="https://github.com/AgenticAF-Community/FrameworkCore">GitHub repo</a> for community activity.
        </p>
      </section>
    );
  }

  const { github, mcpToolCalls, postureReports, posturePillarAverages } = data;
  const hasPillarAverages = PILLAR_ORDER.some((id) => (posturePillarAverages && posturePillarAverages[id]) > 0);

  return (
    <section style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Community & usage</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--ifm-font-color-secondary)', marginBottom: '1rem', maxWidth: '560px' }}>
        Key figures from the framework repo and opt‑in usage. MCP and posture numbers update when telemetry is enabled.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <StatCard title="GitHub stars">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{github?.stars ?? '—'}</div>
          <a href="https://github.com/AgenticAF-Community/FrameworkCore" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem' }}>
            Repo
          </a>
        </StatCard>
        <StatCard title="Forks">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{github?.forks ?? '—'}</div>
        </StatCard>
        <StatCard title="Open issues">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{github?.openIssues ?? '—'}</div>
        </StatCard>
        <StatCard title="MCP tool calls">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{mcpToolCalls ?? '—'}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)' }}>hosted MCP</span>
        </StatCard>
        <StatCard title="Posture reports">
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{postureReports ?? '—'}</div>
          <span style={{ fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)' }}>opt‑in</span>
        </StatCard>
      </div>

      {hasPillarAverages && posturePillarAverages && (
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Average posture scores by pillar (opt‑in)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {PILLAR_ORDER.map((id) => {
              const avg = posturePillarAverages[id];
              const label = PILLAR_LABELS[id] || id;
              if (avg == null) return null;
              return (
                <span
                  key={id}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    background: 'var(--ifm-color-emphasis-100)',
                    color: 'var(--ifm-font-color-base)',
                  }}
                  title={`${label}: ${avg}% average`}
                >
                  {label} <strong>{avg}%</strong>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
