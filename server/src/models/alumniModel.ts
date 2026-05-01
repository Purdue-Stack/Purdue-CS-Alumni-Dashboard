import { query } from '../db';
import type { PoolClient } from 'pg';

export interface Alumni {
  "First Name": string;
  "Last Name": string;
  "Graduation Year": number;
  "Graduation Term": string | null;
  "Outcome Type": string | null;
  Employer: string | null;
  "Job Title": string | null;
  "Expected Field of Study": string | null;
  "Degree Seeking": string | null;
  University: string | null;
  City: string | null;
  State: string | null;
  "Base Salary": number | null;
  "Student ID": number | null;
  "Degree Level": string | null;
  "Salary Pay Period": string | null;
  Email: string | null;
  "LinkedIn": string | null;
  Mentorship: string | null;
  "Mentorship Areas": string[] | null;
}

export interface PublicAlumniProfile {
  alumni_id: number;
  first_name: string;
  last_name: string;
  graduation_year: number;
  graduation_term: string | null;
  outcome_type: string | null;
  expected_field_of_study: string | null;
  degree_seeking: string | null;
  university: string | null;
  degree_level: string | null;
  employer: string | null;
  job_title: string | null;
  city: string | null;
  state: string | null;
}

export interface PendingMentorCandidate {
  alumni_id: number;
  first_name: string;
  last_name: string;
  graduation_year: number;
  employer: string | null;
  job_title: string | null;
  email: string | null;
  linkedin: string | null;
  city: string | null;
  state: string | null;
  mentorship_areas: string[];
  mentorship_status: string;
}

export interface AdminAlumniUpdateInput {
  firstName?: string;
  lastName?: string;
  graduationYear?: number;
  graduationTerm?: string | null;
  outcomeType?: string | null;
  employer?: string | null;
  jobTitle?: string | null;
  expectedFieldOfStudy?: string | null;
  isApproved?: boolean;
  isVisible?: boolean;
  isDeleted?: boolean;
  isAnonymized?: boolean;
  isDirectoryVisible?: boolean;
  degreeSeeking?: string | null;
  university?: string | null;
  city?: string | null;
  state?: string | null;
  baseSalary?: number | null;
  studentId?: number | null;
  degreeLevel?: string | null;
  salaryPayPeriod?: string | null;
  email?: string | null;
  linkedIn?: string | null;
  mentorshipAreas?: string[];
  mentorshipOptIn?: boolean;
  mentorshipStatus?: 'none' | 'pending' | 'approved' | 'denied';
}

export interface AlumniDirectoryOptions {
  graduationYears?: string[];
  majors?: string[];
  outcomeTypes?: string[];
  companies?: string[];
  jobTitles?: string[];
  states?: string[];
  degreeSeeking?: string[];
  universities?: string[];
  search?: string;
  limit?: number;
  offset?: number;
  sortKey?: 'last_name' | 'graduation_year' | 'employer' | 'job_title' | 'degree_level' | 'university';
  sortDir?: 'asc' | 'desc';
}

export interface AlumniListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sortKey?: keyof Alumni;
  sortDir?: 'asc' | 'desc';
}

type Queryable = Pick<PoolClient, 'query'>;

const alumniColumns: (keyof Alumni)[] = [
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
  "Mentorship",
  "Mentorship Areas"
];

const sortableColumns: Record<string, string> = alumniColumns.reduce((acc, key) => {
  acc[key] = `"${key}"`;
  return acc;
}, {} as Record<string, string>);

function normalizeMentorshipOptIn(value: string | null | undefined): boolean {
  if (!value) return false;
  return ['yes', 'y', 'true', '1', 'mentor', 'available'].includes(value.trim().toLowerCase());
}

