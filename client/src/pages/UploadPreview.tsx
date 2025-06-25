import React, { useState } from 'react';
import '../styles/UploadPreview.css';
import uploadIcon from '../assets/icons/upload-data.svg';
import moderateIcon from '../assets/icons/moderate-entries.svg';
import analyticsIcon from '../assets/icons/analytics.svg';
import userIcon from '../assets/icons/user-permissions.svg';

type Tab = 'mapping' | 'validation' | 'preview';

const UploadPreview: React.FC = () => {
  const [tab, setTab] = useState<Tab>('mapping');

  return (
    <div className="upload-page">
    {/* Sidebar */}
    <aside className="sidebar">
        <ul>
            <li className="active">
                <img src={uploadIcon} alt="" className="sidebar-icon" />
                <div>Upload Data</div>
            </li>
            <li>
                <img src={moderateIcon} alt="" className="sidebar-icon" />
                <div>Moderate Entries</div>
            </li>
            <li>
                <img src={analyticsIcon} alt="" className="sidebar-icon" />
                <div>Analytics</div>
            </li>
            <li>
                <img src={userIcon} alt="" className="sidebar-icon" />
                <div>User Permissions</div>
            </li>
        </ul>
    </aside>

    {/* Main content */}
    <div className="main">
        {/* Header */}
        <header className="page-header">
        <div>
            <h1>Upload Data</h1>
            <p>Import and manage alumni career outcome data</p>
        </div>
        <div className="profile">
            <div className="avatar" />
            <span>JOHN L</span>
        </div>
        </header>

        <div className='content-box'>
            <div className='dotted-box'>
                {/* Dataset Selector Box */}
                <div className="dataset-box">
                    <span>Chosen Dataset:</span>
                    <div className="dataset-chip">
                        <img src="logo.png" alt="Logo" />
                        <span>2024 Fall Dataset</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <nav className="tabs">
            <button
                className={tab === 'mapping' ? 'active' : ''}
                onClick={() => setTab('mapping')}
            >
                Field Mapping
            </button>
            <button
                className={tab === 'validation' ? 'active' : ''}
                onClick={() => setTab('validation')}
            >
                Validation
            </button>
            <button
                className={tab === 'preview' ? 'active' : ''}
                onClick={() => setTab('preview')}
            >
                Preview
            </button>
            </nav>

            {/* Table placeholder */}
            <div className="table-placeholder">
            {/* Table goes here */}
            </div>

            {/* Action button */}
            <div className="action-btn">
            {tab === 'mapping' && <button className="gold-btn">Validate →</button>}
            {tab === 'validation' && <button className="gold-btn">Preview →</button>}
            {tab === 'preview' && <button className="gold-btn">Upload →</button>}
            </div>
        </div>
        

        {/* Upload Log */}
        <section className="upload-log">
        <h2>Upload Log</h2>
        <p>See past logging activity</p>
        <div className="log-table">
            <div className="log-row">
            <div className="log-avatar" />
            <div className="log-info">
                <strong>John Langenkamp</strong>
                <small>Yesterday, 4:00 PM</small>
            </div>
            <button className="csv-btn">2024 Fall Data</button>
            </div>
            <div className="log-row">
            <div className="log-avatar" />
            <div className="log-info">
                <strong>Bob Paden</strong>
                <small>04/12/2025, 4:00 PM</small>
            </div>
            <button className="csv-btn">2023 Salary Updates</button>
            </div>
            {/* add more .log-row as needed */}
        </div>
        </section>
    </div>
    </div>
  );
};

export default UploadPreview;