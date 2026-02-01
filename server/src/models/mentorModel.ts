import { query } from '../db';

export interface Mentor {
  id: number;
  alumni_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  linkedin: string | null;
  role: string | null;
  track: string | null;
  location_city: string | null;
  location_state: string | null;
  availability: string | null;
  mentorship_areas: string[];
  is_approved: boolean;
  is_visible: boolean;
  is_anonymized: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type MentorFilters = {
  tracks?: string[];
  roles?: string[];
  locations?: string[];
  availability?: string[];
  areas?: string[];
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listMentors(filters: MentorFilters): Promise<{ rows: Mentor[]; total: number }> {
  const params: any[] = [];
  const clauses: string[] = ['is_visible = true', 'is_deleted = false', 'is_approved = true'];

  if (filters.tracks?.length) {
    params.push(filters.tracks);
    clauses.push(`track = ANY($${params.length}::text[])`);
  }
  if (filters.roles?.length) {
    params.push(filters.roles);
    clauses.push(`role = ANY($${params.length}::text[])`);
  }
  if (filters.locations?.length) {
    params.push(filters.locations);
    clauses.push(`location_state = ANY($${params.length}::text[])`);
  }
  if (filters.availability?.length) {
    params.push(filters.availability);
    clauses.push(`availability = ANY($${params.length}::text[])`);
  }
  if (filters.areas?.length) {
    params.push(filters.areas);
    clauses.push(`mentorship_areas && $${params.length}::text[]`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    const idx = params.length;
    clauses.push(`(first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR role ILIKE $${idx})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  params.push(limit, offset);

  const dataResult = await query(
    `SELECT * FROM mentorship_directory ${where} ORDER BY last_name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const countResult = await query(`SELECT COUNT(*) FROM mentorship_directory ${where}`, params.slice(0, params.length - 2));
  return { rows: dataResult.rows as Mentor[], total: Number(countResult.rows[0]?.count ?? 0) };
}
