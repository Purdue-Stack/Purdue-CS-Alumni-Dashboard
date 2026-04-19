import { useEffect, useState } from 'react';
import {
  fetchAdminSummary,
  getAdminExportUrl,
  type AdminSummaryResponse
} from '../api/api';

const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const offWhite = '#FFFCF7';

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

  const summaryCards = summary
    ? [
        ['Alumni Records', summary.counts.alumni],
        ['Approved Mentors', summary.counts.mentors],
        ['Internship Rows', summary.counts.internships],
        ['Pending Approvals', summary.counts.pendingMentors]
      ]
    : [];

  return (
    <div
      style={{
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: offWhite,
        minHeight: '100%'
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34, color: '#2D2926' }}>Admin Analytics</h1>
          <p style={{ margin: '8px 0 0', color: '#534B45', maxWidth: 760, lineHeight: 1.5 }}>
            Review core system totals, monitor recent platform activity, and export the current alumni dataset.
          </p>
        </div>
        <a
          className="hero-data-button hero-data-button--border"
          href={getAdminExportUrl()}
          style={{ margin: 0, textDecoration: 'none' }}
        >
          EXPORT CSV
        </a>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16
        }}
      >
        {summaryCards.map(([label, value], index) => (
          <article
            key={String(label)}
            style={{
              border: `1px solid ${warmBorder}`,
              borderRadius: 18,
              padding: 20,
              background: '#fff',
              boxShadow: '0 2px 10px rgba(45, 41, 38, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                width: 'fit-content',
                padding: '6px 10px',
                borderRadius: 999,
                background: index % 2 === 0 ? softGold : '#F5F3EF',
                color: '#534B45',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: 'uppercase'
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, color: deepGold, lineHeight: 1 }}>
              {value}
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          border: `1px solid ${warmBorder}`,
          borderRadius: 18,
          background: '#F7F3EA',
          padding: 18
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#2D2926' }}>Recent Logs</h2>
          <p style={{ margin: '6px 0 0', color: '#6B625B' }}>
            Latest upload, edit, and export activity across the admin workspace.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {summary?.recentLogs.length ? (
            summary.recentLogs.map((log) => (
              <article
                key={log.id}
                style={{
                  border: `1px solid ${warmBorder}`,
                  borderRadius: 16,
                  padding: 16,
                  background: '#fff',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(120px, 160px) 1fr',
                  gap: 12,
                  alignItems: 'start'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    width: 'fit-content',
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: softGold,
                    color: '#2D2926',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase'
                  }}
                >
                  {log.action}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ color: '#2D2926', lineHeight: 1.45 }}>{log.description}</div>
                  <small style={{ color: '#6B625B' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </small>
                </div>
              </article>
            ))
          ) : (
            <div
              style={{
                border: `1px dashed ${warmBorder}`,
                borderRadius: 16,
                padding: 24,
                background: '#FFFDFC',
                color: '#6B625B',
                textAlign: 'center'
              }}
            >
              No recent admin logs available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
