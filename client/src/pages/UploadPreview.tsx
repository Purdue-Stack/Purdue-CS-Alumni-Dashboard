import React, { useState } from 'react';
import styles from '../styles/UploadPreview.module.css';
import UploadComponent from '../components/UploadComponent'
import PreviewComponent from '../components/PreviewComponent';
import api from '../api/api';

// Array of log data
const logData = [
  { name: 'John Langenkamp', date: 'Yesterday, 4:00 PM', file: '2024 Fall Data' },
  { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
  { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
  { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
  { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' }
];

const UploadPreview: React.FC = () => {
  const [activeView, setActiveView] = useState<'upload' | 'preview'>('upload');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
  
    setLoading(true);
  
    try {
      const response = await api.post('/upload-excel', formData, { //check api endpoint
        headers: {
          'Content-Type': 'multipart/form-data', // check if this is needed
        },
      });
  
      const { columns, rows } = response.data;
  
      setColumns(columns);
      setRows(rows);
  
      // File parsed successfully — switch view to preview
      setActiveView('preview');
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Error parsing file. Please try again.');
    } finally {
      setLoading(false);
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
            />
          )}
        </div>

        {/* Upload Log */}
        <section className={styles['upload-log']}>
          <h1>Upload Log</h1>
          <p>See past logging activity</p>
          <div className={styles['log-table']}>
            {logData.map((log, index) => (
                <div key={index} className={styles['log-row']}>
                <div className={styles['log-avatar']} />
                <div className={styles['log-info']}>
                    <strong>{log.name}</strong>
                    <small>{log.date}</small>
                </div>
                <button className={styles['csv-btn']}>{log.file}</button>
                </div>
            ))}
          </div>
        </section>
      </div>
  );
};

export default UploadPreview;