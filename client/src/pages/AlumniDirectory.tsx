import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchPublicAlumni,
  fetchPublicAlumniFilterOptions,
  type AlumniDirectoryFilterOptionsResponse,
  type AlumniDirectoryRow
} from '../api/api';

type AlumniTab = 'Job' | 'Graduate School' | 'Internship';
type AlumniSortKey =
  | 'last_name'
  | 'graduation_year'
  | 'employer'
  | 'job_title'
  | 'degree_level'
  | 'university';
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
const pageSize = 50;
const defaultFilterOptions: AlumniDirectoryFilterOptionsResponse = {
  graduationYears: [],
  majors: [],
  companies: [],
  jobTitles: [],
  states: [],
  degreeSeeking: [],
  universities: []
};

function parseTab(value: string | null): AlumniTab {
  if (value === 'Job' || value === 'Graduate School' || value === 'Internship') {
    return value;
  }
  return 'Job';
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

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const AlumniDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<AlumniTab>(() => parseTab(searchParams.get('tab')));
  const [rows, setRows] = useState<AlumniDirectoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filterOptions, setFilterOptions] = useState<AlumniDirectoryFilterOptionsResponse>(defaultFilterOptions);
  const [search, setSearch] = useState('');
  const [graduationYears, setGraduationYears] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [degreeSeeking, setDegreeSeeking] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<AlumniSortKey>('graduation_year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const nextTab = parseTab(searchParams.get('tab'));
    setTab((current) => current === nextTab ? current : nextTab);
  }, [searchParams]);

  useEffect(() => {
    const currentParam = searchParams.get('tab');
    if (currentParam === tab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams, { replace: true });
  }, [tab, searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    fetchPublicAlumniFilterOptions({ outcomeTypes: [tab] })
      .then((data) => {
        if (!active) return;
        setFilterOptions(data);
        setGraduationYears((current) => current.filter((value) => data.graduationYears.includes(value)));
        setMajors((current) => current.filter((value) => data.majors.includes(value)));
        setCompanies((current) => current.filter((value) => data.companies.includes(value)));
        setJobTitles((current) => current.filter((value) => data.jobTitles.includes(value)));
        setStates((current) => current.filter((value) => data.states.includes(value)));
        setDegreeSeeking((current) => current.filter((value) => data.degreeSeeking.includes(value)));
        setUniversities((current) => current.filter((value) => data.universities.includes(value)));
      })
      .catch((error) => {
        console.error('Failed to fetch alumni filter options:', error);
      });

    return () => {
      active = false;
    };
  }, [tab]);

  useEffect(() => {
    setPage(0);
  }, [tab, search, graduationYears, majors, companies, jobTitles, states, degreeSeeking, universities, sortKey, sortDirection]);

  useEffect(() => {
    let active = true;
    fetchPublicAlumni({
      outcomeTypes: [tab],
      graduationYears,
      majors,
      companies,
      jobTitles,
      states,
      degreeSeeking,
      universities,
      search,
      sortKey,
      sortDir: sortDirection,
      page,
      pageSize
    })
      .then((data) => {
        if (active) {
          setRows(data.rows);
          setTotal(data.total);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch alumni directory:', error);
      });

    return () => {
      active = false;
    };
  }, [tab, graduationYears, majors, companies, jobTitles, states, degreeSeeking, universities, search, sortKey, sortDirection, page]);

  useEffect(() => {
    setSearch('');
    setGraduationYears([]);
    setMajors([]);
    setCompanies([]);
    setJobTitles([]);
    setStates([]);
    setDegreeSeeking([]);
    setUniversities([]);
    setSortKey('graduation_year');
    setSortDirection('desc');
    setPage(0);
  }, [tab]);

  const activeCount = total;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstResult = total ? page * pageSize + 1 : 0;
  const lastResult = Math.min(total, page * pageSize + rows.length);

  const visibleSortOptions: Array<{ value: AlumniSortKey; label: string }> = tab === 'Graduate School'
    ? [
        { value: 'graduation_year', label: 'Graduation Year' },
        { value: 'last_name', label: 'Last Name' },
        { value: 'university', label: 'University' },
        { value: 'degree_level', label: 'Degree Level' }
      ]
    : [
        { value: 'graduation_year', label: 'Graduation Year' },
        { value: 'last_name', label: 'Last Name' },
        { value: 'employer', label: 'Company' },
        { value: 'job_title', label: 'Job Title' },
        { value: 'degree_level', label: 'Degree Level' }
      ];

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, background: offWhite }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'inline-flex', borderRadius: 16, padding: 6, background: softGold, width: 'fit-content' }}>
          {(['Job', 'Graduate School', 'Internship'] as AlumniTab[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: 12,
                background: tab === option ? deepGold : 'transparent',
                color: tab === option ? '#fff' : '#2D2926',
                cursor: 'pointer',
                fontWeight: 800,
                letterSpacing: 0.2
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div>
          <h1 style={{ marginBottom: 8 }}>Alumni Directory</h1>
          <p style={{ margin: 0, color: '#534B45' }}>
            Browse {tab === 'Graduate School' ? 'graduate-school' : tab === 'Internship' ? 'internship' : 'job-placement'} outcomes. Mentorship, salary, LinkedIn, and email are excluded from this directory.
          </p>
        </div>
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
            <span style={{ fontWeight: 800, color: '#2D2926' }}>Search Directory</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tab === 'Graduate School' ? 'Search by name, expected field, university, degree, city, or state' : 'Search by name, company, title, city, or state'}
              style={{
                padding: 14,
                border: `1px solid ${warmBorder}`,
                borderRadius: 14,
                background: '#fff'
              }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontWeight: 800, color: '#2D2926' }}>Sort</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as AlumniSortKey)}
                  style={{ padding: '12px 14px', border: `1px solid ${warmBorder}`, borderRadius: 12, background: '#fff' }}
                >
                  {visibleSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
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
              {activeCount} results
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SearchableCheckboxDropdown
            label="Graduation Year"
            options={filterOptions.graduationYears}
            selected={graduationYears}
            onToggle={(value) => setGraduationYears((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          <SearchableCheckboxDropdown
            label="State"
            options={filterOptions.states}
            selected={states}
            onToggle={(value) => setStates((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          {(tab === 'Job' || tab === 'Internship') && (
            <>
              <SearchableCheckboxDropdown
                label="Company"
                options={filterOptions.companies}
                selected={companies}
                onToggle={(value) => setCompanies((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="Job Title"
                options={filterOptions.jobTitles}
                selected={jobTitles}
                onToggle={(value) => setJobTitles((current) => toggleValue(current, value))}
                accent={deepGold}
              />
            </>
          )}
          {tab === 'Graduate School' && (
            <>
              <SearchableCheckboxDropdown
                label="Expected Field of Study"
                options={filterOptions.majors}
                selected={majors}
                onToggle={(value) => setMajors((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="Degree Seeking"
                options={filterOptions.degreeSeeking}
                selected={degreeSeeking}
                onToggle={(value) => setDegreeSeeking((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="University"
                options={filterOptions.universities}
                selected={universities}
                onToggle={(value) => setUniversities((current) => toggleValue(current, value))}
                accent={deepGold}
              />
            </>
          )}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1680 }}>
            <thead>
              <tr style={{ background: '#F5EEDC', textAlign: 'left' }}>
                <th style={{ padding: 14 }}>First Name</th>
                <th style={{ padding: 14 }}>Last Name</th>
                <th style={{ padding: 14 }}>Graduation Year</th>
                <th style={{ padding: 14 }}>Graduation Term</th>
                {(tab === 'Job' || tab === 'Internship') && <th style={{ padding: 14 }}>Employer</th>}
                {(tab === 'Job' || tab === 'Internship') && <th style={{ padding: 14 }}>Job Title</th>}
                {tab === 'Graduate School' && <th style={{ padding: 14 }}>Expected Field of Study</th>}
                {tab === 'Graduate School' && <th style={{ padding: 14 }}>Degree Seeking</th>}
                {tab === 'Graduate School' && <th style={{ padding: 14 }}>University</th>}
                <th style={{ padding: 14 }}>City</th>
                <th style={{ padding: 14 }}>State</th>
                <th style={{ padding: 14 }}>Degree Level</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.alumni_id} style={{ borderTop: '1px solid #EEE5D8', verticalAlign: 'top', background: index % 2 === 0 ? '#fff' : '#FFFCF7' }}>
                  <td style={{ padding: 14 }}>{row.first_name}</td>
                  <td style={{ padding: 14 }}>{row.last_name}</td>
                  <td style={{ padding: 14 }}>{row.graduation_year}</td>
                  <td style={{ padding: 14 }}>{row.graduation_term || 'N/A'}</td>
                  {(tab === 'Job' || tab === 'Internship') && <td style={{ padding: 14 }}>{row.employer || 'N/A'}</td>}
                  {(tab === 'Job' || tab === 'Internship') && <td style={{ padding: 14 }}>{row.job_title || 'N/A'}</td>}
                  {tab === 'Graduate School' && <td style={{ padding: 14 }}>{row.expected_field_of_study || 'N/A'}</td>}
                  {tab === 'Graduate School' && <td style={{ padding: 14 }}>{row.degree_seeking || 'N/A'}</td>}
                  {tab === 'Graduate School' && <td style={{ padding: 14 }}>{row.university || 'N/A'}</td>}
                  <td style={{ padding: 14 }}>{row.city || 'N/A'}</td>
                  <td style={{ padding: 14 }}>{row.state || 'N/A'}</td>
                  <td style={{ padding: 14 }}>{row.degree_level || 'N/A'}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={10} style={{ padding: 24, textAlign: 'center' }}>No alumni match the current {tab.toLowerCase()} filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '14px 18px',
            borderTop: '1px solid #EEE5D8',
            background: '#FFFCF7',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ color: '#534B45', fontWeight: 700 }}>
            Showing {firstResult}-{lastResult} of {total}
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: `1px solid ${warmBorder}`,
                background: page === 0 ? '#F4EFE7' : '#fff',
                color: page === 0 ? '#8A8178' : deepGold,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 800
              }}
            >
              Previous
            </button>
            <span style={{ color: '#2D2926', fontWeight: 800 }}>
              Page {page + 1} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: `1px solid ${warmBorder}`,
                background: page + 1 >= pageCount ? '#F4EFE7' : '#fff',
                color: page + 1 >= pageCount ? '#8A8178' : deepGold,
                cursor: page + 1 >= pageCount ? 'not-allowed' : 'pointer',
                fontWeight: 800
              }}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlumniDirectory;
