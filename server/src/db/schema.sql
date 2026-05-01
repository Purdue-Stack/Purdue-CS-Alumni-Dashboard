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
  "Degree Seeking" TEXT,
  "University" TEXT,
  "City" TEXT,
  "State" TEXT,
  "Base Salary" NUMERIC,
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
  action TEXT NOT NULL CHECK (action IN ('UPLOAD', 'EDIT', 'APPROVE', 'DENY', 'EXPORT')),
  target TEXT NOT NULL,
  total_rows_read INTEGER,
  errors INTEGER,
  total_uploaded INTEGER
);

CREATE INDEX alumni_student_id_idx ON alumni ("Student ID");
CREATE INDEX alumni_grad_year_idx ON alumni ("Graduation Year");
CREATE INDEX alumni_outcome_type_idx ON alumni ("Outcome Type");
CREATE INDEX alumni_degree_level_idx ON alumni ("Degree Level");
CREATE INDEX alumni_expected_field_idx ON alumni ("Expected Field of Study");
CREATE INDEX alumni_employer_idx ON alumni ("Employer");
CREATE INDEX alumni_job_title_idx ON alumni ("Job Title");
CREATE INDEX alumni_city_idx ON alumni ("City");
CREATE INDEX alumni_state_idx ON alumni ("State");
CREATE INDEX alumni_visibility_idx ON alumni (is_visible, is_deleted, is_approved);
CREATE INDEX alumni_directory_visibility_idx ON alumni (is_directory_visible, is_visible, is_deleted);
CREATE INDEX alumni_mentorship_status_idx ON alumni (mentorship_opt_in, mentorship_status);

CREATE UNIQUE INDEX mentorship_directory_alumni_unique ON mentorship_directory (alumni_id);
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
    (ARRAY['BS','BS','MS','BS','PhD'])[1 + ((gs - 1) % 5)] AS degree_level,
    (ARRAY['Bachelor''s','Bachelor''s','Master''s','Bachelor''s','Doctorate'])[1 + ((gs - 1) % 5)] AS degree_seeking,
    (ARRAY['Seattle','San Francisco','New York','Chicago','Austin','Boston','Los Angeles','Atlanta','West Lafayette','Washington'])[1 + ((gs - 1) % 10)] AS city,
    (ARRAY['WA','CA','NY','IL','TX','MA','CA','GA','IN','DC'])[1 + ((gs - 1) % 10)] AS state,
    (ARRAY['Google','Amazon','Apple','Meta','Microsoft','Netflix','NVIDIA','Jane Street','Citadel','Two Sigma'])[1 + ((gs - 1) % 10)] AS employer,
    (ARRAY['Software Engineer','Data Scientist','Machine Learning Engineer','Backend Engineer','Security Engineer','Product Analyst','Platform Engineer','Research Engineer','Solutions Architect','Quantitative Analyst'])[1 + ((gs - 1) % 10)] AS job_title,
    (ARRAY['Stanford University','Massachusetts Institute of Technology','Carnegie Mellon University','University of California, Berkeley','Georgia Institute of Technology','Harvard University','Princeton University','Cornell University','University of Illinois Urbana-Champaign','University of Michigan'])[1 + ((gs - 1) % 10)] AS grad_university,
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
  "Degree Seeking",
  "University",
  "City",
  "State",
  "Base Salary",
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
  CASE WHEN outcome_type = 'Graduate School' THEN degree_seeking ELSE NULL END,
  CASE WHEN outcome_type = 'Graduate School' THEN grad_university ELSE NULL END,
  city,
  state,
  CASE
    WHEN outcome_type = 'Graduate School' THEN NULL
    ELSE 82000 + (gs * 1750)
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

