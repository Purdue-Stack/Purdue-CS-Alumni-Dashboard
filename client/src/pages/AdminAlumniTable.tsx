import { useEffect, useMemo, useState } from 'react';
import { fetchAdminAlumni, getAdminExportUrl, updateAdminAlumni } from '../api/api';

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
  Track: string | null;
  'Degree Seeking': string | null;
  University: string | null;
  City: string | null;
  State: string | null;
  'Base Salary': number | null;
  'Signing Bonus': number | null;
  'Relocation Reimbursement': number | null;
  'Student ID': number | null;
  'Degree Level': string | null;
  'Salary Pay Period': string | null;
  Email: string | null;
  LinkedIn: string | null;
};

type EditDraft = {
  firstName: string;
  lastName: string;
  graduationYear: string;
  graduationTerm: string;
  outcomeType: string;
  employer: string;
  jobTitle: string;
  expectedFieldOfStudy: string;
  track: string;
  degreeSeeking: string;
  university: string;
  city: string;
  state: string;
  baseSalary: string;
  signingBonus: string;
  relocationReimbursement: string;
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
  { key: 'Track', label: 'Track', editKey: 'track' },
  { key: 'Degree Seeking', label: 'Degree Seeking', editKey: 'degreeSeeking' },
  { key: 'University', label: 'University', editKey: 'university' },
  { key: 'City', label: 'City', editKey: 'city' },
  { key: 'State', label: 'State', editKey: 'state' },
  { key: 'Base Salary', label: 'Base Salary', editKey: 'baseSalary' },
  { key: 'Signing Bonus', label: 'Signing Bonus', editKey: 'signingBonus' },
  { key: 'Relocation Reimbursement', label: 'Relocation Reimbursement', editKey: 'relocationReimbursement' },
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
  { key: 'outcomeType', label: 'Outcome Type', type: 'select', options: ['Job', 'Graduate School'] },
  { key: 'employer', label: 'Employer' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'expectedFieldOfStudy', label: 'Expected Field of Study' },
  { key: 'track', label: 'Track' },
  { key: 'degreeSeeking', label: 'Degree Seeking', type: 'select', options: ["Bachelor's", "Master's", 'Doctorate'] },
  { key: 'university', label: 'University' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'baseSalary', label: 'Base Salary', type: 'number' },
  { key: 'signingBonus', label: 'Signing Bonus', type: 'number' },
  { key: 'relocationReimbursement', label: 'Relocation Reimbursement', type: 'number' },
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

const createDraft = (row: AdminAlumniRow): EditDraft => ({
  firstName: row['First Name'] ?? '',
  lastName: row['Last Name'] ?? '',
  graduationYear: String(row['Graduation Year'] ?? ''),
  graduationTerm: row['Graduation Term'] ?? '',
  outcomeType: row['Outcome Type'] ?? '',
  employer: row.Employer ?? '',
  jobTitle: row['Job Title'] ?? '',
  expectedFieldOfStudy: row['Expected Field of Study'] ?? '',
  track: row.Track ?? '',
  degreeSeeking: row['Degree Seeking'] ?? '',
  university: row.University ?? '',
  city: row.City ?? '',
  state: row.State ?? '',
  baseSalary: row['Base Salary'] == null ? '' : String(row['Base Salary']),
  signingBonus: row['Signing Bonus'] == null ? '' : String(row['Signing Bonus']),
  relocationReimbursement: row['Relocation Reimbursement'] == null ? '' : String(row['Relocation Reimbursement']),
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
  const [rows, setRows] = useState<AdminAlumniRow[]>([]);
  const [search, setSearch] = useState('');
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

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      columns.some(({ key }) => {
        const value = row[key];
        return value !== null && value !== undefined && String(value).toLowerCase().includes(term);
      })
    );
  }, [rows, search]);

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
      track: draft.track.trim() || null,
      degreeSeeking: draft.degreeSeeking.trim() || null,
      university: draft.university.trim() || null,
      city: draft.city.trim() || null,
      state: draft.state.trim() || null,
      baseSalary: parseNullableNumber(draft.baseSalary),
      signingBonus: parseNullableNumber(draft.signingBonus),
      relocationReimbursement: parseNullableNumber(draft.relocationReimbursement),
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
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ marginBottom: 0 }}>Moderate Entries</h1>
        <p style={{ margin: 0, color: '#534B45' }}>
          Raw alumni data view with inline editing. Expand a row to edit it directly beneath the record while keeping actions visible.
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
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 360, flex: '1 1 360px' }}>
            <span style={{ fontWeight: 800, color: '#2D2926' }}>Search Raw Data</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search across any alumni field shown in the table"
              style={inputStyle}
            />
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
              {filteredRows.length} rows
            </div>
            <a className="hero-data-button hero-data-button--border" href={getAdminExportUrl()}>
              EXPORT CSV
            </a>
          </div>
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
              {filteredRows.map((row, index) => {
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

              {!filteredRows.length && (
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
