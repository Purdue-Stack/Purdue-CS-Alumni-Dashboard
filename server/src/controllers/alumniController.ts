import { Request, Response } from 'express';
import { listAlumni, AlumniListOptions } from '../models/alumniModel';

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
      if (Number.isFinite(page) && page >= 0) {
        options.offset = page * pageSize!;
      }
    }

    const { rows, total } = await listAlumni(options);
    res.status(200).json({ rows, total });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni records' });
  }
};
