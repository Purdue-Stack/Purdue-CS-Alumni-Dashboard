import { useEffect, useMemo, useState } from 'react';
import { fetchAdminAlumni, updateAdminAlumni } from '../api/api';
import {
  canonicalizeCompany,
  canonicalizeJobTitle,
  canonicalizeUniversity
} from '../lib/canonicalization';

type AdminAlumniRow = {
  alumni_id: number;
  'First Name': string;
  'Last Name': string;
  'Graduation Year': number;
  'Graduation Term': string | null;
  'Outcome Type': string | null;
  Employer: string | null;
  'Job Title': string | null;
  'Expected Field of Study': string | null;
  'Degree Seeking': string | null;
  University: string | null;
  City: string | null;
  State: string | null;
  'Base Salary': number | null;
  'Student ID': number | null;
  'Degree Level': string | null;
  'Salary Pay Period': string | null;
  Email: string | null;
  LinkedIn: string | null;
};

type AlumniTab = 'Job' | 'Graduate School' | 'Internship';
type AdminSortKey = keyof AdminAlumniRow;
type SortDirection = 'asc' | 'desc';

type EditDraft = {
  firstName: string;
  lastName: string;
  graduationYear: string;
  graduationTerm: string;
  outcomeType: string;
  employer: string;
  jobTitle: string;
  expectedFieldOfStudy: string;
  degreeSeeking: string;
  university: string;
  city: string;
  state: string;
  baseSalary: string;
  studentId: string;
  degreeLevel: string;
  salaryPayPeriod: string;
  email: string;
  linkedIn: string;
};

type ColumnConfig = {
  key: keyof AdminAlumniRow;
  label: string;
  editKey: keyof EditDraft;
};

type FieldConfig = {
  key: keyof EditDraft;
  label: string;
  type?: 'text' | 'number' | 'select';
  options?: string[];
};

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

const columns: ColumnConfig[] = [
  { key: 'First Name', label: 'First Name', editKey: 'firstName' },
  { key: 'Last Name', label: 'Last Name', editKey: 'lastName' },
  { key: 'Graduation Year', label: 'Graduation Year', editKey: 'graduationYear' },
  { key: 'Graduation Term', label: 'Graduation Term', editKey: 'graduationTerm' },
  { key: 'Outcome Type', label: 'Outcome Type', editKey: 'outcomeType' },
  { key: 'Employer', label: 'Employer', editKey: 'employer' },
  { key: 'Job Title', label: 'Job Title', editKey: 'jobTitle' },
  { key: 'Expected Field of Study', label: 'Expected Field of Study', editKey: 'expectedFieldOfStudy' },
  { key: 'Degree Seeking', label: 'Degree Seeking', editKey: 'degreeSeeking' },
  { key: 'University', label: 'University', editKey: 'university' },
  { key: 'City', label: 'City', editKey: 'city' },
  { key: 'State', label: 'State', editKey: 'state' },
  { key: 'Base Salary', label: 'Base Salary', editKey: 'baseSalary' },
  { key: 'Student ID', label: 'Student ID', editKey: 'studentId' },
  { key: 'Degree Level', label: 'Degree Level', editKey: 'degreeLevel' },
  { key: 'Salary Pay Period', label: 'Salary Pay Period', editKey: 'salaryPayPeriod' },
  { key: 'Email', label: 'Email', editKey: 'email' },
  { key: 'LinkedIn', label: 'LinkedIn', editKey: 'linkedIn' }
];

