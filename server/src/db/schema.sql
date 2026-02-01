CREATE TABLE IF NOT EXISTS alumni (
  alumni_id SERIAL PRIMARY KEY,
  "First Name" TEXT NOT NULL,
  "Last Name" TEXT NOT NULL,
  "Graduation Year" INTEGER NOT NULL,
  "Graduation Term" TEXT,
  "Outcome Type" TEXT,
  "Employer" TEXT,
  "Job Title" TEXT,
  "Expected Field of Study" TEXT,
  "Degree Seeking" TEXT,
  "University" TEXT,
  "City" TEXT,
  "State" TEXT,
  "Base Salary" NUMERIC,
  "Signing Bonus" NUMERIC,
  "Relocation Reimbursement" NUMERIC,
  "Student ID" BIGINT,
  "Degree Level" TEXT,
  "Salary Pay Period" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  target TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  purdue_id TEXT NOT NULL,
  mentorship_consent TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT NOT NULL,
  mentorship_areas TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS alumni_grad_year_idx ON alumni ("Graduation Year");
CREATE INDEX IF NOT EXISTS alumni_grad_term_idx ON alumni ("Graduation Term");
CREATE INDEX IF NOT EXISTS alumni_outcome_type_idx ON alumni ("Outcome Type");
CREATE INDEX IF NOT EXISTS alumni_degree_seeking_idx ON alumni ("Degree Seeking");
CREATE INDEX IF NOT EXISTS alumni_degree_level_idx ON alumni ("Degree Level");
CREATE INDEX IF NOT EXISTS alumni_salary_period_idx ON alumni ("Salary Pay Period");
CREATE INDEX IF NOT EXISTS alumni_employer_idx ON alumni ("Employer");
CREATE INDEX IF NOT EXISTS alumni_job_title_idx ON alumni ("Job Title");
CREATE INDEX IF NOT EXISTS alumni_expected_field_idx ON alumni ("Expected Field of Study");
CREATE INDEX IF NOT EXISTS alumni_university_idx ON alumni ("University");
CREATE INDEX IF NOT EXISTS alumni_city_idx ON alumni ("City");
CREATE INDEX IF NOT EXISTS alumni_state_idx ON alumni ("State");
CREATE INDEX IF NOT EXISTS alumni_name_grad_idx ON alumni ("Last Name", "First Name", "Graduation Year");
CREATE UNIQUE INDEX IF NOT EXISTS alumni_student_id_unique
  ON alumni ("Student ID") WHERE "Student ID" IS NOT NULL;

CREATE INDEX IF NOT EXISTS admin_logs_action_idx ON admin_logs (action);
CREATE INDEX IF NOT EXISTS admin_logs_timestamp_idx ON admin_logs (timestamp);

CREATE INDEX IF NOT EXISTS mentorship_requests_status_idx ON mentorship_requests (status);
CREATE INDEX IF NOT EXISTS mentorship_requests_created_idx ON mentorship_requests (created_at);
