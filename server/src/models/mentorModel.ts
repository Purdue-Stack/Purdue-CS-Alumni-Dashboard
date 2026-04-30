import { query } from '../db';

export interface Mentor {
  id: number;
  alumni_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
  linkedin: string | null;
  role: string | null;
  location_city: string | null;
  location_state: string | null;
  mentorship_areas: string[];
  outcome_type: string | null;
  employer: string | null;
  job_title: string | null;
  degree_seeking: string | null;
  expected_field_of_study: string | null;
  university: string | null;
  is_approved: boolean;
  is_visible: boolean;
  is_anonymized: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type MentorFilters = {
  roles?: string[];
  locations?: string[];
  areas?: string[];
  search?: string;
  limit?: number;
  offset?: number;
};

export type MentorApprovalInput = {
  email?: string | null;
  linkedin?: string | null;
  mentorshipAreas?: string[];
};

export async function listMentors(filters: MentorFilters): Promise<{ rows: Mentor[]; total: number }> {
  const params: any[] = [];
  const clauses: string[] = ['md.is_visible = true', 'md.is_deleted = false', 'md.is_approved = true'];

  if (filters.roles?.length) {
    params.push(filters.roles);
    clauses.push(`md.role = ANY($${params.length}::text[])`);
  }
  if (filters.locations?.length) {
    params.push(filters.locations);
    clauses.push(`md.location_state = ANY($${params.length}::text[])`);
  }
  if (filters.areas?.length) {
    params.push(filters.areas);
    clauses.push(`md.mentorship_areas && $${params.length}::text[]`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    const idx = params.length;
    clauses.push(`(
      md.first_name ILIKE $${idx}
      OR md.last_name ILIKE $${idx}
      OR md.role ILIKE $${idx}
      OR md.location_city ILIKE $${idx}
      OR md.location_state ILIKE $${idx}
    )`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  params.push(limit, offset);

  const dataResult = await query(
    `SELECT
      md.*,
      a."Outcome Type" AS outcome_type,
      a."Employer" AS employer,
      a."Job Title" AS job_title,
      a."Degree Seeking" AS degree_seeking,
      a."Expected Field of Study" AS expected_field_of_study,
      a."University" AS university
    FROM mentorship_directory md
    LEFT JOIN alumni a ON a.alumni_id = md.alumni_id
    ${where}
    ORDER BY md.last_name ASC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}`,
    params
  );
  const countResult = await query(`SELECT COUNT(*) FROM mentorship_directory md ${where}`, params.slice(0, params.length - 2));

  return {
    rows: dataResult.rows.map((row) => ({
      ...row,
      mentorship_areas: Array.isArray(row.mentorship_areas) ? row.mentorship_areas : []
    })) as Mentor[],
    total: Number(countResult.rows[0]?.count ?? 0)
  };
}

export async function upsertMentorDirectoryEntry(alumniId: number, input: MentorApprovalInput = {}): Promise<Mentor | null> {
  const alumniResult = await query(
    `SELECT
      alumni_id,
      "First Name" AS first_name,
      "Last Name" AS last_name,
      "Email" AS email,
      "LinkedIn" AS linkedin,
      "Job Title" AS role,
      "City" AS location_city,
      "State" AS location_state,
      mentorship_areas
    FROM alumni
    WHERE alumni_id = $1
    LIMIT 1`,
    [alumniId]
  );

  const alumni = alumniResult.rows[0];
  if (!alumni) {
    return null;
  }

  const email = input.email !== undefined ? input.email : alumni.email;
  const linkedin = input.linkedin !== undefined ? input.linkedin : alumni.linkedin;
  const mentorshipAreas = input.mentorshipAreas !== undefined ? input.mentorshipAreas : (Array.isArray(alumni.mentorship_areas) ? alumni.mentorship_areas : []);

  const result = await query(
    `INSERT INTO mentorship_directory (
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
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, true, true, NOW()
    )
    ON CONFLICT (alumni_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      linkedin = EXCLUDED.linkedin,
      role = EXCLUDED.role,
      location_city = EXCLUDED.location_city,
      location_state = EXCLUDED.location_state,
      mentorship_areas = EXCLUDED.mentorship_areas,
      is_approved = true,
      is_visible = true,
      is_deleted = false,
      updated_at = NOW()
    RETURNING *`,
    [
      alumniId,
      alumni.first_name,
      alumni.last_name,
      email,
      linkedin,
      alumni.role,
      alumni.location_city,
      alumni.location_state,
      mentorshipAreas
    ]
  );

  const row = result.rows[0];
  return row ? ({ ...row, mentorship_areas: Array.isArray(row.mentorship_areas) ? row.mentorship_areas : [] } as Mentor) : null;
}

export async function hideMentorDirectoryEntry(alumniId: number): Promise<void> {
  await query(
    `UPDATE mentorship_directory
     SET is_visible = false, is_approved = false, updated_at = NOW()
     WHERE alumni_id = $1`,
    [alumniId]
  );
}
