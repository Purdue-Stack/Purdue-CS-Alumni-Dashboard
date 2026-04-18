import { useEffect, useRef, useState } from 'react';
import { fetchMentors, type MentorRow } from '../api/api';

type MentorSortKey = 'last_name' | 'role' | 'track' | 'location_state';
type SortDirection = 'asc' | 'desc';

type DropdownProps = {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  accent: string;
};

const gold = '#CFB991';
const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const offWhite = '#FFFCF7';

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function SearchableCheckboxDropdown({ label, options, selected, onToggle, accent }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setShowAll(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const matchingOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));
  const visibleOptions = query || showAll ? matchingOptions : matchingOptions.slice(0, 3);
  const summary = selected.length ? `${selected.length} selected` : 'All';

  return (
    <div ref={containerRef} style={{ position: 'relative', minWidth: 220 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontWeight: 700, color: '#2D2926' }}>{label}</span>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            border: `1px solid ${isOpen ? accent : warmBorder}`,
            borderRadius: 12,
            background: '#fff',
            cursor: 'pointer',
            boxShadow: isOpen ? `0 0 0 3px ${softGold}` : 'none'
          }}
        >
          <span>{summary}</span>
          <span style={{ color: accent, fontWeight: 700 }}>{isOpen ? '−' : '+'}</span>
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '100%',
            minWidth: 240,
            border: `1px solid ${warmBorder}`,
            borderRadius: 14,
            background: '#fff',
            padding: 14,
            zIndex: 20,
            boxShadow: '0 16px 40px rgba(45, 41, 38, 0.14)'
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            style={{ width: '100%', padding: 10, border: `1px solid ${warmBorder}`, borderRadius: 10, marginBottom: 12 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
            {visibleOptions.map((option) => (
              <label key={option} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                  style={{ accentColor: accent }}
                />
                {option}
              </label>
            ))}
            {!visibleOptions.length && <div style={{ color: '#666' }}>No matching options.</div>}
          </div>
          {!query && matchingOptions.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              style={{ marginTop: 12, border: 'none', background: 'transparent', color: accent, cursor: 'pointer', fontWeight: 700, padding: 0 }}
            >
              {showAll ? 'Show less' : `Show all ${matchingOptions.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function buildRole(mentor: MentorRow) {
  if (mentor.outcome_type === 'Graduate School') {
    const parts = [mentor.degree_seeking, mentor.expected_field_of_study ? `in ${mentor.expected_field_of_study}` : null, mentor.university ? `at ${mentor.university}` : null].filter(Boolean);
    return parts.join(' ');
  }

  const parts = [mentor.job_title, mentor.employer ? `at ${mentor.employer}` : null].filter(Boolean);
  return parts.join(' ');
}

function sortRows(rows: Array<MentorRow & { role_label: string }>, sortKey: MentorSortKey, sortDirection: SortDirection) {
  const direction = sortDirection === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue =
      sortKey === 'last_name'
        ? left.last_name
        : sortKey === 'role'
          ? left.role_label
          : sortKey === 'track'
            ? left.track ?? ''
            : left.location_state ?? '';
    const rightValue =
      sortKey === 'last_name'
        ? right.last_name
        : sortKey === 'role'
          ? right.role_label
          : sortKey === 'track'
            ? right.track ?? ''
            : right.location_state ?? '';
    return leftValue.localeCompare(rightValue) * direction;
  });
}

const MentorExplorer = () => {
  const [rows, setRows] = useState<MentorRow[]>([]);
  const [search, setSearch] = useState('');
  const [tracks, setTracks] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<MentorSortKey>('last_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    let active = true;
    fetchMentors({
      page: 0,
      pageSize: 250
    })
      .then((data) => {
        if (active) {
          setRows(data.rows);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch mentors:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const enhancedRows = rows.map((mentor) => ({
    ...mentor,
    role_label: buildRole(mentor)
  }));

  const trackOptions = uniqueSorted(enhancedRows.map((row) => row.track));
  const roleOptions = uniqueSorted(enhancedRows.map((row) => row.role_label));
  const stateOptions = uniqueSorted(enhancedRows.map((row) => row.location_state));
  const areaOptions = uniqueSorted(enhancedRows.flatMap((row) => row.mentorship_areas));

  const filteredRows = enhancedRows.filter((mentor) => {
    const haystack = [
      mentor.first_name,
      mentor.last_name,
      mentor.role_label,
      mentor.track,
      mentor.location_city,
      mentor.location_state,
      mentor.email,
      mentor.linkedin,
      mentor.mentorship_areas.join(' ')
    ].join(' ').toLowerCase();

    if (search && !haystack.includes(search.toLowerCase())) return false;
    if (tracks.length && !tracks.includes(String(mentor.track ?? ''))) return false;
    if (roles.length && !roles.includes(mentor.role_label)) return false;
    if (states.length && !states.includes(String(mentor.location_state ?? ''))) return false;
    if (areas.length && !mentor.mentorship_areas.some((area) => areas.includes(area))) return false;
    return true;
  });

  const sortedRows = sortRows(filteredRows, sortKey, sortDirection);

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, background: offWhite }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ marginBottom: 0 }}>Mentor Explorer</h1>
        <p style={{ margin: 0, color: '#534B45' }}>
          Approved mentors only. Role is normalized across job and graduate-school outcomes, while contact details remain visible here.
        </p>
      </section>

      <section
        style={{
          border: `1px solid ${warmBorder}`,
          borderRadius: 20,
          padding: 24,
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,249,238,1) 100%)',
          boxShadow: '0 20px 40px rgba(45, 41, 38, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 320, flex: '1 1 320px' }}>
            <span style={{ fontWeight: 800, color: '#2D2926' }}>Search Mentors</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, role, track, state, mentorship area, or contact"
              style={{ padding: 14, border: `1px solid ${warmBorder}`, borderRadius: 14, background: '#fff' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontWeight: 800, color: '#2D2926' }}>Sort</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as MentorSortKey)}
                  style={{ padding: '12px 14px', border: `1px solid ${warmBorder}`, borderRadius: 12, background: '#fff' }}
                >
                  <option value="last_name">Last Name</option>
                  <option value="role">Role</option>
                  <option value="track">Track</option>
                  <option value="location_state">State</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: `1px solid ${gold}`,
                    background: sortDirection === 'asc' ? '#fff' : deepGold,
                    color: sortDirection === 'asc' ? deepGold : '#fff',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                background: softGold,
                color: '#2D2926',
                fontWeight: 800,
                minWidth: 120,
                textAlign: 'center'
              }}
            >
              {sortedRows.length} results
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SearchableCheckboxDropdown
            label="Track"
            options={trackOptions}
            selected={tracks}
            onToggle={(value) => setTracks((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          <SearchableCheckboxDropdown
            label="Role"
            options={roleOptions}
            selected={roles}
            onToggle={(value) => setRoles((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          <SearchableCheckboxDropdown
            label="State"
            options={stateOptions}
            selected={states}
            onToggle={(value) => setStates((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          <SearchableCheckboxDropdown
            label="Mentorship Areas"
            options={areaOptions}
            selected={areas}
            onToggle={(value) => setAreas((current) => toggleValue(current, value))}
            accent={deepGold}
          />
        </div>
      </section>

      <section
        style={{
          border: `1px solid ${warmBorder}`,
          borderRadius: 18,
          background: '#fff',
          overflow: 'hidden',
          boxShadow: '0 16px 34px rgba(45, 41, 38, 0.08)',
          maxHeight: 'calc(100vh - 330px)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 330px)', flex: 1, minHeight: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1240 }}>
            <thead>
              <tr style={{ background: '#F5EEDC', textAlign: 'left' }}>
                <th style={{ padding: 14 }}>First Name</th>
                <th style={{ padding: 14 }}>Last Name</th>
                <th style={{ padding: 14 }}>Role</th>
                <th style={{ padding: 14 }}>Track</th>
                <th style={{ padding: 14 }}>Location</th>
                <th style={{ padding: 14 }}>Mentorship Areas</th>
                <th style={{ padding: 14 }}>Email</th>
                <th style={{ padding: 14 }}>LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((mentor, index) => (
                <tr key={mentor.id} style={{ borderTop: '1px solid #EEE5D8', verticalAlign: 'top', background: index % 2 === 0 ? '#fff' : '#FFFCF7' }}>
                  <td style={{ padding: 14 }}>{mentor.first_name}</td>
                  <td style={{ padding: 14 }}>{mentor.last_name}</td>
                  <td style={{ padding: 14, fontWeight: 700 }}>{mentor.role_label || 'N/A'}</td>
                  <td style={{ padding: 14 }}>{mentor.track || 'N/A'}</td>
                  <td style={{ padding: 14 }}>{mentor.location_city || mentor.location_state ? `${mentor.location_city || 'Unknown city'}${mentor.location_state ? `, ${mentor.location_state}` : ''}` : 'N/A'}</td>
                  <td style={{ padding: 14 }}>{mentor.mentorship_areas.length ? mentor.mentorship_areas.join(', ') : 'N/A'}</td>
                  <td style={{ padding: 14 }}>{mentor.email ? <a href={`mailto:${mentor.email}`}>{mentor.email}</a> : 'N/A'}</td>
                  <td style={{ padding: 14 }}>{mentor.linkedin ? <a href={mentor.linkedin} target="_blank" rel="noreferrer">Profile</a> : 'N/A'}</td>
                </tr>
              ))}
              {!sortedRows.length && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>No mentors match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MentorExplorer;
