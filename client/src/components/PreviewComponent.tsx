import React, { useState } from 'react';
import styles from '../styles/PreviewComponent.module.css';
import csvIcon from '../assets/icons/csv.svg';

interface PreviewProps {
    file: File;
    columns: string[];
    rows: Record<string, any>[];
}

type Tab = 'mapping' | 'validation' | 'preview';
  
const PreviewComponent: React.FC<PreviewProps> = ({ file, columns, rows }) => {
    const [tab, setTab] = useState<Tab>('mapping');

  return (
    <section className={styles['preview-container']}>
        <div className={styles['dotted-box']}>
            {/* Dataset Selector Box */}
            <div className={styles['dataset-box']}>
                <span>Chosen Dataset:</span>
                <div className={styles['dataset-chip']}>
                    <img src={csvIcon} alt="" />
                    <span>{file.name}</span>
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
    </section>
  );
};

export default PreviewComponent;