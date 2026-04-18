import { useEffect, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { fetchInternships, type InternshipRow } from '../api/api';

const InternshipExplorer = () => {
  const [rows, setRows] = useState<InternshipRow[]>([]);
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    fetchInternships({
      search,
      companies,
      outcomes,
      page: 0,
      pageSize: 50
    })
      .then((data) => {
        if (active) {
          setRows(data.rows);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch internships:', error);
      });

    return () => {
      active = false;
    };
  }, [search, companies, outcomes]);

  const handleMultiSelect = (
    event: ChangeEvent<HTMLSelectElement>,
    setter: Dispatch<SetStateAction<string[]>>
  ) => {
    setter(Array.from(event.target.selectedOptions, (option) => option.value));
  };

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <h1>Internship Explorer</h1>
        <p>Explore where internships led afterward, including company-to-outcome patterns.</p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search internship company, role, or outcome"
          style={{ padding: 12, border: '1px solid #C4BFC0', borderRadius: 8 }}
        />
        <select
          multiple
          value={companies}
          onChange={(event) => handleMultiSelect(event, setCompanies)}
          style={{ padding: 12, border: '1px solid #C4BFC0', borderRadius: 8, minHeight: 110 }}
        >
          {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          multiple
          value={outcomes}
          onChange={(event) => handleMultiSelect(event, setOutcomes)}
          style={{ padding: 12, border: '1px solid #C4BFC0', borderRadius: 8, minHeight: 110 }}
        >
          {['Google', 'Amazon', 'Graduate School', 'Startup', 'Full Time'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {rows.map((row) => (
          <article key={row.id} style={{ border: '1px solid #C4BFC0', borderRadius: 12, padding: 20, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>{row.company || 'Unknown internship company'}</h3>
            <p>{row.role || 'Unknown internship role'}{row.internship_year ? ` • ${row.internship_year}` : ''}</p>
            <p>{row.location_city || 'Unknown city'}{row.location_state ? `, ${row.location_state}` : ''}</p>
            <p>Outcome: {row.outcome_role || 'Unknown role'}{row.outcome_company ? ` at ${row.outcome_company}` : ''}</p>
            {row.outcome_type && <p>Outcome Type: {row.outcome_type}</p>}
          </article>
        ))}
      </section>
    </div>
  );
};

export default InternshipExplorer;
