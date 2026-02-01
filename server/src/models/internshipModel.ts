import { query } from '../db';

export interface Internship {
  id: number;
  alumni_id: number | null;
  company: string | null;
  role: string | null;
  internship_year: number | null;
  location_city: string | null;
  location_state: string | null;
  outcome_company: string | null;
  outcome_role: string | null;
  outcome_type: string | null;
  is_approved: boolean;
  is_visible: boolean;
  is_anonymized: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type InternshipFilters = {
  companies?: string[];
  roles?: string[];
  years?: number[];
  locations?: string[];
  outcomes?: string[];
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listInternships(filters: InternshipFilters): Promise<{ rows: Internship[]; total: number }> {
  const params: any[] = [];
  const clauses: string[] = ['is_visible = true', 'is_deleted = false'];

  if (filters.companies?.length) {
    params.push(filters.companies);
    clauses.push(`company = ANY($${params.length}::text[])`);
  }
  if (filters.roles?.length) {
    params.push(filters.roles);
    clauses.push(`role = ANY($${params.length}::text[])`);
  }
  if (filters.years?.length) {
    params.push(filters.years);
    clauses.push(`internship_year = ANY($${params.length}::int[])`);
  }
  if (filters.locations?.length) {
    params.push(filters.locations);
    clauses.push(`location_state = ANY($${params.length}::text[])`);
  }
  if (filters.outcomes?.length) {
    params.push(filters.outcomes);
    clauses.push(`outcome_company = ANY($${params.length}::text[])`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    const idx = params.length;
    clauses.push(`(company ILIKE $${idx} OR role ILIKE $${idx} OR outcome_company ILIKE $${idx})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  params.push(limit, offset);

  const dataResult = await query(
    `SELECT * FROM internships ${where} ORDER BY internship_year DESC NULLS LAST LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const countResult = await query(`SELECT COUNT(*) FROM internships ${where}`, params.slice(0, params.length - 2));
  return { rows: dataResult.rows as Internship[], total: Number(countResult.rows[0]?.count ?? 0) };
}
