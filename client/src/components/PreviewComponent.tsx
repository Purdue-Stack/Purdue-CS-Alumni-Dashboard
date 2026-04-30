import React, { useEffect, useState } from 'react';
import csvIcon from '../assets/icons/csv.svg';
import type { UploadFieldError, UploadFieldMapping } from '../api/api';

interface PreviewProps {
  file: File;
  rawHeaders: string[];
  rawRows: Record<string, any>[];
  columns: string[];
  rows: Record<string, any>[];
  mapping: UploadFieldMapping;
  requiredFields: string[];
  fieldErrors?: UploadFieldError[];
  rowErrors?: { rowIndex: number; messages: string[] }[];
  uploadSummary?: {
    totalRows: number;
    missingColumns: string[];
    unmappedHeaders: string[];
    mappingErrors: string[];
  } | null;
  summary?: { totalRows: number; validRows: number; invalidRows: number } | null;
  onValidateMapping: (mapping: UploadFieldMapping) => void;
  onRevalidate: (rows: Record<string, any>[]) => void;
  onCommit?: (rows: Record<string, any>[]) => void;
  validationLoading?: boolean;
  commitLoading?: boolean;
}

type Tab = 'mapping' | 'validation' | 'preview';

const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const mutedText = '#6B625B';

const PreviewComponent: React.FC<PreviewProps> = ({
  file,
  rawHeaders,
  rawRows,
  columns,
  rows,
  mapping,
  requiredFields,
  fieldErrors = [],
  rowErrors = [],
  uploadSummary,
  summary,
  onValidateMapping,
  onRevalidate,
  onCommit,
  validationLoading = false,
  commitLoading = false
}) => {
  const [tab, setTab] = useState<Tab>('mapping');
  const [localMapping, setLocalMapping] = useState<UploadFieldMapping>({});
  const [editableRows, setEditableRows] = useState<Record<string, any>[]>([]);
  const [validationDirty, setValidationDirty] = useState(false);

  useEffect(() => {
    setLocalMapping(mapping);
  }, [mapping, file.name]);

  useEffect(() => {
    setEditableRows(rows);
    setValidationDirty(false);
    if (rows.length) {
      setTab('validation');
    }
  }, [rows, file.name]);

  const rowErrorMap = new Map<number, string[]>();
  rowErrors.forEach((error) => {
    rowErrorMap.set(error.rowIndex, error.messages);
  });

  const fieldErrorMap = new Map<number, UploadFieldError[]>();
  fieldErrors.forEach((error) => {
    const bucket = fieldErrorMap.get(error.rowIndex) ?? [];
    bucket.push(error);
    fieldErrorMap.set(error.rowIndex, bucket);
  });

  const headerUsage = new Map<string, string[]>();
  columns.forEach((column) => {
    const header = localMapping[column];
    if (!header) {
      return;
    }
    const bucket = headerUsage.get(header) ?? [];
    bucket.push(column);
    headerUsage.set(header, bucket);
  });

  const duplicateMappingErrors = Array.from(headerUsage.entries())
    .filter(([, mappedColumns]) => mappedColumns.length > 1)
    .map(([header, mappedColumns]) => `${header} is mapped to multiple fields: ${mappedColumns.join(', ')}`);
  const missingRequiredMappings = requiredFields.filter((field) => !localMapping[field]);
  const mappingErrors = [
    ...missingRequiredMappings.map((field) => `${field} must have a mapped file column`),
    ...duplicateMappingErrors
  ].filter((message, index, arr) => arr.indexOf(message) === index);

  const mappedHeaders = new Set(
    columns
      .map((column) => localMapping[column])
      .filter((header): header is string => Boolean(header))
  );
  const unmappedHeaders = rawHeaders.filter((header) => !mappedHeaders.has(header));

  const displayColumns = columns.length ? columns : editableRows[0] ? Object.keys(editableRows[0]) : [];
  const previewRows = editableRows.slice(0, 50);
  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'mapping', label: 'Field Mapping' },
    { key: 'validation', label: 'Validation' },
    { key: 'preview', label: 'Preview' }
  ];

  const canOpenPreview = editableRows.length > 0 && rowErrors.length === 0 && !validationDirty;
  const invalidRowIndexes = rowErrors.map((error) => error.rowIndex);

  const handleTabClick = (nextTab: Tab) => {
    if (nextTab === 'preview' && !canOpenPreview) {
      return;
    }
    if (nextTab === 'validation' && !editableRows.length) {
      return;
    }
    setTab(nextTab);
  };

  const handleMappingChange = (field: string, value: string) => {
    setLocalMapping((current) => ({
      ...current,
      [field]: value || null
    }));
    setValidationDirty(true);
  };

  const handleInputChange = (rowIndex: number, field: string, value: string) => {
    setEditableRows((current) =>
      current.map((row, index) => {
        if (index !== rowIndex) {
          return row;
        }

        return {
          ...row,
          [field]: value
        };
      })
    );
    setValidationDirty(true);
  };

  const handleMappingValidation = () => {
    if (mappingErrors.length > 0) {
      return;
    }
    onValidateMapping(localMapping);
  };

  const handleRevalidate = () => {
    onRevalidate(editableRows);
  };

  const handleCommit = () => {
    if (onCommit) {
      onCommit(editableRows);
    }
  };

  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value ?? '';
  };

  const invalidRows = invalidRowIndexes.map((rowIndex) => ({
    rowIndex,
    row: editableRows[rowIndex - 1] ?? {},
    messages: rowErrorMap.get(rowIndex) ?? [],
    fieldList: Array.from(
      new Set(
        ['Outcome Type', ...requiredFields, ...(fieldErrorMap.get(rowIndex) ?? []).map((error) => error.field)]
      )
    )
  }));

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
            <div style={{ fontSize: 13, color: mutedText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Chosen Dataset
            </div>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 999, background: '#fff', border: `1px solid ${warmBorder}` }}>
              <img src={csvIcon} alt="" style={{ width: 20, height: 20 }} />
              <span style={{ color: '#2D2926', fontWeight: 700 }}>{file.name}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
              <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>Rows</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2D2926' }}>{uploadSummary?.totalRows ?? summary?.totalRows ?? rawRows.length}</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
              <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>Valid</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: deepGold }}>{summary?.validRows ?? 0}</div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: `1px solid ${warmBorder}` }}>
              <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>Invalid</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#8A3D3D' }}>{summary?.invalidRows ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      <nav style={{ display: 'inline-flex', width: 'fit-content', padding: 6, borderRadius: 16, background: softGold }}>
        {tabs.map((item) => {
          const disabled = (item.key === 'validation' && !editableRows.length) || (item.key === 'preview' && !canOpenPreview);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleTabClick(item.key)}
              style={{
                border: 'none',
                borderRadius: 12,
                padding: '12px 18px',
                background: tab === item.key ? deepGold : 'transparent',
                color: tab === item.key ? '#fff' : disabled ? '#9E968C' : '#2D2926',
                fontWeight: 800,
                cursor: disabled ? 'not-allowed' : 'pointer'
              }}
            >
              {item.label}
            </button>
          );
        })}
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
          <p style={{ margin: '6px 0 0', color: mutedText }}>
            {tab === 'mapping'
              ? 'Confirm which file headers map into each alumni database field before validation.'
              : tab === 'validation'
                ? 'Review missing or invalid values, update the affected rows, and validate again before preview.'
                : 'Preview the validated data before saving it to the database.'}
          </p>
        </div>

        {tab === 'mapping' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
                <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>File Columns</div>
                <div style={{ marginTop: 6, fontSize: 24, color: '#2D2926', fontWeight: 700 }}>{rawHeaders.length}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
                <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>Required Mappings</div>
                <div style={{ marginTop: 6, fontSize: 24, color: '#2D2926', fontWeight: 700 }}>{requiredFields.length}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
                <div style={{ fontSize: 12, color: mutedText, textTransform: 'uppercase', fontWeight: 700 }}>Unmapped File Columns</div>
                <div style={{ marginTop: 6, fontSize: 24, color: '#2D2926', fontWeight: 700 }}>{unmappedHeaders.length}</div>
              </div>
            </div>

            {mappingErrors.length > 0 && (
              <div style={{ padding: 14, borderRadius: 14, border: '1px solid #E5B7B7', background: '#FFF6F6', color: '#8A3D3D' }}>
                <strong style={{ display: 'block', marginBottom: 8 }}>Mapping issues</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {mappingErrors.map((message) => (
                    <span key={message}>{message}</span>
                  ))}
                </div>
              </div>
            )}

            {!!unmappedHeaders.length && (
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
                <strong style={{ display: 'block', marginBottom: 8, color: '#2D2926' }}>Unmapped source columns</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {unmappedHeaders.map((header) => (
                    <span
                      key={header}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 999,
                        background: '#fff',
                        border: `1px solid ${warmBorder}`,
                        color: mutedText,
                        fontSize: 13
                      }}
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ overflow: 'auto', maxHeight: 'min(58vh, 720px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                <thead>
                  <tr style={{ background: '#F7F3EA' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>Database Field</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>Required</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>File Column</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${warmBorder}` }}>Sample Value</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((column) => {
                    const selectedHeader = localMapping[column] ?? '';
                    const sampleValue = selectedHeader && rawRows[0] ? rawRows[0][selectedHeader] : '';
                    return (
                      <tr key={column}>
                        <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: '#2D2926', fontWeight: 700 }}>{column}</td>
                        <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: requiredFields.includes(column) ? '#8A3D3D' : mutedText }}>
                          {requiredFields.includes(column) ? 'Required' : 'Optional'}
                        </td>
                        <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8` }}>
                          <select
                            value={selectedHeader}
                            onChange={(event) => handleMappingChange(column, event.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `1px solid ${warmBorder}`,
                              background: '#fff',
                              color: '#2D2926'
                            }}
                          >
                            <option value="">Unmapped</option>
                            {rawHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: mutedText }}>
                          {renderValue(sampleValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'validation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 18 }}>
            {!!rowErrors.length && (
              <div style={{ padding: 14, borderRadius: 14, border: '1px solid #E5B7B7', background: '#FFF6F6', color: '#8A3D3D' }}>
                <strong style={{ display: 'block', marginBottom: 8 }}>Validation issues found</strong>
                <span>
                  {summary?.invalidRows ?? rowErrors.length} row{(summary?.invalidRows ?? rowErrors.length) === 1 ? '' : 's'} need attention before preview.
                </span>
              </div>
            )}

            {!rowErrors.length && editableRows.length > 0 && (
              <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${warmBorder}`, background: '#F7FBF3', color: '#2D2926' }}>
                <strong style={{ display: 'block', marginBottom: 8 }}>Validation passed</strong>
                <span>{summary?.validRows ?? editableRows.length} rows are ready for preview.</span>
              </div>
            )}

            {invalidRows.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 'min(58vh, 720px)', overflow: 'auto' }}>
                {invalidRows.map(({ rowIndex, row, messages, fieldList }) => (
                  <div
                    key={rowIndex}
                    style={{
                      border: `1px solid ${warmBorder}`,
                      borderRadius: 16,
                      padding: 16,
                      background: '#FFFCF7',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <strong style={{ color: '#2D2926' }}>Row {rowIndex}</strong>
                      <span style={{ color: mutedText }}>
                        {row['First Name'] || 'Unknown'} {row['Last Name'] || ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: '#8A3D3D' }}>
                      {messages.map((message) => (
                        <span key={`${rowIndex}-${message}`}>{message}</span>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {fieldList.map((field) => (
                        <label key={`${rowIndex}-${field}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{ color: '#2D2926', fontWeight: 700 }}>{field}</span>
                          <input
                            type={field.toLowerCase().includes('year') || field.toLowerCase().includes('salary') || field === 'Student ID' ? 'number' : 'text'}
                            value={Array.isArray(row[field]) ? row[field].join(', ') : row[field] ?? ''}
                            onChange={(event) => handleInputChange(rowIndex - 1, field, event.target.value)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `1px solid ${warmBorder}`,
                              background: '#fff',
                              color: '#2D2926'
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  border: `1px dashed ${warmBorder}`,
                  borderRadius: 16,
                  padding: 24,
                  background: '#FFFDFC',
                  color: mutedText,
                  textAlign: 'center'
                }}
              >
                {editableRows.length ? 'No validation issues remain.' : 'Run validation from the mapping stage to review the parsed data.'}
              </div>
            )}
          </div>
        )}

        {tab === 'preview' && (
          <div style={{ overflow: 'auto', maxHeight: 'min(60vh, 720px)' }}>
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
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => (
                    <tr key={idx + 1}>
                      <td style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: mutedText }}>{idx + 1}</td>
                      {displayColumns.map((col) => (
                        <td key={`${idx + 1}-${col}`} style={{ padding: 12, borderBottom: `1px solid #EEE5D8`, color: '#2D2926' }}>
                          {renderValue(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: mutedText }}>
                No rows available for preview.
              </div>
            )}

            {editableRows.length > previewRows.length && (
              <div style={{ padding: '14px 18px', color: mutedText, borderTop: `1px solid ${warmBorder}`, background: '#FCFAF5' }}>
                Showing first {previewRows.length} rows.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        {tab === 'mapping' && (
          <button
            type="button"
            onClick={handleMappingValidation}
            disabled={mappingErrors.length > 0 || validationLoading}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: 'none',
              background: mappingErrors.length > 0 || validationLoading ? '#D9D2C4' : deepGold,
              color: '#fff',
              fontWeight: 700,
              cursor: mappingErrors.length > 0 || validationLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {validationLoading ? 'VALIDATING…' : 'VALIDATE →'}
          </button>
        )}
        {tab === 'validation' && (
          <>
            <button
              type="button"
              onClick={handleRevalidate}
              disabled={!editableRows.length || validationLoading}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                border: `1px solid ${warmBorder}`,
                background: '#fff',
                color: '#2D2926',
                fontWeight: 700,
                cursor: !editableRows.length || validationLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {validationLoading ? 'VALIDATING…' : validationDirty || rowErrors.length ? 'VALIDATE AGAIN' : 'VALIDATED'}
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              disabled={!canOpenPreview}
              style={{
                padding: '12px 18px',
                borderRadius: 12,
                border: 'none',
                background: canOpenPreview ? deepGold : '#D9D2C4',
                color: '#fff',
                fontWeight: 700,
                cursor: canOpenPreview ? 'pointer' : 'not-allowed'
              }}
            >
              PREVIEW →
            </button>
          </>
        )}
        {tab === 'preview' && (
          <button
            type="button"
            onClick={handleCommit}
            disabled={commitLoading || !canOpenPreview}
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              border: 'none',
              background: commitLoading || !canOpenPreview ? '#D9D2C4' : deepGold,
              color: '#fff',
              fontWeight: 700,
              cursor: commitLoading || !canOpenPreview ? 'not-allowed' : 'pointer'
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
