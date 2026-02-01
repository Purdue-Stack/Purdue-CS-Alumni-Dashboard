import { Request, Response } from 'express';
import { listMentors } from '../models/mentorModel';

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

export const fetchMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const tracks = parseList(req.query.tracks);
    const roles = parseList(req.query.roles);
    const locations = parseList(req.query.locations);
    const availability = parseList(req.query.availability);
    const areas = parseList(req.query.areas);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;
    const page = req.query.page ? Number(req.query.page) : 0;

    const { rows, total } = await listMentors({
      tracks,
      roles,
      locations,
      availability,
      areas,
      search,
      limit: pageSize,
      offset: page * pageSize
    });

    res.status(200).json({ rows, total });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
};