function normalizeMentorshipAreas(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (!value) {
    return [];
  }
  return String(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function rowToValues(data: Alumni): any[] {
  return [
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"],
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    normalizeMentorshipOptIn(data["Mentorship"]),
    normalizeMentorshipAreas(data["Mentorship Areas"])
  ];
}

function importIdentityValues(data: Alumni): any[] {
  return [
    data["Student ID"],
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"],
    data["Degree Level"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data.University,
    data["Degree Seeking"]
  ];
}

export async function insertAlumni(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    INSERT INTO alumni (
      "First Name", "Last Name", "Graduation Year", "Graduation Term", "Outcome Type",
      "Employer", "Job Title", "Expected Field of Study", "Degree Seeking",
      "University", "City", "State", "Base Salary", "Student ID", "Degree Level", "Salary Pay Period",
      "Email", "LinkedIn", mentorship_opt_in, mentorship_areas,
      mentorship_status, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, CASE WHEN $19 THEN 'pending' ELSE 'none' END, NOW()
    )
  `;
  await executor.query(sql, rowToValues(data));
}

export async function updateAlumniByStudentId(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    UPDATE alumni SET
      "First Name" = $1,
      "Last Name" = $2,
      "Graduation Year" = $3,
      "Graduation Term" = $4,
      "Outcome Type" = $5,
      "Employer" = $6,
      "Job Title" = $7,
      "Expected Field of Study" = $8,
      "Degree Seeking" = $9,
      "University" = $10,
      "City" = $11,
      "State" = $12,
      "Base Salary" = $13,
      "Degree Level" = $14,
      "Salary Pay Period" = $15,
      "Email" = $16,
      "LinkedIn" = $17,
      mentorship_opt_in = $18,
      mentorship_areas = $19,
      mentorship_status = CASE
        WHEN mentorship_status = 'approved' AND $18 THEN 'approved'
        WHEN $18 THEN 'pending'
        ELSE 'none'
      END,
      updated_at = NOW()
    WHERE "Student ID" = $20
  `;
  await executor.query(sql, [
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"],
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    normalizeMentorshipOptIn(data["Mentorship"]),
    normalizeMentorshipAreas(data["Mentorship Areas"]),
    data["Student ID"]
  ]);
}

export async function updateAlumniByNameGradYear(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    UPDATE alumni SET
      "Graduation Term" = $1,
      "Outcome Type" = $2,
      "Employer" = $3,
      "Job Title" = $4,
      "Expected Field of Study" = $5,
      "Degree Seeking" = $6,
      "University" = $7,
      "City" = $8,
      "State" = $9,
      "Base Salary" = $10,
      "Student ID" = $11,
      "Degree Level" = $12,
      "Salary Pay Period" = $13,
      "Email" = $14,
      "LinkedIn" = $15,
      mentorship_opt_in = $16,
      mentorship_areas = $17,
      mentorship_status = CASE
        WHEN mentorship_status = 'approved' AND $16 THEN 'approved'
        WHEN $16 THEN 'pending'
        ELSE 'none'
      END,
      updated_at = NOW()
    WHERE "First Name" = $18
      AND "Last Name" = $19
      AND "Graduation Year" = $20
  `;
  const values = rowToValues(data);
  await executor.query(sql, [
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    values[18],
    values[19],
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"]
  ]);
}

export async function findAlumniByImportIdentity(data: Alumni, client?: Queryable): Promise<Alumni | null> {
  const executor = client ?? { query };
  const result = await executor.query(
    `SELECT * FROM alumni
     WHERE "Student ID" IS NOT DISTINCT FROM $1
       AND "First Name" IS NOT DISTINCT FROM $2
       AND "Last Name" IS NOT DISTINCT FROM $3
       AND "Graduation Year" IS NOT DISTINCT FROM $4
       AND "Degree Level" IS NOT DISTINCT FROM $5
       AND "Outcome Type" IS NOT DISTINCT FROM $6
       AND "Employer" IS NOT DISTINCT FROM $7
       AND "Job Title" IS NOT DISTINCT FROM $8
       AND "University" IS NOT DISTINCT FROM $9
       AND "Degree Seeking" IS NOT DISTINCT FROM $10
     LIMIT 1`,
    importIdentityValues(data)
  );
  return result.rows[0] ?? null;
}

export async function updateAlumniByImportIdentity(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    UPDATE alumni SET
      "Graduation Term" = $1,
      "Expected Field of Study" = $2,
      "City" = $3,
      "State" = $4,
      "Base Salary" = $5,
      "Salary Pay Period" = $6,
      "Email" = $7,
      "LinkedIn" = $8,
      mentorship_opt_in = $9,
      mentorship_areas = $10,
      mentorship_status = CASE
        WHEN mentorship_status = 'approved' AND $9 THEN 'approved'
        WHEN $9 THEN 'pending'
        ELSE 'none'
      END,
      updated_at = NOW()
    WHERE "Student ID" IS NOT DISTINCT FROM $11
      AND "First Name" IS NOT DISTINCT FROM $12
      AND "Last Name" IS NOT DISTINCT FROM $13
      AND "Graduation Year" IS NOT DISTINCT FROM $14
      AND "Degree Level" IS NOT DISTINCT FROM $15
      AND "Outcome Type" IS NOT DISTINCT FROM $16
      AND "Employer" IS NOT DISTINCT FROM $17
      AND "Job Title" IS NOT DISTINCT FROM $18
      AND "University" IS NOT DISTINCT FROM $19
      AND "Degree Seeking" IS NOT DISTINCT FROM $20
  `;
  const values = rowToValues(data);
  await executor.query(sql, [
    data["Graduation Term"],
    data["Expected Field of Study"],
    data.City,
    data.State,
    data["Base Salary"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    values[18],
    values[19],
    ...importIdentityValues(data)
  ]);
}

export async function findAlumniByStudentId(studentId: number, client?: Queryable): Promise<Alumni | null> {
  const executor = client ?? { query };
  const result = await executor.query(
    `SELECT * FROM alumni WHERE "Student ID" = $1 LIMIT 1`,
    [studentId]
  );
  return result.rows[0] ?? null;
}

export async function findAlumniByNameGradYear(
  firstName: string,
  lastName: string,
  graduationYear: number,
  client?: Queryable
): Promise<Alumni | null> {
  const executor = client ?? { query };
  const result = await executor.query(
    `SELECT * FROM alumni WHERE "First Name" = $1 AND "Last Name" = $2 AND "Graduation Year" = $3 LIMIT 1`,
    [firstName, lastName, graduationYear]
  );
  return result.rows[0] ?? null;
}

export async function listAlumni(options: AlumniListOptions = {}): Promise<{ rows: any[]; total: number }> {
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (options.search) {
    const q = `%${options.search}%`;
    params.push(q);
    const idx = params.length;
    const searchable = [
      '"First Name"',
      '"Last Name"',
      '"Employer"',
      '"Job Title"',
      '"Expected Field of Study"',
      '"University"',
      '"City"',
      '"State"',
      '"Email"',
      '"LinkedIn"'
    ];
    whereClauses.push(`(${searchable.map((col) => `${col} ILIKE $${idx}`).join(' OR ')})`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  let orderSql = 'ORDER BY "Graduation Year" DESC';
  if (options.sortKey && sortableColumns[options.sortKey]) {
    const dir = options.sortDir === 'desc' ? 'DESC' : 'ASC';
    orderSql = `ORDER BY ${sortableColumns[options.sortKey]} ${dir}`;
  }

  let limitSql = '';
  if (typeof options.limit === 'number') {
    params.push(options.limit);
    limitSql += ` LIMIT $${params.length}`;
  }
  if (typeof options.offset === 'number') {
    params.push(options.offset);
    limitSql += ` OFFSET $${params.length}`;
  }

  const dataResult = await query(`SELECT * FROM alumni ${whereSql} ${orderSql} ${limitSql}`, params);
  const countResult = await query(`SELECT COUNT(*) FROM alumni ${whereSql}`, options.search ? [params[0]] : []);
  return { rows: dataResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

function buildDirectoryFilters(options: AlumniDirectoryOptions) {
  const params: any[] = [];
  const clauses: string[] = [
    'is_visible = true',
    'is_deleted = false',
    'is_approved = true',
    'is_directory_visible = true'
  ];

  if (options.graduationYears?.length) {
    params.push(options.graduationYears.map((value) => Number(value)));
    clauses.push(`"Graduation Year" = ANY($${params.length}::int[])`);
  }
  if (options.majors?.length) {
    params.push(options.majors);
    clauses.push(`"Expected Field of Study" = ANY($${params.length}::text[])`);
  }
  if (options.companies?.length) {
    params.push(options.companies);
    clauses.push(`"Employer" = ANY($${params.length}::text[])`);
  }
  if (options.jobTitles?.length) {
    params.push(options.jobTitles);
    clauses.push(`"Job Title" = ANY($${params.length}::text[])`);
  }
  if (options.states?.length) {
    params.push(options.states);
    clauses.push(`"State" = ANY($${params.length}::text[])`);
  }
  if (options.degreeSeeking?.length) {
    params.push(options.degreeSeeking);
    clauses.push(`"Degree Seeking" = ANY($${params.length}::text[])`);
  }
  if (options.universities?.length) {
    params.push(options.universities);
    clauses.push(`"University" = ANY($${params.length}::text[])`);
  }
  if (options.outcomeTypes?.length) {
    const patterns: string[] = [];
    options.outcomeTypes.forEach((type) => {
      if (type === 'Job') {
        patterns.push('%Job%', '%Employed%');
      }
      if (type === 'Internship') {
        patterns.push('%Intern%');
      }
      if (type === 'Graduate School') {
        patterns.push('%Graduate%', '%Grad%', '%School%');
      }
    });
    if (patterns.length) {
      const outcomeClauses = patterns.map((pattern) => {
        params.push(pattern);
        return `"Outcome Type" ILIKE $${params.length}`;
      });
      clauses.push(`(${outcomeClauses.join(' OR ')})`);
    }
  }
  if (options.search) {
    params.push(`%${options.search}%`);
    const idx = params.length;
    clauses.push(`(
      "First Name" ILIKE $${idx}
      OR "Last Name" ILIKE $${idx}
      OR "Employer" ILIKE $${idx}
      OR "Job Title" ILIKE $${idx}
      OR "Expected Field of Study" ILIKE $${idx}
      OR "Degree Seeking" ILIKE $${idx}
      OR "University" ILIKE $${idx}
      OR "Degree Level" ILIKE $${idx}
      OR "City" ILIKE $${idx}
      OR "State" ILIKE $${idx}
    )`);
  }

  return { params, clauses };
}

function directoryOrderSql(sortKey: AlumniDirectoryOptions['sortKey'], sortDir: AlumniDirectoryOptions['sortDir']) {
  const sortableColumns: Record<NonNullable<AlumniDirectoryOptions['sortKey']>, string> = {
    last_name: '"Last Name"',
    graduation_year: '"Graduation Year"',
    employer: '"Employer"',
    job_title: '"Job Title"',
    degree_level: '"Degree Level"',
    university: '"University"'
  };
  const column = sortKey && sortableColumns[sortKey] ? sortableColumns[sortKey] : sortableColumns.graduation_year;
  const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${column} ${direction}, "Last Name" ASC, "First Name" ASC, alumni_id ASC`;
}

export async function listDirectoryAlumni(options: AlumniDirectoryOptions): Promise<{ rows: PublicAlumniProfile[]; total: number }> {
  const { params, clauses } = buildDirectoryFilters(options);
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const where = `WHERE ${clauses.join(' AND ')}`;

  params.push(limit, offset);

  const dataResult = await query(
    `SELECT
      alumni_id,
      "First Name" AS first_name,
      "Last Name" AS last_name,
      "Graduation Year" AS graduation_year,
      "Graduation Term" AS graduation_term,
      "Outcome Type" AS outcome_type,
      "Expected Field of Study" AS expected_field_of_study,
      "Degree Seeking" AS degree_seeking,
      "University" AS university,
      "Degree Level" AS degree_level,
      "Employer" AS employer,
      "Job Title" AS job_title,
      "City" AS city,
      "State" AS state
    FROM alumni
    ${where}
    ${directoryOrderSql(options.sortKey, options.sortDir)}
    LIMIT $${params.length - 1}
    OFFSET $${params.length}`,
    params
  );

  const countResult = await query(`SELECT COUNT(*) FROM alumni ${where}`, params.slice(0, params.length - 2));
  return { rows: dataResult.rows as PublicAlumniProfile[], total: Number(countResult.rows[0]?.count ?? 0) };
}

export type DirectoryFilterOptions = {
  graduationYears: string[];
  majors: string[];
  companies: string[];
  jobTitles: string[];
  states: string[];
  degreeSeeking: string[];
  universities: string[];
};

export async function listDirectoryFilterOptions(options: AlumniDirectoryOptions): Promise<DirectoryFilterOptions> {
  const { params, clauses } = buildDirectoryFilters({ outcomeTypes: options.outcomeTypes });
  const where = `WHERE ${clauses.join(' AND ')}`;
  const [yearsResult, majorsResult, companiesResult, jobTitlesResult, statesResult, degreeSeekingResult, universitiesResult] = await Promise.all([
    query(`SELECT DISTINCT "Graduation Year" AS value FROM alumni ${where} AND "Graduation Year" IS NOT NULL ORDER BY "Graduation Year" ASC`, params),
    query(`SELECT DISTINCT "Expected Field of Study" AS value FROM alumni ${where} AND "Expected Field of Study" IS NOT NULL AND "Expected Field of Study" <> '' ORDER BY "Expected Field of Study" ASC`, params),
    query(`SELECT DISTINCT "Employer" AS value FROM alumni ${where} AND "Employer" IS NOT NULL AND "Employer" <> '' ORDER BY "Employer" ASC`, params),
    query(`SELECT DISTINCT "Job Title" AS value FROM alumni ${where} AND "Job Title" IS NOT NULL AND "Job Title" <> '' ORDER BY "Job Title" ASC`, params),
    query(`SELECT DISTINCT "State" AS value FROM alumni ${where} AND "State" IS NOT NULL AND "State" <> '' ORDER BY "State" ASC`, params),
    query(`SELECT DISTINCT "Degree Seeking" AS value FROM alumni ${where} AND "Degree Seeking" IS NOT NULL AND "Degree Seeking" <> '' ORDER BY "Degree Seeking" ASC`, params),
    query(`SELECT DISTINCT "University" AS value FROM alumni ${where} AND "University" IS NOT NULL AND "University" <> '' ORDER BY "University" ASC`, params)
  ]);

  return {
    graduationYears: yearsResult.rows.map((row: { value?: unknown }) => String(row.value)),
    majors: majorsResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value)),
    companies: companiesResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value)),
    jobTitles: jobTitlesResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value)),
    states: statesResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value)),
    degreeSeeking: degreeSeekingResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value)),
    universities: universitiesResult.rows.map((row: { value?: string }) => row.value).filter((value): value is string => Boolean(value))
  };
}

export async function listPendingMentorCandidates(): Promise<PendingMentorCandidate[]> {
  const result = await query(
    `SELECT
      alumni_id,
      "First Name" AS first_name,
      "Last Name" AS last_name,
      "Graduation Year" AS graduation_year,
      "Employer" AS employer,
      "Job Title" AS job_title,
      "Email" AS email,
      "LinkedIn" AS linkedin,
      "City" AS city,
      "State" AS state,
      mentorship_areas,
      mentorship_status
    FROM alumni
    WHERE mentorship_opt_in = true
      AND mentorship_status = 'pending'
      AND is_deleted = false
    ORDER BY updated_at DESC, "Last Name" ASC`
  );

  return result.rows.map((row: Record<string, unknown>) => ({
    ...row,
    mentorship_areas: Array.isArray(row.mentorship_areas) ? row.mentorship_areas : []
  })) as PendingMentorCandidate[];
}

export async function getAlumniById(alumniId: number): Promise<any | null> {
  const result = await query(`SELECT * FROM alumni WHERE alumni_id = $1 LIMIT 1`, [alumniId]);
  return result.rows[0] ?? null;
}

export async function updateAlumniAdmin(alumniId: number, input: AdminAlumniUpdateInput): Promise<any | null> {
  const assignments: string[] = [];
  const params: any[] = [];

  const setField = (sql: string, value: any) => {
    params.push(value);
    assignments.push(`${sql} = $${params.length}`);
  };

  if (input.firstName !== undefined) setField(`"First Name"`, input.firstName);
  if (input.lastName !== undefined) setField(`"Last Name"`, input.lastName);
  if (input.graduationYear !== undefined) setField(`"Graduation Year"`, input.graduationYear);
  if (input.graduationTerm !== undefined) setField(`"Graduation Term"`, input.graduationTerm);
  if (input.outcomeType !== undefined) setField(`"Outcome Type"`, input.outcomeType);
  if (input.employer !== undefined) setField(`"Employer"`, input.employer);
  if (input.jobTitle !== undefined) setField(`"Job Title"`, input.jobTitle);
  if (input.expectedFieldOfStudy !== undefined) setField(`"Expected Field of Study"`, input.expectedFieldOfStudy);
  if (input.isApproved !== undefined) setField('is_approved', input.isApproved);
  if (input.isVisible !== undefined) setField('is_visible', input.isVisible);
  if (input.isDeleted !== undefined) setField('is_deleted', input.isDeleted);
  if (input.isAnonymized !== undefined) setField('is_anonymized', input.isAnonymized);
  if (input.isDirectoryVisible !== undefined) setField('is_directory_visible', input.isDirectoryVisible);
  if (input.degreeSeeking !== undefined) setField(`"Degree Seeking"`, input.degreeSeeking);
  if (input.university !== undefined) setField(`"University"`, input.university);
  if (input.city !== undefined) setField(`"City"`, input.city);
  if (input.state !== undefined) setField(`"State"`, input.state);
  if (input.baseSalary !== undefined) setField(`"Base Salary"`, input.baseSalary);
  if (input.studentId !== undefined) setField(`"Student ID"`, input.studentId);
  if (input.degreeLevel !== undefined) setField(`"Degree Level"`, input.degreeLevel);
  if (input.salaryPayPeriod !== undefined) setField(`"Salary Pay Period"`, input.salaryPayPeriod);
  if (input.email !== undefined) setField(`"Email"`, input.email);
  if (input.linkedIn !== undefined) setField(`"LinkedIn"`, input.linkedIn);
  if (input.mentorshipAreas !== undefined) setField('mentorship_areas', input.mentorshipAreas);
  if (input.mentorshipOptIn !== undefined) setField('mentorship_opt_in', input.mentorshipOptIn);
  if (input.mentorshipStatus !== undefined) setField('mentorship_status', input.mentorshipStatus);

  if (assignments.length === 0) {
    return getAlumniById(alumniId);
  }

  assignments.push('updated_at = NOW()');
  params.push(alumniId);

  const result = await query(
    `UPDATE alumni SET ${assignments.join(', ')} WHERE alumni_id = $${params.length} RETURNING *`,
    params
  );
  return result.rows[0] ?? null;
}
