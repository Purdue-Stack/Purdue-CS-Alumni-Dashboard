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
  "Track" TEXT,
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
  is_approved BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  is_anonymized BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
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
  is_approved BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_anonymized BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mentorship_directory (
  id SERIAL PRIMARY KEY,
  alumni_id INTEGER,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin TEXT,
  role TEXT,
  track TEXT,
  location_city TEXT,
  location_state TEXT,
  availability TEXT,
  mentorship_areas TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  is_anonymized BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  alumni_id INTEGER,
  company TEXT,
  role TEXT,
  internship_year INTEGER,
  location_city TEXT,
  location_state TEXT,
  outcome_company TEXT,
  outcome_role TEXT,
  outcome_type TEXT,
  is_approved BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  is_anonymized BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE INDEX IF NOT EXISTS mentors_track_idx ON mentorship_directory (track);
CREATE INDEX IF NOT EXISTS mentors_role_idx ON mentorship_directory (role);
CREATE INDEX IF NOT EXISTS mentors_location_idx ON mentorship_directory (location_state);
CREATE INDEX IF NOT EXISTS mentors_visibility_idx ON mentorship_directory (is_visible, is_deleted, is_approved);

CREATE INDEX IF NOT EXISTS internships_company_idx ON internships (company);
CREATE INDEX IF NOT EXISTS internships_role_idx ON internships (role);
CREATE INDEX IF NOT EXISTS internships_year_idx ON internships (internship_year);
CREATE INDEX IF NOT EXISTS internships_location_idx ON internships (location_state);
CREATE INDEX IF NOT EXISTS internships_outcome_company_idx ON internships (outcome_company);
CREATE INDEX IF NOT EXISTS internships_outcome_role_idx ON internships (outcome_role);
CREATE INDEX IF NOT EXISTS internships_visibility_idx ON internships (is_visible, is_deleted, is_approved);

ALTER TABLE alumni ADD COLUMN IF NOT EXISTS "Track" TEXT;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT false;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS alumni_track_idx ON alumni ("Track");
CREATE INDEX IF NOT EXISTS alumni_visibility_idx ON alumni (is_visible, is_deleted, is_approved);

ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT false;
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE mentorship_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS mentorship_requests_visibility_idx ON mentorship_requests (is_visible, is_deleted, is_approved);

ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

INSERT INTO internships (company, role, internship_year, location_city, location_state, outcome_company, outcome_role, outcome_type)
SELECT 'Google', 'SWE Intern', 2023, 'Mountain View', 'CA', 'Google', 'Software Engineer', 'Full Time'
WHERE NOT EXISTS (
  SELECT 1 FROM internships WHERE company = 'Google' AND role = 'SWE Intern' AND internship_year = 2023
);

INSERT INTO internships (company, role, internship_year, location_city, location_state, outcome_company, outcome_role, outcome_type)
SELECT 'Amazon', 'Data Science Intern', 2022, 'Seattle', 'WA', 'Amazon', 'Data Scientist', 'Full Time'
WHERE NOT EXISTS (
  SELECT 1 FROM internships WHERE company = 'Amazon' AND role = 'Data Science Intern' AND internship_year = 2022
);

INSERT INTO mentorship_directory (first_name, last_name, email, linkedin, role, track, location_city, location_state, availability, mentorship_areas)
SELECT 'Alice', 'Smith', 'alice.mentor@example.com', 'https://linkedin.com/in/alice-mentor', 'Software Engineer', 'CS', 'West Lafayette', 'IN', 'Ongoing', ARRAY['Resume Reviews','Career Chats']
WHERE NOT EXISTS (
  SELECT 1 FROM mentorship_directory WHERE email = 'alice.mentor@example.com'
);

INSERT INTO mentorship_directory (first_name, last_name, email, linkedin, role, track, location_city, location_state, availability, mentorship_areas)
SELECT 'Bob', 'Lee', 'bob.mentor@example.com', 'https://linkedin.com/in/bob-mentor', 'Data Scientist', 'DS', 'Chicago', 'IL', 'One-time', ARRAY['Mock Interviews']
WHERE NOT EXISTS (
  SELECT 1 FROM mentorship_directory WHERE email = 'bob.mentor@example.com'
);

INSERT INTO mentorship_requests (first_name, last_name, purdue_id, mentorship_consent, email, linkedin, mentorship_areas)
SELECT 'Seed', 'Requester', '99999999', 'Yes', 'seed.requester@example.com', 'https://linkedin.com/in/seed-requester', ARRAY['Career Chats']
WHERE NOT EXISTS (
  SELECT 1 FROM mentorship_requests WHERE email = 'seed.requester@example.com'
);
