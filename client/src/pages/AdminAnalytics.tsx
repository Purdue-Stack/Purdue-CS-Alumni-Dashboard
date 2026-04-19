import { useEffect, useState } from 'react';
import {
  fetchAdminSummary,
  getAdminExportUrl,
  type AdminSummaryResponse
} from '../api/api';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);

  const loadSummary = async () => {
    const data = await fetchAdminSummary();
    setSummary(data);
  };

  useEffect(() => {
    loadSummary().catch((error) => {
      console.error('Failed to fetch admin summary:', error);
    });
  }, []);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1>Admin Analytics</h1>
        <p>Summary stats, recent activity, and exports.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {summary && [
          ['Alumni', summary.counts.alumni],
          ['Approved Mentors', summary.counts.mentors],
          ['Internships', summary.counts.internships],
          ['Pending Mentors', summary.counts.pendingMentors]
        ].map(([label, value]) => (
          <article key={label} style={{ border: '1px solid #C4BFC0', borderRadius: 12, padding: 20, background: '#fff' }}>
            <div style={{ fontSize: 14, textTransform: 'uppercase', color: '#666' }}>{label}</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{value}</div>
          </article>
        ))}
      </section>

      <section style={{ display: 'flex', gap: 12 }}>
        <a className="hero-data-button hero-data-button--border" href={getAdminExportUrl()}>
          EXPORT CSV
        </a>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ marginBottom: 0 }}>Recent Logs</h2>
        {summary?.recentLogs.map((log) => (
          <article key={log.id} style={{ border: '1px solid #C4BFC0', borderRadius: 12, padding: 16, background: '#fff' }}>
            <strong>{log.action}</strong>
            <div>{log.description}</div>
            <small>{new Date(log.timestamp).toLocaleString()}</small>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AdminAnalytics;