INSERT INTO alumni (
  "First Name",
  "Last Name",
  "Graduation Year",
  "Graduation Term",
  "Outcome Type",
  "Employer",
  "Job Title",
  "Expected Field of Study",
  "Degree Seeking",
  "University",
  "City",
  "State",
  "Base Salary",
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
VALUES
  ('Avery', 'Chen', 2024, 'Spring', 'Internship', 'Google', 'Software Engineering Intern', 'Computer Science', NULL, NULL, 'Seattle', 'WA', NULL, NULL, 'Bachelor''s', NULL, 'avery.chen@example.com', 'https://www.linkedin.com/in/avery-chen', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '210 days', NOW() - INTERVAL '190 days'),
  ('Avery', 'Chen', 2024, 'Spring', 'Job', 'Google', 'Software Engineer', 'Computer Science', NULL, NULL, 'Seattle', 'WA', 142000, NULL, 'Bachelor''s', 'Annual', 'avery.chen@example.com', 'https://www.linkedin.com/in/avery-chen', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '90 days', NOW() - INTERVAL '70 days'),
  ('Maya', 'Patel', 2024, 'Spring', 'Internship', 'Microsoft', 'Product Engineering Intern', 'Data Science', NULL, NULL, 'Redmond', 'WA', NULL, NULL, 'Master''s', NULL, 'maya.patel@example.com', 'https://www.linkedin.com/in/maya-patel', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '220 days', NOW() - INTERVAL '205 days'),
  ('Maya', 'Patel', 2024, 'Spring', 'Job', 'Datadog', 'Data Engineer', 'Data Science', NULL, NULL, 'New York', 'NY', 136000, NULL, 'Master''s', 'Annual', 'maya.patel@example.com', 'https://www.linkedin.com/in/maya-patel', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '85 days', NOW() - INTERVAL '60 days'),
  ('Jordan', 'Rivera', 2025, 'Spring', 'Internship', 'NVIDIA', 'Machine Learning Intern', 'Artificial Intelligence', NULL, NULL, 'Santa Clara', 'CA', NULL, NULL, 'Master''s', NULL, 'jordan.rivera@example.com', 'https://www.linkedin.com/in/jordan-rivera', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '160 days', NOW() - INTERVAL '145 days'),
  ('Elena', 'Brooks', 2024, 'Fall', 'Internship', 'Amazon', 'Software Development Engineer Intern', 'Computer Science', NULL, NULL, 'Austin', 'TX', NULL, NULL, 'Bachelor''s', NULL, 'elena.brooks@example.com', 'https://www.linkedin.com/in/elena-brooks', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '200 days', NOW() - INTERVAL '180 days'),
  ('Elena', 'Brooks', 2024, 'Fall', 'Job', 'Amazon', 'Software Development Engineer I', 'Computer Science', NULL, NULL, 'Austin', 'TX', 138000, NULL, 'Bachelor''s', 'Annual', 'elena.brooks@example.com', 'https://www.linkedin.com/in/elena-brooks', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '75 days', NOW() - INTERVAL '50 days'),
  ('Noah', 'Kim', 2025, 'Spring', 'Internship', 'Stripe', 'Security Engineering Intern', 'Computer Science', NULL, NULL, 'San Francisco', 'CA', NULL, NULL, 'Bachelor''s', NULL, 'noah.kim@example.com', 'https://www.linkedin.com/in/noah-kim', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '155 days', NOW() - INTERVAL '140 days'),
  ('Priya', 'Shah', 2025, 'Spring', 'Internship', 'Apple', 'Machine Learning Intern', 'Artificial Intelligence', NULL, NULL, 'Cupertino', 'CA', NULL, NULL, 'Master''s', NULL, 'priya.shah@example.com', 'https://www.linkedin.com/in/priya-shah', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '175 days', NOW() - INTERVAL '160 days'),
  ('Priya', 'Shah', 2025, 'Spring', 'Job', 'Anthropic', 'Applied AI Engineer', 'Artificial Intelligence', NULL, NULL, 'San Francisco', 'CA', 168000, NULL, 'Master''s', 'Annual', 'priya.shah@example.com', 'https://www.linkedin.com/in/priya-shah', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '65 days', NOW() - INTERVAL '45 days'),
  ('Marcus', 'Lee', 2024, 'Fall', 'Internship', 'Meta', 'Software Engineering Intern', 'Computer Science', NULL, NULL, 'Menlo Park', 'CA', NULL, NULL, 'Bachelor''s', NULL, 'marcus.lee@example.com', 'https://www.linkedin.com/in/marcus-lee', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '205 days', NOW() - INTERVAL '190 days'),
  ('Marcus', 'Lee', 2024, 'Fall', 'Internship', 'Databricks', 'Infrastructure Intern', 'Computer Science', NULL, NULL, 'San Francisco', 'CA', NULL, NULL, 'Bachelor''s', NULL, 'marcus.lee@example.com', 'https://www.linkedin.com/in/marcus-lee', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '170 days', NOW() - INTERVAL '150 days'),
  ('Marcus', 'Lee', 2024, 'Fall', 'Job', 'Databricks', 'Software Engineer', 'Computer Science', NULL, NULL, 'San Francisco', 'CA', 158000, NULL, 'Bachelor''s', 'Annual', 'marcus.lee@example.com', 'https://www.linkedin.com/in/marcus-lee', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '55 days', NOW() - INTERVAL '35 days'),
  ('Sofia', 'Nguyen', 2025, 'Fall', 'Internship', 'HubSpot', 'Product Analytics Intern', 'Data Science', NULL, NULL, 'Cambridge', 'MA', NULL, NULL, 'Bachelor''s', NULL, 'sofia.nguyen@example.com', 'https://www.linkedin.com/in/sofia-nguyen', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '145 days', NOW() - INTERVAL '130 days'),
  ('Caleb', 'Turner', 2025, 'Spring', 'Internship', 'Salesforce', 'Software Engineering Intern', 'Computer Science', NULL, NULL, 'Indianapolis', 'IN', NULL, NULL, 'Bachelor''s', NULL, 'caleb.turner@example.com', 'https://www.linkedin.com/in/caleb-turner', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '185 days', NOW() - INTERVAL '170 days'),
  ('Caleb', 'Turner', 2025, 'Spring', 'Job', 'Salesforce', 'Associate Software Engineer', 'Computer Science', NULL, NULL, 'Indianapolis', 'IN', 129000, NULL, 'Bachelor''s', 'Annual', 'caleb.turner@example.com', 'https://www.linkedin.com/in/caleb-turner', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '50 days', NOW() - INTERVAL '30 days'),
  ('Tessa', 'Morgan', 2025, 'Spring', 'Internship', 'Netflix', 'Software Engineering Intern', 'Computer Science', NULL, NULL, 'Los Gatos', 'CA', NULL, NULL, 'Bachelor''s', NULL, 'tessa.morgan@example.com', 'https://www.linkedin.com/in/tessa-morgan', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '168 days', NOW() - INTERVAL '150 days'),
  ('Tessa', 'Morgan', 2025, 'Spring', 'Job', 'Netflix', 'Software Engineer I', 'Computer Science', NULL, NULL, 'Los Gatos', 'CA', 171000, NULL, 'Bachelor''s', 'Annual', 'tessa.morgan@example.com', 'https://www.linkedin.com/in/tessa-morgan', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '42 days', NOW() - INTERVAL '22 days'),
  ('Ryan', 'Oconnor', 2024, 'Fall', 'Internship', 'Jane Street', 'Quantitative Trading Intern', 'Computer Science', NULL, NULL, 'New York', 'NY', NULL, NULL, 'Bachelor''s', NULL, 'ryan.oconnor@example.com', 'https://www.linkedin.com/in/ryan-oconnor', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '190 days', NOW() - INTERVAL '172 days'),
  ('Ryan', 'Oconnor', 2024, 'Fall', 'Job', 'Jane Street', 'Quantitative Trader', 'Computer Science', NULL, NULL, 'New York', 'NY', 205000, NULL, 'Bachelor''s', 'Annual', 'ryan.oconnor@example.com', 'https://www.linkedin.com/in/ryan-oconnor', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '48 days', NOW() - INTERVAL '26 days'),
  ('Leila', 'Hassan', 2025, 'Spring', 'Internship', 'Citadel', 'Quantitative Research Intern', 'Data Science', NULL, NULL, 'Chicago', 'IL', NULL, NULL, 'Master''s', NULL, 'leila.hassan@example.com', 'https://www.linkedin.com/in/leila-hassan', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '176 days', NOW() - INTERVAL '160 days'),
  ('Leila', 'Hassan', 2025, 'Spring', 'Job', 'Hudson River Trading', 'Quantitative Researcher', 'Data Science', NULL, NULL, 'New York', 'NY', 198000, NULL, 'Master''s', 'Annual', 'leila.hassan@example.com', 'https://www.linkedin.com/in/leila-hassan', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '38 days', NOW() - INTERVAL '19 days'),
  ('Victor', 'Alvarez', 2025, 'Spring', 'Internship', 'Two Sigma', 'Software Engineering Intern', 'Computer Science', NULL, NULL, 'New York', 'NY', NULL, NULL, 'Bachelor''s', NULL, 'victor.alvarez@example.com', 'https://www.linkedin.com/in/victor-alvarez', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '162 days', NOW() - INTERVAL '144 days'),
  ('Grace', 'Park', 2024, 'Fall', 'Internship', 'Microsoft', 'Program Management Intern', 'Artificial Intelligence', NULL, NULL, 'Redmond', 'WA', NULL, NULL, 'Master''s', NULL, 'grace.park@example.com', 'https://www.linkedin.com/in/grace-park', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '188 days', NOW() - INTERVAL '168 days'),
  ('Grace', 'Park', 2024, 'Fall', 'Job', 'Microsoft', 'Product Manager', 'Artificial Intelligence', NULL, NULL, 'Redmond', 'WA', 154000, NULL, 'Master''s', 'Annual', 'grace.park@example.com', 'https://www.linkedin.com/in/grace-park', false, 'none', ARRAY[]::TEXT[], true, true, true, false, false, NOW() - INTERVAL '40 days', NOW() - INTERVAL '24 days');

INSERT INTO mentorship_directory (
  alumni_id,
  first_name,
  last_name,
  email,
  linkedin,
  role,
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

INSERT INTO admin_logs (timestamp, action, target, total_rows_read, errors, total_uploaded) VALUES
  (NOW() - INTERVAL '8 days', 'UPLOAD', 'Full academic yr placement, Fall n Summer 2015 and Spring 2016.xls', 177, 0, 177),
  (NOW() - INTERVAL '7 days', 'UPLOAD', 'CustomReport full academic yr Fall16, Summer16, Spring 17.xls', 221, 0, 221),
  (NOW() - INTERVAL '6 days', 'UPLOAD', '2017-18 Final Placement Results (Fall17, Summer 17, Spring 18).xlsx', 314, 27, 287),
  (NOW() - INTERVAL '5 days', 'UPLOAD', '2018-19 full academic yr custom report.xls', 282, 1, 281),
  (NOW() - INTERVAL '4 days', 'UPLOAD', '2019-20 full academic yr custom report.xls', 375, 0, 375),
  (NOW() - INTERVAL '3 days', 'UPLOAD', '2020-21 full academic yr CS and DS 12Twenty report4.8.22.xlsx', 341, 0, 341),
  (NOW() - INTERVAL '2 days', 'UPLOAD', '12Twenty 2021-22 full academic yr CS and DS.xlsx', 304, 0, 304),
  (NOW() - INTERVAL '1 day', 'UPLOAD', '12Twenty report 2022-23 full academic yr CS, DS, AI.xlsx', 443, 1, 442);

COMMIT;
