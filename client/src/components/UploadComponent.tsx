import React, { useState } from 'react';

interface UploadProps {
  onFileUpload: (file: File) => void;
  setFile: (file: File | null) => void;
}

const warmBorder = '#D9CFC0';
const softGold = 'rgba(207, 185, 145, 0.18)';

const UploadComponent: React.FC<UploadProps> = ({ onFileUpload, setFile }) => {
  const [file, setLocalFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setLocalFile(selected);
      setFile(selected);
    }
  };

  const handleUploadClick = () => {
    if (file) {
      onFileUpload(file);
      return;
    }
    alert('Please select a file');
  };

  const handleCancel = () => {
    setLocalFile(null);
    setFile(null);
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <span
        style={{
          display: 'inline-flex',
          width: 'fit-content',
          padding: '6px 10px',
          borderRadius: 999,
          background: softGold,
          color: '#534B45',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: 'uppercase'
        }}
      >
        Supported Formats: CSV, Excel
      </span>

      <label
        htmlFor="fileInput"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 280,
          padding: 32,
          borderRadius: 22,
          border: `2px dashed ${warmBorder}`,
          background: '#FFFDFC',
          cursor: 'pointer',
          gap: 10
        }}
      >
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#2D2926' }}>
          Drag and drop your file here
        </p>
        <p style={{ margin: 0, color: '#6B625B', fontSize: 16 }}>
          or click to browse from your device
        </p>
        <input
          id="fileInput"
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {file && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 999,
              background: '#F5F3EF',
              color: '#2D2926',
              border: `1px solid ${warmBorder}`,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Chosen File: <strong>{file.name}</strong>
          </div>
        )}
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: `1px solid ${warmBorder}`,
            background: '#fff',
            color: '#2D2926',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          CANCEL
        </button>
        <button
          type="button"
          disabled={!file}
          onClick={handleUploadClick}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            background: file ? '#9D7A28' : '#D9D2C4',
            color: '#fff',
            fontWeight: 700,
            cursor: file ? 'pointer' : 'not-allowed'
          }}
        >
          UPLOAD DATA →
        </button>
      </div>
    </section>
  );
};

export default UploadComponent;
