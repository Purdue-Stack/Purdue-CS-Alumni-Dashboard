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
  Track: string | null;
  "Degree Seeking": string | null;
  University: string | null;
  City: string | null;
  State: string | null;
  "Base Salary": number | null;
  "Signing Bonus": number | null;
  "Relocation Reimbursement": number | null;
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
  track: string | null;
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
  track: string | null;
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
  track?: string | null;
  degreeSeeking?: string | null;
  university?: string | null;
  city?: string | null;
  state?: string | null;
  baseSalary?: number | null;
  signingBonus?: number | null;
  relocationReimbursement?: number | null;
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
  tracks?: string[];
  outcomeTypes?: string[];
  search?: string;
  limit?: number;
  offset?: number;
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
    data.Track,
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    normalizeMentorshipOptIn(data["Mentorship"]),
    normalizeMentorshipAreas(data["Mentorship Areas"])
  ];
}

export async function insertAlumni(data: Alumni, client?: Queryable): Promise<void> {
  const executor = client ?? { query };
  const sql = `
    INSERT INTO alumni (
      "First Name", "Last Name", "Graduation Year", "Graduation Term", "Outcome Type",
      "Employer", "Job Title", "Expected Field of Study", "Track", "Degree Seeking",
      "University", "City", "State", "Base Salary", "Signing Bonus",
      "Relocation Reimbursement", "Student ID", "Degree Level", "Salary Pay Period",
      "Email", "LinkedIn", mentorship_opt_in, mentorship_areas,
      mentorship_status, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, CASE WHEN $22 THEN 'pending' ELSE 'none' END, NOW()
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
      "Track" = $9,
      "Degree Seeking" = $10,
      "University" = $11,
      "City" = $12,
      "State" = $13,
      "Base Salary" = $14,
      "Signing Bonus" = $15,
      "Relocation Reimbursement" = $16,
      "Degree Level" = $17,
      "Salary Pay Period" = $18,
      "Email" = $19,
      "LinkedIn" = $20,
      mentorship_opt_in = $21,
      mentorship_areas = $22,
      mentorship_status = CASE
        WHEN mentorship_status = 'approved' AND $21 THEN 'approved'
        WHEN $21 THEN 'pending'
        ELSE 'none'
      END,
      updated_at = NOW()
    WHERE "Student ID" = $23
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
    data.Track,
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
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
      "Track" = $6,
      "Degree Seeking" = $7,
      "University" = $8,
      "City" = $9,
      "State" = $10,
      "Base Salary" = $11,
      "Signing Bonus" = $12,
      "Relocation Reimbursement" = $13,
      "Student ID" = $14,
      "Degree Level" = $15,
      "Salary Pay Period" = $16,
      "Email" = $17,
      "LinkedIn" = $18,
      mentorship_opt_in = $19,
      mentorship_areas = $20,
      mentorship_status = CASE
        WHEN mentorship_status = 'approved' AND $19 THEN 'approved'
        WHEN $19 THEN 'pending'
        ELSE 'none'
      END,
      updated_at = NOW()
    WHERE "First Name" = $21
      AND "Last Name" = $22
      AND "Graduation Year" = $23
  `;
  const values = rowToValues(data);
  await executor.query(sql, [
    data["Graduation Term"],
    data["Outcome Type"],
    data.Employer,
    data["Job Title"],
    data["Expected Field of Study"],
    data.Track,
    data["Degree Seeking"],
    data.University,
    data.City,
    data.State,
    data["Base Salary"],
    data["Signing Bonus"],
    data["Relocation Reimbursement"],
    data["Student ID"],
    data["Degree Level"],
    data["Salary Pay Period"],
    data.Email,
    data["LinkedIn"],
    values[21],
    values[22],
    data["First Name"],
    data["Last Name"],
    data["Graduation Year"]
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
      '"Track"',
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
  if (options.tracks?.length) {
    params.push(options.tracks);
    clauses.push(`"Track" = ANY($${params.length}::text[])`);
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
      OR "City" ILIKE $${idx}
      OR "State" ILIKE $${idx}
      OR "Track" ILIKE $${idx}
    )`);
  }

  return { params, clauses };
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
      "Track" AS track,
      "Degree Seeking" AS degree_seeking,
      "University" AS university,
      "Degree Level" AS degree_level,
      "Employer" AS employer,
      "Job Title" AS job_title,
      "City" AS city,
      "State" AS state
    FROM alumni
    ${where}
    ORDER BY "Graduation Year" DESC, "Last Name" ASC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}`,
    params
  );

  const countResult = await query(`SELECT COUNT(*) FROM alumni ${where}`, params.slice(0, params.length - 2));
  return { rows: dataResult.rows as PublicAlumniProfile[], total: Number(countResult.rows[0]?.count ?? 0) };
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
      "Track" AS track,
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

  return result.rows.map((row) => ({
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
  if (input.track !== undefined) setField(`"Track"`, input.track);
  if (input.degreeSeeking !== undefined) setField(`"Degree Seeking"`, input.degreeSeeking);
  if (input.university !== undefined) setField(`"University"`, input.university);
  if (input.city !== undefined) setField(`"City"`, input.city);
  if (input.state !== undefined) setField(`"State"`, input.state);
  if (input.baseSalary !== undefined) setField(`"Base Salary"`, input.baseSalary);
  if (input.signingBonus !== undefined) setField(`"Signing Bonus"`, input.signingBonus);
  if (input.relocationReimbursement !== undefined) setField(`"Relocation Reimbursement"`, input.relocationReimbursement);
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
