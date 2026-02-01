import { Request, Response } from 'express';
import { listInternships } from '../models/internshipModel';

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

export const fetchInternships = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = parseList(req.query.companies);
    const roles = parseList(req.query.roles);
    const years = parseList(req.query.years).map((y) => Number(y)).filter((y) => Number.isFinite(y));
    const locations = parseList(req.query.locations);
    const outcomes = parseList(req.query.outcomes);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const page = req.query.page ? Number(req.query.page) : 0;

    const { rows, total } = await listInternships({
      companies,
      roles,
      years,
      locations,
      outcomes,
      search,
      limit: pageSize,
      offset: page * pageSize
    });

    res.status(200).json({ rows, total });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
};
