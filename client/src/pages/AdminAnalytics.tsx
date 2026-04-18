import { useEffect, useState } from 'react';
import {
  approveMentorCandidate,
  denyMentorCandidate,
  fetchAdminSummary,
  getAdminExportUrl,
  type AdminSummaryResponse,
  type PendingMentorCandidate
} from '../api/api';

type MentorDraft = {
  email: string;
  linkedIn: string;
  mentorshipAreas: string;
  isDirectoryVisible: boolean;
};

const createDraft = (candidate: PendingMentorCandidate): MentorDraft => ({
  email: candidate.email ?? '',
  linkedIn: candidate.linkedin ?? '',
  mentorshipAreas: candidate.mentorship_areas.join(', '),
  isDirectoryVisible: true
});

const AdminAnalytics = () => {
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<number, MentorDraft>>({});

  const loadSummary = async () => {
    const data = await fetchAdminSummary();
    setSummary(data);
    setDrafts((current) => {
      const next = { ...current };
      data.pendingMentors.forEach((candidate) => {
        if (!next[candidate.alumni_id]) {
          next[candidate.alumni_id] = createDraft(candidate);
        }
      });
      return next;
    });
  };

  useEffect(() => {
    loadSummary().catch((error) => {
      console.error('Failed to fetch admin summary:', error);
    });
  }, []);

  const updateDraft = (id: number, patch: Partial<MentorDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? {
          email: '',
          linkedIn: '',
          mentorshipAreas: '',
          isDirectoryVisible: true
        }),
        ...patch
      }
    }));
  };

  const handleApprove = async (candidate: PendingMentorCandidate) => {
    const draft = drafts[candidate.alumni_id] ?? createDraft(candidate);
    await approveMentorCandidate(candidate.alumni_id, {
      email: draft.email || null,
      linkedIn: draft.linkedIn || null,
      mentorshipAreas: draft.mentorshipAreas.split(',').map((item) => item.trim()).filter(Boolean),
      isDirectoryVisible: draft.isDirectoryVisible
    });
    await loadSummary();
  };

  const handleDeny = async (id: number) => {
    await denyMentorCandidate(id);
    await loadSummary();
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1>Admin Analytics</h1>
        <p>Summary stats, recent activity, exports, and the primary mentor approval queue.</p>
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

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ marginBottom: 0 }}>Pending Mentor Approvals</h2>
        {summary?.pendingMentors.length ? summary.pendingMentors.map((candidate) => {
          const draft = drafts[candidate.alumni_id] ?? createDraft(candidate);
          return (
            <article key={candidate.alumni_id} style={{ border: '1px solid #C4BFC0', borderRadius: 12, padding: 20, background: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <strong>{candidate.first_name} {candidate.last_name}</strong>
                <div>{candidate.job_title || 'Role pending'}{candidate.employer ? ` at ${candidate.employer}` : ''}</div>
                <div>{candidate.city || 'Unknown city'}{candidate.state ? `, ${candidate.state}` : ''}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <input value={draft.email} placeholder="Email" onChange={(event) => updateDraft(candidate.alumni_id, { email: event.target.value })} />
                <input value={draft.linkedIn} placeholder="LinkedIn" onChange={(event) => updateDraft(candidate.alumni_id, { linkedIn: event.target.value })} />
                <input value={draft.mentorshipAreas} placeholder="Mentorship areas" onChange={(event) => updateDraft(candidate.alumni_id, { mentorshipAreas: event.target.value })} />
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draft.isDirectoryVisible}
                  onChange={(event) => updateDraft(candidate.alumni_id, { isDirectoryVisible: event.target.checked })}
                />
                Show in alumni directory too
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="hero-data-button hero-data-button--border" type="button" onClick={() => { handleApprove(candidate).catch((error) => console.error('Failed to approve mentor:', error)); }}>
                  APPROVE
                </button>
                <button className="hero-data-button hero-data-button--red-border" type="button" onClick={() => { handleDeny(candidate.alumni_id).catch((error) => console.error('Failed to deny mentor:', error)); }}>
                  DENY
                </button>
              </div>
            </article>
          );
        }) : (
          <p>No pending mentors right now.</p>
        )}
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