const fields: FieldConfig[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'graduationYear', label: 'Graduation Year', type: 'number' },
  { key: 'graduationTerm', label: 'Graduation Term', type: 'select', options: ['Spring', 'Fall'] },
  { key: 'outcomeType', label: 'Outcome Type', type: 'select', options: ['Job', 'Graduate School', 'Internship'] },
  { key: 'employer', label: 'Employer' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'expectedFieldOfStudy', label: 'Expected Field of Study' },
  { key: 'degreeSeeking', label: 'Degree Seeking', type: 'select', options: ["Bachelor's", "Master's", 'Doctorate'] },
  { key: 'university', label: 'University' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'baseSalary', label: 'Base Salary', type: 'number' },
  { key: 'studentId', label: 'Student ID', type: 'number' },
  { key: 'degreeLevel', label: 'Degree Level', type: 'select', options: ['BS', 'MS', 'PhD'] },
  { key: 'salaryPayPeriod', label: 'Salary Pay Period', type: 'select', options: ['Annual'] },
  { key: 'email', label: 'Email' },
  { key: 'linkedIn', label: 'LinkedIn' }
];

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${warmBorder}`,
  borderRadius: 12,
  background: '#fff',
  boxSizing: 'border-box' as const,
  font: 'inherit'
};

function uniqueSorted(values: Array<string | number | null | undefined>) {
  return Array.from(new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function matchesSelection(value: string | number | null | undefined, selected: string[]) {
  if (!selected.length) return true;
  return selected.includes(String(value ?? ''));
}

function matchesCanonicalSelection(
  value: string | null | undefined,
  selected: string[],
  canonicalize: (value: string | null | undefined) => string | null
) {
  if (!selected.length) return true;
  const canonical = canonicalize(value);
  return canonical ? selected.includes(canonical) : false;
}

function uniqueCanonicalSorted(
  values: Array<string | null | undefined>,
  canonicalize: (value: string | null | undefined) => string | null
) {
  return Array.from(
    new Set(
      values
        .map((value) => canonicalize(value))
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function sortRows(rows: AdminAlumniRow[], sortKey: AdminSortKey, sortDirection: SortDirection) {
  const direction = sortDirection === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = left[sortKey];
    const rightValue = right[sortKey];

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue ?? '').localeCompare(String(rightValue ?? '')) * direction;
  });
}

function SearchableCheckboxDropdown({ label, options, selected, onToggle, accent }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setShowAll(false);
    }
  }, [isOpen]);

  const matchingOptions = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));
  const visibleOptions = query || showAll ? matchingOptions : matchingOptions.slice(0, 3);
  const summary = selected.length ? `${selected.length} selected` : 'All';

  return (
    <div style={{ position: 'relative', minWidth: 220 }}>
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

const createDraft = (row: AdminAlumniRow): EditDraft => ({
  firstName: row['First Name'] ?? '',
  lastName: row['Last Name'] ?? '',
  graduationYear: String(row['Graduation Year'] ?? ''),
  graduationTerm: row['Graduation Term'] ?? '',
  outcomeType: row['Outcome Type'] ?? '',
  employer: row.Employer ?? '',
  jobTitle: row['Job Title'] ?? '',
  expectedFieldOfStudy: row['Expected Field of Study'] ?? '',
  degreeSeeking: row['Degree Seeking'] ?? '',
  university: row.University ?? '',
  city: row.City ?? '',
  state: row.State ?? '',
  baseSalary: row['Base Salary'] == null ? '' : String(row['Base Salary']),
  studentId: row['Student ID'] == null ? '' : String(row['Student ID']),
  degreeLevel: row['Degree Level'] ?? '',
  salaryPayPeriod: row['Salary Pay Period'] ?? '',
  email: row.Email ?? '',
  linkedIn: row.LinkedIn ?? ''
});

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function parseNullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const AdminAlumniTable = () => {
  const [tab, setTab] = useState<AlumniTab>('Job');
  const [rows, setRows] = useState<AdminAlumniRow[]>([]);
  const [search, setSearch] = useState('');
  const [graduationYears, setGraduationYears] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [degreeSeeking, setDegreeSeeking] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<AdminSortKey>('Graduation Year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, EditDraft>>({});

  const loadRows = async () => {
    const response = await fetchAdminAlumni();
    const nextRows = response.rows as AdminAlumniRow[];
    setRows(nextRows);
    setDrafts((current) => {
      const next = { ...current };
      nextRows.forEach((row) => {
        next[row.alumni_id] = current[row.alumni_id] ?? createDraft(row);
      });
      return next;
    });
  };

  useEffect(() => {
    loadRows().catch((error) => {
      console.error('Failed to fetch admin alumni:', error);
    });
  }, []);

  const tabRows = useMemo(
    () => rows.filter((row) => row['Outcome Type'] === tab),
    [rows, tab]
  );
  const graduationYearOptions = uniqueSorted(tabRows.map((row) => row['Graduation Year']));
  const majorOptions = uniqueSorted(tabRows.map((row) => row['Expected Field of Study']));
  const companyOptions = uniqueCanonicalSorted(tabRows.map((row) => row.Employer), canonicalizeCompany);
  const jobTitleOptions = uniqueCanonicalSorted(tabRows.map((row) => row['Job Title']), canonicalizeJobTitle);
  const stateOptions = uniqueSorted(tabRows.map((row) => row.State));
  const degreeSeekingOptions = uniqueSorted(tabRows.map((row) => row['Degree Seeking']));
  const universityOptions = uniqueCanonicalSorted(tabRows.map((row) => row.University), canonicalizeUniversity);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tabRows.filter((row) => {
      if (term && !columns.some(({ key }) => {
        const value = row[key];
        return value !== null && value !== undefined && String(value).toLowerCase().includes(term);
      })) {
        return false;
      }

      if (!matchesSelection(row['Graduation Year'], graduationYears)) return false;
      if (!matchesSelection(row.State, states)) return false;

      if (tab === 'Job' || tab === 'Internship') {
        if (!matchesCanonicalSelection(row.Employer, companies, canonicalizeCompany)) return false;
        if (!matchesCanonicalSelection(row['Job Title'], jobTitles, canonicalizeJobTitle)) return false;
      }

      if (tab === 'Graduate School') {
        if (!matchesSelection(row['Expected Field of Study'], majors)) return false;
        if (!matchesSelection(row['Degree Seeking'], degreeSeeking)) return false;
        if (!matchesCanonicalSelection(row.University, universities, canonicalizeUniversity)) return false;
      }

      return true;
    });
  }, [companies, degreeSeeking, graduationYears, jobTitles, majors, search, states, tab, tabRows, universities]);
  const sortedRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDirection),
    [filteredRows, sortDirection, sortKey]
  );
  const visibleSortOptions: Array<{ value: AdminSortKey; label: string }> = tab === 'Graduate School'
    ? [
        { value: 'Graduation Year', label: 'Graduation Year' },
        { value: 'Last Name', label: 'Last Name' },
        { value: 'University', label: 'University' },
        { value: 'Degree Level', label: 'Degree Level' }
      ]
    : [
        { value: 'Graduation Year', label: 'Graduation Year' },
        { value: 'Last Name', label: 'Last Name' },
        { value: 'Employer', label: 'Company' },
        { value: 'Job Title', label: 'Job Title' },
        { value: 'Degree Level', label: 'Degree Level' }
      ];

  const clearFilters = () => {
    setSearch('');
    setGraduationYears([]);
    setMajors([]);
    setCompanies([]);
    setJobTitles([]);
    setStates([]);
    setDegreeSeeking([]);
    setUniversities([]);
    setSortKey('Graduation Year');
    setSortDirection('desc');
  };

  useEffect(() => {
    clearFilters();
    setSelectedId(null);
  }, [tab]);

  const updateDraft = (id: number, patch: Partial<EditDraft>) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? createDraft(rows.find((row) => row.alumni_id === id)!)),
        ...patch
      }
    }));
  };

  const handleEdit = (row: AdminAlumniRow) => {
    setDrafts((current) => ({
      ...current,
      [row.alumni_id]: current[row.alumni_id] ?? createDraft(row)
    }));
    setSelectedId(row.alumni_id);
  };

  const handleCancel = (row: AdminAlumniRow) => {
    setDrafts((current) => ({
      ...current,
      [row.alumni_id]: createDraft(row)
    }));
    setSelectedId(null);
  };

  const handleSave = async (row: AdminAlumniRow) => {
    const draft = drafts[row.alumni_id] ?? createDraft(row);
    const graduationYear = Number(draft.graduationYear);

    if (!draft.firstName.trim() || !draft.lastName.trim() || !Number.isFinite(graduationYear)) {
      window.alert('First Name, Last Name, and a valid Graduation Year are required.');
      return;
    }

    await updateAdminAlumni(row.alumni_id, {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      graduationYear,
      graduationTerm: draft.graduationTerm.trim() || null,
      outcomeType: draft.outcomeType.trim() || null,
      employer: draft.employer.trim() || null,
      jobTitle: draft.jobTitle.trim() || null,
      expectedFieldOfStudy: draft.expectedFieldOfStudy.trim() || null,
      degreeSeeking: draft.degreeSeeking.trim() || null,
      university: draft.university.trim() || null,
      city: draft.city.trim() || null,
      state: draft.state.trim() || null,
      baseSalary: parseNullableNumber(draft.baseSalary),
      studentId: parseNullableNumber(draft.studentId),
      degreeLevel: draft.degreeLevel.trim() || null,
      salaryPayPeriod: draft.salaryPayPeriod.trim() || null,
      email: draft.email.trim() || null,
      linkedIn: draft.linkedIn.trim() || null
    });

    setSelectedId(null);
    await loadRows();
  };

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
          <h1 style={{ marginBottom: 8 }}>Moderate Entries</h1>
          <p style={{ margin: 0, color: '#534B45' }}>
            Review and edit all fields for {tab === 'Graduate School' ? 'graduate-school' : tab === 'Internship' ? 'internship' : 'job-placement'} entries.
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
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 360, flex: '1 1 360px' }}>
            <span style={{ fontWeight: 800, color: '#2D2926' }}>Search Raw Data</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search across any alumni field shown in the table"
              style={inputStyle}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontWeight: 800, color: '#2D2926' }}>Sort</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as AdminSortKey)}
                  style={{ padding: '12px 14px', border: `1px solid ${warmBorder}`, borderRadius: 12, background: '#fff', height: 48 }}
                >
                  {visibleSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: '0 16px',
                    borderRadius: 12,
                    border: `1px solid ${gold}`,
                    background: sortDirection === 'asc' ? '#fff' : deepGold,
                    color: sortDirection === 'asc' ? deepGold : '#fff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    height: 48
                  }}
                >
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
            <div
              style={{
                padding: '0 16px',
                borderRadius: 14,
                background: softGold,
                color: '#2D2926',
                fontWeight: 800,
                minWidth: 120,
                textAlign: 'center',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
            >
              {sortedRows.length} rows
            </div>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '0 16px',
                borderRadius: 12,
                border: `1px solid ${gold}`,
                background: '#fff',
                color: deepGold,
                cursor: 'pointer',
                fontWeight: 800,
                height: 48
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <SearchableCheckboxDropdown
            label="Graduation Year"
            options={graduationYearOptions}
            selected={graduationYears}
            onToggle={(value) => setGraduationYears((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          <SearchableCheckboxDropdown
            label="State"
            options={stateOptions}
            selected={states}
            onToggle={(value) => setStates((current) => toggleValue(current, value))}
            accent={deepGold}
          />
          {(tab === 'Job' || tab === 'Internship') && (
            <>
              <SearchableCheckboxDropdown
                label="Company"
                options={companyOptions}
                selected={companies}
                onToggle={(value) => setCompanies((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="Job Title"
                options={jobTitleOptions}
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
                options={majorOptions}
                selected={majors}
                onToggle={(value) => setMajors((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="Degree Seeking"
                options={degreeSeekingOptions}
                selected={degreeSeeking}
                onToggle={(value) => setDegreeSeeking((current) => toggleValue(current, value))}
                accent={deepGold}
              />
              <SearchableCheckboxDropdown
                label="University"
                options={universityOptions}
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
          maxHeight: 'calc(100vh - 320px)'
        }}
      >
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 2800 }}>
            <thead>
              <tr style={{ background: '#F5EEDC', textAlign: 'left' }}>
                {columns.map((column) => (
                  <th key={column.label} style={{ padding: 14, whiteSpace: 'nowrap', borderBottom: '1px solid #E4D8C3' }}>
                    {column.label}
                  </th>
                ))}
                <th
                  style={{
                    padding: 14,
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #E4D8C3',
                    position: 'sticky',
                    right: 0,
                    background: '#F5EEDC',
                    zIndex: 3,
                    boxShadow: '-10px 0 18px rgba(45, 41, 38, 0.08)'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, index) => {
                const isEditing = row.alumni_id === selectedId;
                const draft = drafts[row.alumni_id] ?? createDraft(row);
                const rowBackground = isEditing ? '#F9F1E1' : index % 2 === 0 ? '#fff' : '#FFFCF7';

                return (
                  <>
                    <tr key={row.alumni_id} style={{ background: rowBackground }}>
                      {columns.map((column) => (
                        <td key={`${row.alumni_id}-${column.label}`} style={{ padding: 14, whiteSpace: 'nowrap', borderTop: '1px solid #EEE5D8' }}>
                          {formatCellValue(row[column.key])}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: 10,
                          borderTop: '1px solid #EEE5D8',
                          position: 'sticky',
                          right: 0,
                          background: rowBackground,
                          zIndex: 2,
                          width: isEditing ? 220 : 130,
                          minWidth: isEditing ? 220 : 130,
                          transition: 'width 180ms ease, min-width 180ms ease',
                          boxShadow: '-10px 0 18px rgba(45, 41, 38, 0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 8, flexDirection: isEditing ? 'column' : 'row' }}>
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => { handleSave(row).catch((error) => console.error('Failed to save alumni record:', error)); }}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  border: `1px solid ${gold}`,
                                  background: deepGold,
                                  color: '#fff',
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(row)}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  border: `1px solid ${gold}`,
                                  background: '#fff',
                                  color: deepGold,
                                  fontWeight: 800,
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: `1px solid ${gold}`,
                                background: '#fff',
                                color: deepGold,
                                fontWeight: 800,
                                cursor: 'pointer',
                                width: '100%'
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isEditing && (
                      <tr key={`${row.alumni_id}-editor`} style={{ background: '#FFF8EA' }}>
                        <td colSpan={columns.length + 1} style={{ padding: 18, borderTop: '1px solid #E7D8BD', borderBottom: '1px solid #E7D8BD' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                              <strong style={{ color: '#2D2926' }}>
                                Editing {row['First Name']} {row['Last Name']}
                              </strong>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                              {fields.map((field) => (
                                <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <span style={{ fontWeight: 700, color: '#2D2926' }}>{field.label}</span>
                                  {field.type === 'select' ? (
                                    <select
                                      value={draft[field.key]}
                                      onChange={(event) => updateDraft(row.alumni_id, { [field.key]: event.target.value })}
                                      style={inputStyle}
                                    >
                                      <option value="">Blank</option>
                                      {field.options?.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type === 'number' ? 'number' : 'text'}
                                      value={draft[field.key]}
                                      onChange={(event) => updateDraft(row.alumni_id, { [field.key]: event.target.value })}
                                      style={inputStyle}
                                    />
                                  )}
                                </label>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}

              {!sortedRows.length && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ padding: 24, textAlign: 'center' }}>
                    No alumni rows match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminAlumniTable;
