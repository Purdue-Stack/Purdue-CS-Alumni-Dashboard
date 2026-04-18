import React, { useEffect, useState } from 'react';
import styles from '../styles/UploadPreview.module.css';
import UploadComponent from '../components/UploadComponent'
import PreviewComponent from '../components/PreviewComponent';
import api, { fetchAdminLogs, type AdminLog } from '../api/api';

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
      const response = await api.post('/upload-excel', formData, { //check api endpoint
        headers: {
          'Content-Type': 'multipart/form-data', // check if this is needed
        },
      });
  
      const { columns, rows, rowErrors, summary } = response.data;
  
      setColumns(columns);
      setRows(rows);
      setRowErrors(rowErrors || []);
      setSummary(summary || null);
  
      // File parsed successfully — switch view to preview
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
      // Main Upload Content
      <div>
        {/* Header */}
        <header className={styles['page-header']}>
          <div>
            <h1>Upload Data</h1>
            <p>Import and manage alumni career outcome data</p>
          </div>
          <div className={styles.profile}>
            <div className={styles.avatar} />
            <span>JOHN L</span>
          </div>
        </header>

        <div className={styles['content-box']}>
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
        </div>

        {/* Upload Log */}
        <section className={styles['upload-log']}>
          <h1>Upload Log</h1>
          <p>See past logging activity</p>
          <div className={styles['log-table']}>
            {logs.map((log) => (
                <div key={log.id} className={styles['log-row']}>
                <div className={styles['log-avatar']} />
                <div className={styles['log-info']}>
                    <strong>{log.action}</strong>
                    <small>{new Date(log.timestamp).toLocaleString()}</small>
                </div>
                <button className={styles['csv-btn']}>{log.target}</button>
                </div>
            ))}
          </div>
        </section>
      </div>
  );
};

export default UploadPreview;
