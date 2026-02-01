# API Contract (from frontend)

Source of truth: client API usage in `client/src/api/api.ts` and page components.

## Base URL
- Axios instance uses `baseURL: /api` in `client/src/api/api.ts`.

## POST /api/upload-excel
- **Used in**: `client/src/pages/UploadPreview.tsx` (handleFileUpload)
- **Request**: `multipart/form-data`
  - Field: `file` (File)
- **Response shape expected by UI**:
  - `{ columns: string[]; rows: Record<string, any>[]; rowErrors?: { rowIndex: number; messages: string[] }[]; summary?: { totalRows: number; validRows: number; invalidRows: number; missingColumns: string[] } }`
  - `columns`, `rows`, `rowErrors`, and `summary` are stored in state and passed to `PreviewComponent`.
- **Notes**: No client-side schema validation; errors trigger an alert.

## POST /api/commit-upload
- **Used in**: `client/src/pages/UploadPreview.tsx` (handleCommit)
- **Request**: JSON body
  - `rows: Record<string, any>[]`
  - `filename?: string`
- **Response shape expected by UI**:
  - `{ inserted: number; updated: number; skipped: number; errors: number }`
  - Counts are displayed via alert.

## GET /api/analytics/dashboard
- **Used in**: `client/src/pages/Dashboard.tsx` (useEffect)
- **Request**: query params
  - `graduationYears?: string` (comma-separated)
  - `majors?: string` (comma-separated)
  - `degreeLevels?: string` (comma-separated)
  - `employmentTypes?: string` (comma-separated)
  - `search?: string`
- **Response shape expected by UI**:
  - `{ outcomesByState: { state: string; value: number }[]; salaryBands: { name: string; value: number }[]; topCompanies: { name: string; value: number }[]; gradAdmissions: { name: string; value: number }[] }`

## GET /api/alumni
- **Used in**: not wired yet (foundational)
- **Request**: query params
  - `graduationYears?: string` (comma-separated)
  - `majors?: string` (comma-separated)
  - `tracks?: string` (comma-separated)
  - `search?: string`
  - `page?: number`
  - `pageSize?: number`
- **Response shape**:
  - `{ rows: Record<string, any>[]; total: number }`

## GET /api/internships
- **Used in**: not wired yet (foundational)
- **Request**: query params
  - `companies?: string` (comma-separated)
  - `roles?: string` (comma-separated)
  - `years?: string` (comma-separated)
  - `locations?: string` (comma-separated)
  - `outcomes?: string` (comma-separated)
  - `search?: string`
  - `page?: number`
  - `pageSize?: number`
- **Response shape**:
  - `{ rows: Record<string, any>[]; total: number }`

## GET /api/mentors
- **Used in**: not wired yet (foundational)
- **Request**: query params
  - `tracks?: string` (comma-separated)
  - `roles?: string` (comma-separated)
  - `locations?: string` (comma-separated)
  - `availability?: string` (comma-separated)
  - `areas?: string` (comma-separated)
  - `search?: string`
  - `page?: number`
  - `pageSize?: number`
- **Response shape**:
  - `{ rows: Record<string, any>[]; total: number }`

## GET /api/admin/alumni
- **Used in**: `client/src/pages/AdminAlumniTable.tsx` (useEffect fetch)
- **Request**: none (optional query params for paging/search)
- **Response shape expected by UI**:
  - `{ rows: Record<string, any>[]; total: number }`

## POST /request
- **Used in**: `client/src/pages/RequestForm.tsx` (handleSubmit)
- **Request**: JSON body
  - `firstName: string`
  - `lastName: string`
  - `purdueId: string | number`
  - `mentorshipConsent: "Yes" | "No"`
  - `email: string`
  - `linkedin: string`
  - `mentorshipAreas: string[]`
- **Response shape expected by UI**: none (success triggers a generic alert)
- **Notes**: This call does not use the `/api` base URL.

## GET /api/admin/mentorship/requests
- **Used in**: not wired yet (admin tooling)
- **Request**: none
- **Response shape**: `MentorshipRequest[]`

## POST /api/admin/mentorship/requests/:id/approve
- **Used in**: not wired yet (admin tooling)
- **Response shape**: `{ message: string }`

## POST /api/admin/mentorship/requests/:id/deny
- **Used in**: not wired yet (admin tooling)
- **Response shape**: `{ message: string }`

## GET /api/admin/export
- **Used in**: not wired yet (admin tooling)
- **Request**: same filters as `/api/alumni` (optional)
- **Response shape**: CSV download
