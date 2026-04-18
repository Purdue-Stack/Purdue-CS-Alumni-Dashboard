BEGIN;

DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS mentorship_directory CASCADE;
DROP TABLE IF EXISTS mentorship_requests CASCADE;
DROP TABLE IF EXISTS alumni CASCADE;

CREATE TABLE alumni (
  alumni_id SERIAL PRIMARY KEY,
  "First Name" TEXT NOT NULL,
  "Last Name" TEXT NOT NULL,
  "Graduation Year" INTEGER NOT NULL CHECK ("Graduation Year" BETWEEN 2015 AND 2035),
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
  "Email" TEXT,
  "LinkedIn" TEXT,
  mentorship_opt_in BOOLEAN NOT NULL DEFAULT false,
  mentorship_status TEXT NOT NULL DEFAULT 'none' CHECK (mentorship_status IN ('none', 'pending', 'approved', 'denied')),
  mentorship_areas TEXT[] NOT NULL DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_directory_visible BOOLEAN NOT NULL DEFAULT false,
  is_anonymized BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mentorship_directory (
  id SERIAL PRIMARY KEY,
  alumni_id INTEGER NOT NULL REFERENCES alumni(alumni_id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  linkedin TEXT,
  role TEXT,
  track TEXT,
  location_city TEXT,
  location_state TEXT,
  mentorship_areas TEXT[] NOT NULL DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_anonymized BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  alumni_id INTEGER REFERENCES alumni(alumni_id) ON DELETE SET NULL,
  company TEXT,
  role TEXT,
  internship_year INTEGER,
  location_city TEXT,
  location_state TEXT,
  outcome_company TEXT,
  outcome_role TEXT,
  outcome_type TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_anonymized BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL CHECK (action IN ('UPLOAD_PREVIEW', 'UPLOAD', 'EDIT', 'APPROVE', 'DENY', 'EXPORT')),
  description TEXT NOT NULL,
  target TEXT NOT NULL
);

CREATE UNIQUE INDEX alumni_student_id_unique
  ON alumni ("Student ID")
  WHERE "Student ID" IS NOT NULL;

CREATE INDEX alumni_grad_year_idx ON alumni ("Graduation Year");
CREATE INDEX alumni_outcome_type_idx ON alumni ("Outcome Type");
CREATE INDEX alumni_degree_level_idx ON alumni ("Degree Level");
CREATE INDEX alumni_expected_field_idx ON alumni ("Expected Field of Study");
CREATE INDEX alumni_track_idx ON alumni ("Track");
CREATE INDEX alumni_employer_idx ON alumni ("Employer");
CREATE INDEX alumni_job_title_idx ON alumni ("Job Title");
CREATE INDEX alumni_city_idx ON alumni ("City");
CREATE INDEX alumni_state_idx ON alumni ("State");
CREATE INDEX alumni_visibility_idx ON alumni (is_visible, is_deleted, is_approved);
CREATE INDEX alumni_directory_visibility_idx ON alumni (is_directory_visible, is_visible, is_deleted);
CREATE INDEX alumni_mentorship_status_idx ON alumni (mentorship_opt_in, mentorship_status);

CREATE UNIQUE INDEX mentorship_directory_alumni_unique ON mentorship_directory (alumni_id);
CREATE INDEX mentors_track_idx ON mentorship_directory (track);
CREATE INDEX mentors_role_idx ON mentorship_directory (role);
CREATE INDEX mentors_location_idx ON mentorship_directory (location_state);
CREATE INDEX mentors_visibility_idx ON mentorship_directory (is_visible, is_deleted, is_approved);

CREATE INDEX internships_company_idx ON internships (company);
CREATE INDEX internships_role_idx ON internships (role);
CREATE INDEX internships_year_idx ON internships (internship_year);
CREATE INDEX internships_location_idx ON internships (location_state);
CREATE INDEX internships_outcome_company_idx ON internships (outcome_company);
CREATE INDEX internships_visibility_idx ON internships (is_visible, is_deleted, is_approved);

CREATE INDEX admin_logs_action_idx ON admin_logs (action);
CREATE INDEX admin_logs_timestamp_idx ON admin_logs (timestamp);

WITH generated_alumni AS (
  SELECT
    gs,
    (ARRAY['Ava','Liam','Maya','Noah','Priya','Ethan','Sofia','Daniel','Anika','Julian','Riya','Marcus','Elena','Owen','Nina','Caleb','Isha','Leo','Megan','Aditya'])[1 + ((gs - 1) % 20)] AS first_name,
    (ARRAY['Patel','Nguyen','Garcia','Kim','Johnson','Singh','Brown','Martinez','Chen','Davis','Shah','Wilson','Lopez','Hall','Turner','Rao','Clark','Ramirez','Bose','Allen'])[1 + (((gs - 1) / 5)::int % 20)] AS last_name,
    2018 + ((gs - 1) % 8) AS graduation_year,
    (ARRAY['Spring','Fall'])[1 + (gs % 2)] AS graduation_term,
    (ARRAY['Computer Science','Data Science','Artificial Intelligence','Computer Engineering','Statistics'])[1 + ((gs - 1) % 5)] AS major,
    (ARRAY['Systems','Software','Artificial Intelligence','Data Science','Security'])[1 + ((gs - 1) % 5)] AS track,
    (ARRAY['BS','BS','MS','BS','PhD'])[1 + ((gs - 1) % 5)] AS degree_level,
    (ARRAY['Bachelor''s','Bachelor''s','Master''s','Bachelor''s','Doctorate'])[1 + ((gs - 1) % 5)] AS degree_seeking,
    (ARRAY['Seattle','San Francisco','New York','Chicago','Austin','Boston','Los Angeles','Atlanta','West Lafayette','Washington'])[1 + ((gs - 1) % 10)] AS city,
    (ARRAY['WA','CA','NY','IL','TX','MA','CA','GA','IN','DC'])[1 + ((gs - 1) % 10)] AS state,
    (ARRAY['Google','Microsoft','Amazon','Meta','Apple','Stripe','Salesforce','Databricks','Palantir','Capital One'])[1 + ((gs - 1) % 10)] AS employer,
    (ARRAY['Software Engineer','Data Scientist','Machine Learning Engineer','Backend Engineer','Security Engineer','Product Analyst','Platform Engineer','Research Engineer','Solutions Architect','Quantitative Analyst'])[1 + ((gs - 1) % 10)] AS job_title,
    (ARRAY['Stanford University','Carnegie Mellon University','University of Illinois Urbana-Champaign','Georgia Tech','University of Michigan','Purdue University','University of Washington','Cornell University'])[1 + ((gs - 1) % 8)] AS grad_university,
    CASE
      WHEN gs BETWEEN 1 AND 18 THEN 'approved'
      WHEN gs BETWEEN 19 AND 32 THEN 'pending'
      WHEN gs BETWEEN 33 AND 38 THEN 'denied'
      ELSE 'none'
    END AS mentorship_status,
    CASE
      WHEN gs BETWEEN 1 AND 18 THEN ARRAY['Career Chats','Resume Reviews']
      WHEN gs BETWEEN 19 AND 24 THEN ARRAY['Career Chats','Mock Interviews']
      WHEN gs BETWEEN 25 AND 32 THEN ARRAY['Networking','Internship Advice']
      WHEN gs BETWEEN 33 AND 38 THEN ARRAY['Resume Reviews']
      ELSE ARRAY[]::TEXT[]
    END AS mentorship_areas,
    CASE
      WHEN gs % 8 IN (0, 1) THEN 'Graduate School'
      ELSE 'Job'
    END AS outcome_type
  FROM generate_series(1, 100) AS gs
)
INSERT INTO alumni (
  "First Name",
  "Last Name",
  "Graduation Year",
  "Graduation Term",
  "Outcome Type",
  "Employer",
  "Job Title",
  "Expected Field of Study",
  "Track",
  "Degree Seeking",
  "University",
  "City",
  "State",
  "Base Salary",
  "Signing Bonus",
  "Relocation Reimbursement",
  "Student ID",
  "Degree Level",
  "Salary Pay Period",
  "Email",
  "LinkedIn",
  mentorship_opt_in,
  mentorship_status,
  mentorship_areas,
  is_approved,
  is_visible,
  is_directory_visible,
  is_anonymized,
  is_deleted,
  created_at,
  updated_at
)
SELECT
  first_name,
  last_name,
  graduation_year,
  graduation_term,
  outcome_type,
  CASE WHEN outcome_type = 'Graduate School' THEN NULL ELSE employer END,
  CASE WHEN outcome_type = 'Graduate School' THEN NULL ELSE job_title END,
  CASE WHEN outcome_type = 'Graduate School' THEN major ELSE NULL END,
  track,
  CASE WHEN outcome_type = 'Graduate School' THEN degree_seeking ELSE NULL END,
  CASE WHEN outcome_type = 'Graduate School' THEN grad_university ELSE NULL END,
  city,
  state,
  CASE
    WHEN outcome_type = 'Graduate School' THEN NULL
    ELSE 82000 + (gs * 1750)
  END,
  CASE
    WHEN outcome_type = 'Graduate School' THEN NULL
    ELSE 4000 + ((gs % 6) * 1500)
  END,
  CASE
    WHEN outcome_type = 'Graduate School' THEN NULL
    ELSE 1500 + ((gs % 5) * 700)
  END,
  10000000 + gs,
  degree_level,
  CASE WHEN outcome_type = 'Graduate School' THEN NULL ELSE 'Annual' END,
  lower(first_name || '.' || last_name || gs || '@example.com'),
  'https://www.linkedin.com/in/' || lower(replace(first_name || '-' || last_name || '-' || gs::text, ' ', '-')),
  mentorship_status IN ('approved', 'pending'),
  mentorship_status,
  mentorship_areas,
  true,
  true,
  (mentorship_status = 'approved' OR gs % 4 = 0),
  false,
  false,
  NOW() - ((100 - gs) * INTERVAL '1 day'),
  NOW() - ((100 - gs) * INTERVAL '6 hours')
FROM generated_alumni;

INSERT INTO mentorship_directory (
  alumni_id,
  first_name,
  last_name,
  email,
  linkedin,
  role,
  track,
  location_city,
  location_state,
  mentorship_areas,
  is_approved,
  is_visible,
  is_anonymized,
  is_deleted,
  created_at,
  updated_at
)
SELECT
  alumni_id,
  "First Name",
  "Last Name",
  "Email",
  "LinkedIn",
  "Job Title",
  "Track",
  "City",
  "State",
  mentorship_areas,
  true,
  true,
  false,
  false,
  created_at,
  updated_at
FROM alumni
WHERE mentorship_status = 'approved'
  AND mentorship_opt_in = true;

INSERT INTO internships (
  alumni_id,
  company,
  role,
  internship_year,
  location_city,
  location_state,
  outcome_company,
  outcome_role,
  outcome_type,
  is_approved,
  is_visible,
  is_anonymized,
  is_deleted,
  created_at,
  updated_at
)
SELECT
  alumni_id,
  (ARRAY['Google','Amazon','Microsoft','Meta','Apple','NVIDIA','Salesforce','Stripe','HubSpot','Capital One'])[1 + ((alumni_id - 1) % 10)] AS company,
  (ARRAY['Software Engineering Intern','Data Science Intern','Machine Learning Intern','Product Engineering Intern','Security Engineering Intern'])[1 + ((alumni_id - 1) % 5)] AS role,
  GREATEST("Graduation Year" - 1, 2016) AS internship_year,
  "City",
  "State",
  COALESCE("Employer", "University") AS outcome_company,
  COALESCE("Job Title", 'Graduate Research Assistant') AS outcome_role,
  CASE WHEN "Outcome Type" = 'Graduate School' THEN 'Graduate School' ELSE 'Full Time' END,
  true,
  true,
  false,
  false,
  created_at - INTERVAL '180 days',
  updated_at - INTERVAL '120 days'
FROM alumni
WHERE alumni_id <= 72;

INSERT INTO admin_logs (timestamp, action, description, target) VALUES
  (NOW() - INTERVAL '12 days', 'UPLOAD_PREVIEW', 'Previewed alumni import batch spring-seed-1', 'upload:spring-seed-1'),
  (NOW() - INTERVAL '12 days' + INTERVAL '20 minutes', 'UPLOAD', 'Committed alumni import batch spring-seed-1', 'upload:spring-seed-1'),
  (NOW() - INTERVAL '10 days', 'UPLOAD_PREVIEW', 'Previewed alumni import batch spring-seed-2', 'upload:spring-seed-2'),
  (NOW() - INTERVAL '10 days' + INTERVAL '15 minutes', 'UPLOAD', 'Committed alumni import batch spring-seed-2', 'upload:spring-seed-2'),
  (NOW() - INTERVAL '8 days', 'APPROVE', 'Approved mentor candidate 4', 'mentor:4'),
  (NOW() - INTERVAL '8 days' + INTERVAL '10 minutes', 'APPROVE', 'Approved mentor candidate 7', 'mentor:7'),
  (NOW() - INTERVAL '7 days', 'DENY', 'Denied mentor candidate 34', 'mentor:34'),
  (NOW() - INTERVAL '6 days', 'EDIT', 'Updated alumni record 18', 'alumni:18'),
  (NOW() - INTERVAL '5 days', 'APPROVE', 'Approved mentor candidate 12', 'mentor:12'),
  (NOW() - INTERVAL '3 days', 'EXPORT', 'Exported 100 alumni records', 'alumni_export.csv'),
  (NOW() - INTERVAL '2 days', 'EDIT', 'Updated alumni record 41', 'alumni:41'),
  (NOW() - INTERVAL '1 day', 'APPROVE', 'Approved mentor candidate 15', 'mentor:15');

COMMIT;
