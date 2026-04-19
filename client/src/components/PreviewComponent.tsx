import React, { useState } from 'react';
import csvIcon from '../assets/icons/csv.svg';

interface PreviewProps {
  file: File;
  columns: string[];
  rows: Record<string, any>[];
  rowErrors?: { rowIndex: number; messages: string[] }[];
  summary?: { totalRows: number; validRows: number; invalidRows: number; missingColumns: string[] } | null;
  onCommit?: () => void;
  commitLoading?: boolean;
}

type Tab = 'mapping' | 'validation' | 'preview';

const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';

const PreviewComponent: React.FC<PreviewProps> = ({
  file,
  columns,
  rows,
  rowErrors = [],
  summary,
  onCommit,
  commitLoading = false
}) => {
  const [tab, setTab] = useState<Tab>('mapping');

  const errorMap = new Map<number, string[]>();
  rowErrors.forEach((err) => {
    errorMap.set(err.rowIndex, err.messages);
  });

  const displayColumns = columns.length ? columns : rows[0] ? Object.keys(rows[0]) : [];
  const previewRows = rows.slice(0, 50);
  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'mapping', label: 'Field Mapping' },
    { key: 'validation', label: 'Validation' },
    { key: 'preview', label: 'Preview' }
  ];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        style={{
          border: `1px solid ${warmBorder}`,
          borderRadius: 18,
          background: '#F7F3EA',
          padding: 16
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#6B625B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Chosen Dataset
            </div>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 999, background: '#fff', border: `1px solid ${warmBorder}` }}>
              <img src={csvIcon} alt="" style={{ width: 20, height: 20 }} />
              <span style={{ color: '#2D2926', fontWeight: 700 }}>{file.name}</span>
            </div>
          </div>

          {summary && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
                <div style={{ fontSize: 12, color: '#6B625B', textTransform: 'uppercase', fontWeight: 700 }}>Rows</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2D2926' }}>{summary.totalRows}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
                <div style={{ fontSize: 12, color: '#6B625B', textTransform: 'uppercase', fontWeight: 700 }}>Valid</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: deepGold }}>{summary.validRows}</div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
                <div style={{ fontSize: 12, color: '#6B625B', textTransform: 'uppercase', fontWeight: 700 }}>Invalid</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#8A3D3D' }}>{summary.invalidRows}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav style={{ display: 'inline-flex', width: 'fit-content', padding: 6, borderRadius: 16, background: softGold }}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '12px 18px',
              background: tab === item.key ? deepGold : 'transparent',
              color: tab === item.key ? '#fff' : '#2D2926',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          border: `1px solid ${warmBorder}`,
          borderRadius: 18,
          background: '#fff',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: 18, borderBottom: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
          <h2 style={{ margin: 0, color: '#2D2926' }}>
            {tab === 'mapping' ? 'Field Mapping Review' : tab === 'validation' ? 'Validation Results' : 'Data Preview'}
          </h2>
          <p style={{ margin: '6px 0 0', color: '#6B625B' }}>
            {tab === 'mapping'
              ? 'Review detected columns before validating the upload.'
              : tab === 'validation'
                ? 'Inspect invalid rows and any missing required fields.'
                : 'Preview the first rows before committing this upload.'}
          </p>
          {summary?.missingColumns.length ? (
            <div style={{ marginTop: 10, color: '#8A3D3D', fontWeight: 700 }}>
              Missing columns: {summary.missingColumns.join(', ')}
            </div>
          ) : null}
        </div>

        <div style={{ overflowX: 'auto' }}>
          {displayColumns.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#F7F3EA' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>#</th>
                  {displayColumns.map((col) => (
                    <th key={col} style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>
                      {col}
                    </th>
                  ))}
                  {rowErrors.length > 0 && (
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>
                      Row Errors
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => {
                  const rowIndex = idx + 1;
                  const errors = errorMap.get(rowIndex);
                  return (
                    <tr key={rowIndex} style={{ background: errors && tab !== 'mapping' ? '#FFF7F7' : '#fff' }}>
                      <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: '#6B625B' }}>{rowIndex}</td>
                      {displayColumns.map((col) => (
                        <td key={`${rowIndex}-${col}`} style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: '#2D2926' }}>
                          {row[col] ?? ''}
                        </td>
                      ))}
                      {rowErrors.length > 0 && (
                        <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: '#8A3D3D' }}>
                          {tab === 'mapping' ? '' : errors ? errors.join('; ') : ''}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B625B' }}>
              No rows available for preview.
            </div>
          )}
        </div>

        {rows.length > previewRows.length && (
          <div style={{ padding: '14px 18px', color: '#6B625B', borderTop: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
            Showing first {previewRows.length} rows.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {tab === 'mapping' && (
          <button
            type="button"
            onClick={() => setTab('validation')}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: 'none',
              background: deepGold,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            VALIDATE →
          </button>
        )}
        {tab === 'validation' && (
          <button
            type="button"
            onClick={() => setTab('preview')}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: 'none',
              background: deepGold,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            PREVIEW →
          </button>
        )}
        {tab === 'preview' && (
          <button
            type="button"
            onClick={onCommit}
            disabled={commitLoading}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: 'none',
              background: commitLoading ? '#D9D2C4' : deepGold,
              color: '#fff',
              fontWeight: 700,
              cursor: commitLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {commitLoading ? 'UPLOADING…' : 'UPLOAD →'}
          </button>
        )}
      </div>
    </section>
  );
};

export default PreviewComponent;
