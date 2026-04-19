import React, { useEffect, useState } from 'react';
import UploadComponent from '../components/UploadComponent';
import PreviewComponent from '../components/PreviewComponent';
import api, { fetchAdminLogs, type AdminLog } from '../api/api';

const deepGold = '#9D7A28';
const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';
const offWhite = '#FFFCF7';

const UploadPreview: React.FC = () => {
  const [activeView, setActiveView] = useState<'upload' | 'preview'>('upload');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [rowErrors, setRowErrors] = useState<{ rowIndex: number; messages: string[] }[]>([]);
  const [summary, setSummary] = useState<{ totalRows: number; validRows: number; invalidRows: number; missingColumns: string[] } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { columns, rows, rowErrors, summary } = response.data;
      setColumns(columns);
      setRows(rows);
      setRowErrors(rowErrors || []);
      setSummary(summary || null);
      setActiveView('preview');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Error parsing file. Please try again.');
    }
  };

  const handleCommit = async () => {
    if (!rows.length) {
      alert('No rows to commit.');
      return;
    }

    setCommitLoading(true);
    try {
      const response = await api.post('/commit-upload', {
        rows,
        filename: uploadedFile?.name
      });
      const { inserted, updated, skipped, errors } = response.data;
      alert(`Commit complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
      const refreshedLogs = await fetchAdminLogs();
      setLogs(refreshedLogs.filter((log) => log.action === 'UPLOAD' || log.action === 'UPLOAD_PREVIEW').slice(0, 8));
    } catch (error) {
      console.error('Failed to commit data:', error);
      alert('Error committing data. Please try again.');
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
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {[
            { key: 'upload', label: 'Upload' },
            { key: 'preview', label: 'Preview' }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === 'upload') {
                  setActiveView('upload');
                }
                if (item.key === 'preview' && uploadedFile) {
                  setActiveView('preview');
                }
              }}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '8px 14px',
                background: activeView === item.key ? deepGold : softGold,
                color: activeView === item.key ? '#fff' : '#2D2926',
                fontWeight: 700,
                cursor: item.key === 'preview' && !uploadedFile ? 'not-allowed' : 'pointer',
                opacity: item.key === 'preview' && !uploadedFile ? 0.5 : 1
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeView === 'upload' && (
          <UploadComponent onFileUpload={handleFileUpload} setFile={setUploadedFile} />
        )}

        {activeView === 'preview' && uploadedFile && (
          <PreviewComponent
            file={uploadedFile}
            columns={columns}
            rows={rows}
            rowErrors={rowErrors}
            summary={summary}
            onCommit={handleCommit}
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
