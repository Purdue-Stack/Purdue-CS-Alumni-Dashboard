# Backlog (PDF-aligned vertical slices)

Ordered by dependencies. Each slice lists acceptance criteria and candidate files to edit/create.

## Slice 1 — Dashboard analytics (live aggregates)
**Acceptance criteria**
- Outcome/Salary/Top Placements/Grad School views fetch live aggregates.
- Filters (major, track, graduation year, residency, company/role, location) are applied server-side.
- Charts and stat blocks render real values with no console errors.

**Files to edit/create**
- `client/src/pages/Dashboard.tsx`
- `client/src/components/USMapD3.tsx`
- `client/src/api/api.ts`
- `server/src/routes/analytics.ts` (new)
- `server/src/controllers/analyticsController.ts` (new)
- `server/src/models/alumniModel.ts`

## Slice 2 — Mentorship requests + admin review
**Acceptance criteria**
- Alumni can submit mentorship requests and receive success/failure feedback.
- Requests persist in `mentorship_requests` table.
- Admin can approve/deny via endpoints; actions are logged to `admin_logs`.

**Files to edit/create**
- `client/src/pages/RequestForm.tsx`
- `client/src/api/api.ts`
- `server/src/routes/mentorship.ts` (new)
- `server/src/controllers/mentorshipController.ts` (new)
- `server/src/models/mentorshipRequestModel.ts` (new)
- `server/src/db/schema.sql`
- `server/src/models/logModel.ts`

## Slice 3 — Export & reporting (CSV)
**Acceptance criteria**
- `GET /api/admin/export` returns CSV with filters matching admin list.
- Export writes a log entry to `admin_logs`.

**Files to edit/create**
- `server/src/routes/export.ts` (new)
- `server/src/controllers/exportController.ts` (new)
- `server/src/models/alumniModel.ts`
- `server/src/models/logModel.ts`
- `client/src/api/api.ts` (if UI uses an export action)

## Slice 4 — Moderation + profile controls
**Acceptance criteria**
- Admin can approve/edit/anonymize and set field visibility.
- Changes persist to DB and are logged.

**Files to edit/create**
- `client/src/pages/AdminAlumniTable.tsx`
- `server/src/routes/admin.ts` or `server/src/routes/moderation.ts` (new)
- `server/src/controllers/adminController.ts` (new)
- `server/src/models/alumniModel.ts`
- `server/src/models/logModel.ts`

## Slice 5 — Internship outcome explorer + alumni directory
**Acceptance criteria**
- Internship explorer shows downstream outcomes and “Where did they go after X company?”.
- Alumni directory supports opt-in profiles with LinkedIn, employer, position, location, and insights.

**Files to edit/create**
- `client/src/pages/InternshipExplorer.tsx` (new)
- `client/src/pages/AlumniDirectory.tsx` (new)
- `client/src/routes/index.tsx`
- `server/src/routes/internship.ts` (new)
- `server/src/routes/alumni.ts` (new)
- `server/src/controllers/internshipController.ts` (new)
- `server/src/controllers/alumniController.ts` (extend)
- `server/src/models/internshipModel.ts` (new)

## Slice 6 — Auth + admin homepage
**Acceptance criteria**
- Purdue SSO integration stubs and protected admin routes.
- Admin homepage shows key stats + recent logs.

**Files to edit/create**
- `server/src/routes/auth.ts` (new)
- `server/src/middleware/auth.ts` (new)
- `client/src/pages/AdminAnalytics.tsx` (new)
- `server/src/controllers/analyticsController.ts` (extend)
- `server/src/models/logModel.ts`
