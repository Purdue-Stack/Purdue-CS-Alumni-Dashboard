# Feature Map (from PDFs)

Legend: **done** = implemented end-to-end; **partial** = UI or backend exists but not connected or incomplete; **missing** = no implementation found.

| Requirement | Status | Frontend files | Backend endpoints/controllers | Models / DB tables | Notes |
| --- | --- | --- | --- | --- | --- |
| Homepage with highlight stats + entry points | partial | `client/src/pages/Home.tsx` | none | (future) `alumni` | UI only; no live stats wired. |
| Data exploration (Outcome/Salary/Top Placements/Grad School) + filters/charts | partial | `client/src/pages/Dashboard.tsx`, `client/src/components/USMapD3.tsx`, `client/src/components/DashboardComponents.tsx` | none | `alumni` | Static datasets only; needs aggregates. |
| Internship Outcome Explorer | missing | none | none | missing (`internship`) | No UI, controller, or model. |
| Alumni Directory (opt-in profiles) | missing | none | none | missing (`alumni` + profile fields) | No UI or data model for opt-in profiles. |
| Mentorship tool (mentor directory, templates, request tracker) | partial | `client/src/pages/RequestForm.tsx` | **Expected** mentorship endpoints (none found) | missing (`mentorship_requests`) | Current UI is a basic request form; no directory/tracker. |
| Data upload via CSV/API + validation/dedup + tagging | partial | `client/src/pages/UploadPreview.tsx`, `client/src/components/UploadComponent.tsx`, `client/src/components/PreviewComponent.tsx` | `POST /api/upload-excel`, `POST /api/commit-upload` | `alumni`, `admin_logs` | Validation + dedupe exists; tagging not implemented. |
| Alumni profile moderation (approve/edit/anonymize/visibility) | partial | `client/src/pages/AdminAlumniTable.tsx` | none | `alumni` | Admin table is read-only; no moderation actions. |
| Request approval (mentorship) | missing | none | none | missing (`mentorship_requests`) | Sprint plan mentions Google Forms/App Script intake. |
| Analytics / Admin homepage (stats + logs) | missing | none | none | `admin_logs` exists | No admin analytics UI. |
| Export & reporting (PDF/CSV) | missing | none | none | `alumni`, `admin_logs` | No export controller/route/UI. |
| Audit logging (uploads/edits/approvals/exports) | partial | none | `server/src/models/logModel.ts`, `server/src/controllers/logController.ts` (admin logs API exists) | `admin_logs` | Upload preview/commit logs implemented; others missing. |
| Purdue SSO authentication | missing | none | none | none | No auth implementation. |
| Data models per sprint plan (alumni, internship, mentorship, admin logs) | partial | n/a | n/a | `alumni`, `admin_logs` only | `internship` + `mentorship_requests` missing. |
