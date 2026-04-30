import React, { useEffect, useState } from 'react';
import UploadComponent from '../components/UploadComponent';
import PreviewComponent from '../components/PreviewComponent';
import {
  commitUploadData,
  fetchAdminLogs,
  previewUploadFile,
  validateUploadData,
  type AdminLog,
  type UploadFieldError,
  type UploadFieldMapping
} from '../api/api';

const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const offWhite = '#FFFCF7';

const UploadPreview: React.FC = () => {
  const [activeView, setActiveView] = useState<'upload' | 'preview'>('upload');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<UploadFieldMapping>({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [rowErrors, setRowErrors] = useState<{ rowIndex: number; messages: string[] }[]>([]);
  const [fieldErrors, setFieldErrors] = useState<UploadFieldError[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{
    totalRows: number;
    missingColumns: string[];
    unmappedHeaders: string[];
    mappingErrors: string[];
  } | null>(null);
  const [summary, setSummary] = useState<{ totalRows: number; validRows: number; invalidRows: number } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    fetchAdminLogs()
      .then((data) => setLogs(data.filter((log) => log.action === 'UPLOAD' || log.action === 'UPLOAD_PREVIEW').slice(0, 8)))
      .catch((error) => {
        console.error('Failed to fetch admin logs:', error);
      });
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      const response = await previewUploadFile(file);

      setRawHeaders(response.rawHeaders);
      setRawRows(response.rawRows);
      setColumns(response.columns);
      setMapping(response.suggestedMapping || {});
      setRequiredFields(response.requiredFields || []);
      setRows([]);
      setRowErrors([]);
      setFieldErrors([]);
      setUploadSummary(response.summary || null);
      setSummary(null);
      setActiveView('preview');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Error parsing file. Please try again.');
    }
  };

  const handleValidateMapping = async (nextMapping: UploadFieldMapping) => {
    if (!rawRows.length) {
      return;
    }

    setValidationLoading(true);
    try {
      const response = await validateUploadData({
        rawRows,
        mapping: nextMapping
      });

      setMapping(nextMapping);
      setRows(response.rows);
      setRowErrors(response.rowErrors || []);
      setFieldErrors(response.fieldErrors || []);
      setSummary(response.summary || null);
    } catch (error: any) {
      console.error('Failed to validate mapped upload:', error);
      const message = error?.response?.data?.mappingErrors?.join('\n')
        || error?.response?.data?.error
        || 'Error validating mapped rows. Please review the field mapping.';
      alert(message);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleRevalidate = async (nextRows: Record<string, any>[]) => {
    setValidationLoading(true);
    try {
      const response = await validateUploadData({
        rows: nextRows
      });

      setRows(response.rows);
      setRowErrors(response.rowErrors || []);
      setFieldErrors(response.fieldErrors || []);
      setSummary(response.summary || null);
    } catch (error: any) {
      console.error('Failed to validate edited rows:', error);
      const message = error?.response?.data?.error || 'Error validating rows. Please review the highlighted fields.';
      alert(message);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleCommit = async (finalRows: Record<string, any>[]) => {
    if (!finalRows.length) {
      alert('No rows to commit.');
      return;
    }

    setCommitLoading(true);
    try {
      const response = await commitUploadData({
        rows: finalRows,
        filename: uploadedFile?.name
      });
      const { inserted, updated, skipped, errors } = response;
      alert(`Commit complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
      const refreshedLogs = await fetchAdminLogs();
      setLogs(refreshedLogs.filter((log) => log.action === 'UPLOAD' || log.action === 'UPLOAD_PREVIEW').slice(0, 8));
    } catch (error: any) {
      console.error('Failed to commit data:', error);
      const rowErrorMessage = error?.response?.data?.rowErrors?.[0]?.messages?.join('; ');
      alert(rowErrorMessage || 'Error committing data. Please try again.');
    } finally {
      setCommitLoading(false);
    }
  };

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
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{ margin: 0, fontSize: 34, color: '#2D2926' }}>Upload Data</h1>
        <p style={{ margin: 0, color: '#534B45', maxWidth: 780, lineHeight: 1.5 }}>
          Import alumni career outcome data, review the parsed rows, validate issues, and commit the final upload.
        </p>
      </header>

      <section
        style={{
          border: `1px solid ${warmBorder}`,
          borderRadius: 18,
          background: '#fff',
          padding: 20,
          boxShadow: '0 2px 10px rgba(45, 41, 38, 0.05)'
        }}
      >
        {activeView === 'upload' && (
          <UploadComponent onFileUpload={handleFileUpload} setFile={setUploadedFile} />
        )}

        {activeView === 'preview' && uploadedFile && (
          <PreviewComponent
            file={uploadedFile}
            rawHeaders={rawHeaders}
            rawRows={rawRows}
            columns={columns}
            rows={rows}
            mapping={mapping}
            requiredFields={requiredFields}
            fieldErrors={fieldErrors}
            rowErrors={rowErrors}
            uploadSummary={uploadSummary}
            summary={summary}
            onValidateMapping={handleValidateMapping}
            onRevalidate={handleRevalidate}
            onCommit={handleCommit}
            validationLoading={validationLoading}
            commitLoading={commitLoading}
          />
        )}
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
          <h2 style={{ margin: 0, color: '#2D2926' }}>Upload Log</h2>
          <p style={{ margin: '6px 0 0', color: '#6B625B' }}>
            Recent upload previews and committed import activity.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.length ? (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(110px, 150px) 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  border: `1px solid ${warmBorder}`,
                  borderRadius: 16,
                  padding: 16,
                  background: '#fff'
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
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4
                  }}
                >
                  {log.action}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ color: '#2D2926' }}>{log.description}</strong>
                  <small style={{ color: '#6B625B' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </small>
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: '#F5F3EF',
                    color: '#534B45',
                    border: `1px solid ${warmBorder}`,
                    fontWeight: 700,
                    maxWidth: 280,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={log.target}
                >
                  {log.target}
                </div>
              </div>
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
              No upload activity available yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UploadPreview;
