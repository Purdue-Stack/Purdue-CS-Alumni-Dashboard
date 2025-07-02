import React, { useState } from 'react';
import styles from '../styles/UploadPreview.module.css';
import uploadIcon from '../assets/icons/upload-data.svg';
import moderateIcon from '../assets/icons/moderate-entries.svg';
import analyticsIcon from '../assets/icons/analytics.svg';
import userIcon from '../assets/icons/user-permissions.svg';
import csvIcon from '../assets/icons/csv.svg';

type Tab = 'mapping' | 'validation' | 'preview';

const UploadPreview: React.FC = () => {
  const [tab, setTab] = useState<Tab>('mapping');

// Array of log data
const logData = [
    { name: 'John Langenkamp', date: 'Yesterday, 4:00 PM', file: '2024 Fall Data' },
    { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
    { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
    { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' },
    { name: 'Bob Paden', date: '04/12/2025, 4:00 PM', file: '2023 Salary Updates' }
  ];

  return (
    <div className={styles['upload-page']}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <ul>
          <li className={styles.active}>
            <img src={uploadIcon} alt="" className={styles['sidebar-icon']} />
            <div>Upload Data</div>
          </li>
          <li>
            <img src={moderateIcon} alt="" className={styles['sidebar-icon']} />
            <div>Moderate Entries</div>
          </li>
          <li>
            <img src={analyticsIcon} alt="" className={styles['sidebar-icon']} />
            <div>Analytics</div>
          </li>
          <li>
            <img src={userIcon} alt="" className={styles['sidebar-icon']} />
            <div>User Permissions</div>
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
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
          <div className={styles['dotted-box']}>
            {/* Dataset Selector Box */}
            <div className={styles['dataset-box']}>
              <span>Chosen Dataset:</span>
              <div className={styles['dataset-chip']}>
                <img src={csvIcon} alt="" />
                <span>2024 Fall Dataset</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className={styles.tabs}>
            <button
              className={tab === 'mapping' ? styles.active : ''}
              onClick={() => setTab('mapping')}
            >
              Field Mapping
            </button>
            <button
              className={tab === 'validation' ? styles.active : ''}
              onClick={() => setTab('validation')}
            >
              Validation
            </button>
            <button
              className={tab === 'preview' ? styles.active : ''}
              onClick={() => setTab('preview')}
            >
              Preview
            </button>
          </nav>

          {/* Table placeholder */}
          <div className={styles['table-placeholder']}>
            {/* Table goes here */}
          </div>

          {/* Action button */}
          <div className={styles['action-btn']}>
            {tab === 'mapping' && <button className={styles['gold-btn']}>Validate →</button>}
            {tab === 'validation' && <button className={styles['gold-btn']}>Preview →</button>}
            {tab === 'preview' && <button className={styles['gold-btn']}>Upload →</button>}
          </div>
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
    </div>
  );
};

export default UploadPreview;