import { useEffect, useState } from 'react';
import {
  approveMentorCandidate,
  denyMentorCandidate,
  fetchPendingMentorApprovals,
  type PendingMentorCandidate
} from '../api/api';

type MentorDraft = {
  email: string;
  linkedIn: string;
  mentorshipAreas: string;
  isDirectoryVisible: boolean;
};

type PendingAction = {
  id: number;
  type: 'approve' | 'deny';
};

const createDraft = (candidate: PendingMentorCandidate): MentorDraft => ({
  email: candidate.email ?? '',
  linkedIn: candidate.linkedin ?? '',
  mentorshipAreas: candidate.mentorship_areas.join(', '),
  isDirectoryVisible: true
});

const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const offWhite = '#FFFCF7';

const fieldInputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${warmBorder}`,
  borderRadius: 12,
  background: '#fff',
  boxSizing: 'border-box' as const,
  font: 'inherit',
  color: '#2D2926'
};

const AdminMentorApprovals = () => {
  const [candidates, setCandidates] = useState<PendingMentorCandidate[]>([]);
  const [drafts, setDrafts] = useState<Record<number, MentorDraft>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCandidates = async () => {
    setIsLoading(true);
    setLoadError(null);
    const data = await fetchPendingMentorApprovals();
    setCandidates(data);
    setDrafts((current) => {
      const next = { ...current };
      data.forEach((candidate) => {
        if (!next[candidate.alumni_id]) {
          next[candidate.alumni_id] = createDraft(candidate);
        }
      });
      return next;
    });
    setIsLoading(false);
  };

  useEffect(() => {
    loadCandidates().catch((error) => {
      console.error('Failed to fetch mentor approvals:', error);
      setLoadError('Failed to load pending mentor approvals.');
      setIsLoading(false);
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
    setPendingAction({ id: candidate.alumni_id, type: 'approve' });
    try {
      await approveMentorCandidate(candidate.alumni_id, {
        email: draft.email || null,
        linkedIn: draft.linkedIn || null,
        mentorshipAreas: draft.mentorshipAreas.split(',').map((item) => item.trim()).filter(Boolean),
        isDirectoryVisible: draft.isDirectoryVisible
      });
      await loadCandidates();
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeny = async (id: number) => {
    setPendingAction({ id, type: 'deny' });
    try {
      await denyMentorCandidate(id);
      await loadCandidates();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20, background: offWhite, minHeight: '100%', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <header>
        <h1 style={{ marginBottom: 8 }}>Mentor Approvals</h1>
        <p style={{ margin: 0, color: '#534B45', maxWidth: 760, lineHeight: 1.5 }}>
          Review pending mentor candidates, fill in public-facing details, and decide whether each profile should be approved for the mentor directory.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>Pending Mentor Approvals</h2>
            <p style={{ margin: '6px 0 0', color: '#6B625B' }}>
              {candidates.length} candidate{candidates.length === 1 ? '' : 's'} waiting for review
            </p>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            height: 'min(70vh, 900px)',
            minHeight: 420,
            overflowY: 'auto',
            padding: 16,
            border: `1px solid ${warmBorder}`,
            borderRadius: 18,
            background: '#F7F3EA',
            scrollbarGutter: 'stable',
            boxSizing: 'border-box'
          }}
        >
          {isLoading ? (
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                border: `1px dashed ${warmBorder}`,
                borderRadius: 18,
                padding: 28,
                textAlign: 'center',
                color: '#6B625B',
                background: '#FFFDFC'
              }}
            >
              Loading mentor approvals...
            </div>
          ) : loadError ? (
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                border: `1px dashed #D38D8D`,
                borderRadius: 18,
                padding: 28,
                textAlign: 'center',
                color: '#8A3D3D',
                background: '#FFF7F7'
              }}
            >
              {loadError}
            </div>
          ) : candidates.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              {candidates.map((candidate) => {
            const draft = drafts[candidate.alumni_id] ?? createDraft(candidate);
            const isPending = pendingAction?.id === candidate.alumni_id;
            const isApproving = pendingAction?.id === candidate.alumni_id && pendingAction.type === 'approve';
            const isDenying = pendingAction?.id === candidate.alumni_id && pendingAction.type === 'deny';

            return (
              <article
                key={candidate.alumni_id}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  border: `1px solid ${warmBorder}`,
                  borderRadius: 16,
                  background: '#fff',
                  padding: 18,
                  boxShadow: '0 2px 10px rgba(45, 41, 38, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    paddingBottom: 14,
                    borderBottom: `1px solid #EEE5D8`,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <strong style={{ fontSize: 20, color: '#2D2926' }}>
                      {candidate.first_name} {candidate.last_name}
                    </strong>
                    <div style={{ color: '#534B45' }}>
                      {candidate.job_title || 'Role pending'}{candidate.employer ? ` at ${candidate.employer}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: softGold, color: '#2D2926', fontWeight: 700 }}>
                      Class of {candidate.graduation_year}
                    </span>
                    <span style={{ padding: '6px 10px', borderRadius: 999, background: '#F8F8F8', color: '#534B45', fontWeight: 700 }}>
                      {candidate.city || 'Unknown city'}{candidate.state ? `, ${candidate.state}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#2D2926', fontWeight: 700 }}>
                      Email
                      <input
                        value={draft.email}
                        placeholder="mentor@example.com"
                        onChange={(event) => updateDraft(candidate.alumni_id, { email: event.target.value })}
                        style={fieldInputStyle}
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#2D2926', fontWeight: 700 }}>
                      LinkedIn
                      <input
                        value={draft.linkedIn}
                        placeholder="https://linkedin.com/in/..."
                        onChange={(event) => updateDraft(candidate.alumni_id, { linkedIn: event.target.value })}
                        style={fieldInputStyle}
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#2D2926', fontWeight: 700, gridColumn: '1 / -1' }}>
                      Mentorship Areas
                      <input
                        value={draft.mentorshipAreas}
                        placeholder="Career Chats, Mock Interviews, Resume Reviews"
                        onChange={(event) => updateDraft(candidate.alumni_id, { mentorshipAreas: event.target.value })}
                        style={fieldInputStyle}
                      />
                    </label>
                  </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap'
                  }}
                >
                    <label
                      style={{
                        display: 'inline-flex',
                        gap: 10,
                        alignItems: 'center',
                        color: '#534B45',
                        fontWeight: 600
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={draft.isDirectoryVisible}
                        onChange={(event) => updateDraft(candidate.alumni_id, { isDirectoryVisible: event.target.checked })}
                        style={{ accentColor: deepGold }}
                      />
                        Show in alumni directory too
                      </label>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
                      <button
                        className="hero-data-button hero-data-button--border"
                        type="button"
                        disabled={isPending}
                        style={isPending ? { opacity: 0.7, cursor: 'wait' } : undefined}
                        onClick={() => { handleApprove(candidate).catch((error) => console.error('Failed to approve mentor:', error)); }}
                      >
                        {isApproving ? 'PROCESSING...' : 'APPROVE'}
                      </button>
                      <button
                        className="hero-data-button hero-data-button--red-border"
                        type="button"
                        disabled={isPending}
                        style={isPending ? { opacity: 0.7, cursor: 'wait' } : undefined}
                        onClick={() => { handleDeny(candidate.alumni_id).catch((error) => console.error('Failed to deny mentor:', error)); }}
                      >
                        {isDenying ? 'PROCESSING...' : 'DENY'}
                      </button>
                    </div>
                </div>
              </article>
            );
              })}
            </div>
          ) : (
            <div
              style={{
                border: `1px dashed ${warmBorder}`,
                borderRadius: 18,
                padding: 28,
                textAlign: 'center',
                color: '#6B625B',
                background: '#FFFDFC'
              }}
            >
              No pending mentors right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminMentorApprovals;
