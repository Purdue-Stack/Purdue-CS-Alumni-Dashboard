import { useState } from "react";
import "../styles/AdminUpload1.css";

interface LogRow {
  id: number;
  user: string;
  time: string;
  label: string;
}

const logRows: LogRow[] = [
  { id: 1, user: "John Langenkamp", time: "Yesterday, 4:00 PM", label: "2024 Fall Data" },
  { id: 2, user: "Bob Paden",        time: "04/12/2025, 4:00 PM", label: "2023 Salary Updates" },
  { id: 3, user: "Bob Paden",        time: "04/12/2025, 4:00 PM", label: "2025 Alumni Info"    },
  { id: 4, user: "Bob Paden",        time: "04/12/2025, 4:00 PM", label: "2025 Alumni Info"    },
  { id: 5, user: "Bob Paden",        time: "04/12/2025, 4:00 PM", label: "2025 Alumni Info"    },
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="admin-page">
      {/* ------------- sidebar ------------- */}
      <aside className="sidebar">
        <div className="sidebar__item active">Upload Data</div>
        <div className="sidebar__item">Moderate Entries</div>
        <div className="sidebar__item">Analytics</div>
        <div className="sidebar__item">User Permissions</div>
      </aside>

      {/* ------------- main column ------------- */}
      <main className="upload-page">
        <div className="upload-page__content">
          {/* header */}
          <div className="upload-header">
            <div className="upload-title">
              <h1>Upload Data</h1>
              <p>Import and manage alumni career outcome data</p>
            </div>
            <div className="user-info">
              <img src="https://placehold.co/40" alt="avatar John L" />
              <span className="user-name">JOHN L</span>
            </div>
          </div>

          {/* upload card */}
          <section className="upload-container">
            <span className="upload-note">Supported Formats: CSV, Excel</span>

            <label htmlFor="fileInput" className="upload-dropzone">
              <p className="drop-title">Drag and drop your file here</p>
              <p className="drop-sub">or click to browse</p>
              <input
                id="fileInput"
                type="file"
                className="file-input"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="upload-file">
                  Chosen File: <strong>{file.name}</strong>
                </p>
              )}
            </label>

            <div className="upload-actions">
              <button type="button" className="btn btn--cancel">Cancel</button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!file}
              >
                Upload Data&nbsp; →
              </button>
            </div>
          </section>

          {/* log */}
          <section className="upload-log">
            <h2>Upload Log</h2>
            <p>See past logging activity</p>

            <ul className="log-card">
              {logRows.map(r => (
                <li key={r.id} className="log-list__item">
                  <div className="log-avatar" />
                  <div className="log-text">
                    <strong>{r.user}</strong>
                    <span className="log-time">{r.time}</span>
                  </div>
                  <button type="button" className="log-file">{r.label}</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
