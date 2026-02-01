# Requirements (Source of Truth: PDFs)

Sources:
- `Stack Project Proposal- John Langenkamp.pdf` (May 2025)
- `Sprint Plan.pdf`

## User features (students/advisors/visitors)
- **Homepage**
  - Purpose overview, highlight stats (# alumni tracked, industries, top companies), quick entry points (Explore Data, Find Alumni).
- **Data Exploration / Career Outcomes**
  - Outcomes by role/industry/grad education/geography/salary.
  - Salary trends by track & role (avg/median/range) for CS/DS/AI.
  - Filters: major, track, graduation year, residency, company/role, geographic location.
  - Visualizations: Sankey, bar/line, heat maps, pie charts.
  - Data exploration pages: Outcome, Salary, Top Placements, Grad School.
- **Internship Outcome Explorer**
  - Link internships to full-time outcomes or grad school; “Where did they go after X company?”.
- **Alumni Directory (opt-in)**
  - Filterable by graduation year, company, role, mentorship availability.
  - Profile fields: LinkedIn, employer, position, location, personal insights.
- **Mentorship**
  - Filterable directory of alumni mentors by track, year, role, location, availability.
  - Message templates for outreach (email/LinkedIn).
  - Mentorship Request Tracker (students track outreach efforts).

## Admin features (faculty/CCO/development)
- **Data Management Module**
  - Upload new data via CSV or API (LinkedIn scraping or Purdue4Life).
  - Validate entries (duplicates, missing fields).
  - Tag entries by track/employer/degree.
- **Alumni Profile Moderation**
  - Approve, edit, anonymize submitted info.
  - Set visibility for fields (salary/contact info).
  - Link profiles to public Alumni Explorer.
- **Request Approval**
  - Review mentorship requests (noted as Google Forms/App Script intake in sprint plan).
- **Analytics / Admin Homepage**
  - Overarching stats and recent activity logs.
- **Export & Reporting**
  - Generate PDF/CSV reports by filters; share dashboard snapshots with partners.
- **Audit Logging**
  - Log uploads, edits/approvals/denials, exports.
- **Authentication**
  - Integrate with Purdue SSO.

## Key workflows
- **Upload → validate → moderate → publish**
  1. Admin uploads CSV/API data.
  2. System validates, de-duplicates, flags missing fields.
  3. Admin moderates, approves/anonymizes, sets visibility.
  4. Data becomes visible in user dashboards and directory.
  5. Action logged.
- **User data exploration**
  1. User chooses exploration page (Outcome/Salary/Top Placements/Grad School).
  2. Applies filters; charts update.
- **Internship outcome explorer**
  1. User selects internship/company.
  2. System shows downstream outcomes (roles, companies, grad school).
- **Mentorship requests**
  1. Student browses mentors and uses templates to reach out.
  2. Student tracks outreach in request tracker.
  3. Admin reviews and approves/denies mentorship requests.
- **Export/reporting**
  1. Admin selects filters and report type (PDF/CSV).
  2. System generates report and logs export.

## Deltas vs current implementation
- **Not yet implemented in current app:**
  - Dashboard analytics using live data (charts + filters are static).
  - Mentorship request persistence + admin approval workflow.
  - Export/reporting (CSV/PDF) endpoints and UI wiring.
  - Internship outcome explorer, alumni directory, mentorship directory/request tracker.
  - Purdue SSO authentication.
  - Alumni profile moderation (approve/anonymize/visibility controls).
- **Already implemented:**
  - Admin upload preview + commit pipeline with validation and admin logs.
  - Admin alumni table backed by DB (read-only list).
