import React, { useState } from 'react';
import styles from '../styles/UploadComponent.module.css';

interface UploadProps {
    onFileUpload: (file: File) => void;
    setFile: (file: File) => void;
}
  
const UploadComponent: React.FC<UploadProps> = ({ onFileUpload, setFile }) => {
    const [file, setLocalFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
        setLocalFile(selected);
        setFile(selected); // notify parent
        }
    };

    const handleUploadClick = () => {
        if (file) {
        onFileUpload(file);
        } else {
        alert('Please select a file');
        }
    };

    return (
        <section>
            <span className={styles["upload-note"]}>Supported Formats: CSV, Excel</span>

            <label htmlFor="fileInput" className={styles['upload-dropzone']}>
              <p className={styles["drop-title"]}>Drag and drop your file here</p>
              <p className={styles["drop-sub"]}>or click to browse</p>
              <input
                id="fileInput"
                type="file"
                className={styles["file-input"]}
                onChange={handleFileChange}
              />
              {file && (
                <p className={styles["upload-file"]}>
                  Chosen File: <strong>{file.name}</strong>
                </p>
              )}
            </label>

            <div className={styles["upload-actions"]}>
              <button type="button" className={`${styles.btn} ${styles["btn--cancel"]}`}>CANCEL</button>
              <button
                type="button"
                className={`${styles.btn} ${styles["btn--primary"]}`}
                disabled={!file}
                onClick={handleUploadClick}
              >
                UPLOAD DATA&nbsp; →
              </button>
            </div>
          </section>
    );
};

export default UploadComponent;