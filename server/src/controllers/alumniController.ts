import { Request, Response } from 'express';
import { listAlumni, AlumniListOptions } from '../models/alumniModel';
import { query } from '../db';

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

export const fetchAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const sortKey = typeof req.query.sortKey === 'string' ? req.query.sortKey : undefined;
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : req.query.sortDir === 'asc' ? 'asc' : undefined;

    const options: AlumniListOptions = {
      search,
      sortKey: sortKey as AlumniListOptions['sortKey'],
      sortDir
    };

    if (Number.isFinite(pageSize)) {
      options.limit = pageSize;
      const safePage = Number.isFinite(page) && page! >= 0 ? page! : 0;
      options.offset = safePage * pageSize!;
    }

    const { rows, total } = await listAlumni(options);
    res.status(200).json({ rows, total });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni records' });
  }
};

export const fetchPublicAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const params: any[] = [];
    const clauses: string[] = ['is_visible = true', 'is_deleted = false'];

    const graduationYears = parseList(req.query.graduationYears);
    if (graduationYears.length) {
      params.push(graduationYears.map((y) => Number(y)));
      clauses.push(`\"Graduation Year\" = ANY($${params.length}::int[])`);
    }

    const majors = parseList(req.query.majors);
    if (majors.length) {
      params.push(majors);
      clauses.push(`\"Expected Field of Study\" = ANY($${params.length}::text[])`);
    }

    const tracks = parseList(req.query.tracks);
    if (tracks.length) {
      params.push(tracks);
      clauses.push(`\"Track\" = ANY($${params.length}::text[])`);
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      clauses.push(`(\"Employer\" ILIKE $${idx} OR \"Job Title\" ILIKE $${idx})`);
    }

    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const page = req.query.page ? Number(req.query.page) : 0;
    const limit = Number.isFinite(pageSize) ? pageSize : 50;
    const offset = Number.isFinite(page) && page >= 0 ? page * limit : 0;

    params.push(limit);
    params.push(offset);

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const dataResult = await query(
      `SELECT * FROM alumni ${where} ORDER BY \"Graduation Year\" DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    const countResult = await query(`SELECT COUNT(*) FROM alumni ${where}`, params.slice(0, params.length - 2));
    res.status(200).json({ rows: dataResult.rows, total: Number(countResult.rows[0]?.count ?? 0) });
  } catch (error) {
    console.error('Error fetching public alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni records' });
  }
};
