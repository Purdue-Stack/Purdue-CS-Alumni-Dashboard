import { query } from '../db';

export interface MentorshipRequest {
  id: number;
  first_name: string;
  last_name: string;
  purdue_id: string;
  mentorship_consent: string;
  email: string;
  linkedin: string;
  mentorship_areas: string[];
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  reviewed_at: string | null;
}

export type NewMentorshipRequest = {
  first_name: string;
  last_name: string;
  purdue_id: string;
  mentorship_consent: string;
  email: string;
  linkedin: string;
  mentorship_areas: string[];
};

export async function createMentorshipRequest(data: NewMentorshipRequest): Promise<number> {
  const result = await query(
    `INSERT INTO mentorship_requests
      (first_name, last_name, purdue_id, mentorship_consent, email, linkedin, mentorship_areas)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      data.first_name,
      data.last_name,
      data.purdue_id,
      data.mentorship_consent,
      data.email,
      data.linkedin,
      data.mentorship_areas
    ]
  );
  return result.rows[0].id as number;
}

export async function listPendingMentorshipRequests(): Promise<MentorshipRequest[]> {
  const result = await query(
    `SELECT * FROM mentorship_requests WHERE status = 'pending' ORDER BY created_at DESC`
  );
  return result.rows as MentorshipRequest[];
}

export async function updateMentorshipStatus(id: number, status: 'approved' | 'denied'): Promise<boolean> {
  const result = await query(
    `UPDATE mentorship_requests SET status = $1, reviewed_at = NOW() WHERE id = $2`,
    [status, id]
  );
  return (result.rowCount ?? 0) > 0;
}
