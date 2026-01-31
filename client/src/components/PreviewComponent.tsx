import React, { useState } from 'react';
import styles from '../styles/PreviewComponent.module.css';
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

    const displayColumns = columns.length
        ? columns
        : rows[0]
            ? Object.keys(rows[0])
            : [];

    const showErrors = rowErrors.length > 0;
    const previewRows = rows.slice(0, 50);

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
            {summary && (
                <div>
                    <strong>Preview Summary:</strong> {summary.validRows} valid / {summary.invalidRows} invalid (total {summary.totalRows})
                    {summary.missingColumns.length > 0 && (
                        <div>Missing columns: {summary.missingColumns.join(', ')}</div>
                    )}
                </div>
            )}
            {displayColumns.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            {displayColumns.map((col) => (
                                <th key={col}>{col}</th>
                            ))}
                            {showErrors && <th>Row Errors</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {previewRows.map((row, idx) => {
                            const rowIndex = idx + 1;
                            const errors = errorMap.get(rowIndex);
                            return (
                                <tr key={rowIndex}>
                                    <td>{rowIndex}</td>
                                    {displayColumns.map((col) => (
                                        <td key={`${rowIndex}-${col}`}>{row[col] ?? ''}</td>
                                    ))}
                                    {showErrors && <td>{errors ? errors.join('; ') : ''}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            {rows.length > previewRows.length && (
                <div>Showing first {previewRows.length} rows.</div>
            )}
        </div>

        {/* Action button */}
        <div className={styles['action-btn']}>
            {tab === 'mapping' && <button className={styles['gold-btn']}>Validate →</button>}
            {tab === 'validation' && <button className={styles['gold-btn']}>Preview →</button>}
            {tab === 'preview' && (
                <button
                    className={styles['gold-btn']}
                    onClick={onCommit}
                    disabled={commitLoading}
                >
                    {commitLoading ? 'Uploading…' : 'Upload →'}
                </button>
            )}
        </div>
    </section>
  );
};

export default PreviewComponent;
