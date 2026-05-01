import { Request, Response } from 'express';
import { query } from '../db';
import { addLog } from '../models/logModel';

const EXPORT_COLUMNS = [
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
  "Salary Pay Period"
];

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function buildFilters(req: Request) {
  const params: any[] = [];
  const clauses: string[] = [];

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

  const degreeLevels = parseList(req.query.degreeLevels);
  if (degreeLevels.length) {
    params.push(degreeLevels);
    clauses.push(`\"Degree Level\" = ANY($${params.length}::text[])`);
  }

  const employmentTypes = parseList(req.query.employmentTypes);
  if (employmentTypes.length) {
    const patterns: string[] = [];
    employmentTypes.forEach((t) => {
      if (t === 'Full Time') patterns.push('%Job%', '%Employed%');
      if (t === 'Part Time') patterns.push('%Part%');
      if (t === 'Internship') patterns.push('%Intern%');
    });
    if (patterns.length) {
      const orClauses = patterns.map((pattern) => {
        params.push(pattern);
        return `\"Outcome Type\" ILIKE $${params.length}`;
      });
      clauses.push(`(${orClauses.join(' OR ')})`);
    }
  }

  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    clauses.push(`(\"Employer\" ILIKE $${idx} OR \"Job Title\" ILIKE $${idx})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (/[\",\\n]/.test(str)) {
    return `"${str.replace(/\"/g, '\"\"')}"`;
  }
  return str;
}

export const exportAlumniCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { where, params } = buildFilters(req);
    const rowsResult = await query(
      `SELECT ${EXPORT_COLUMNS.map((col) => `\"${col}\"`).join(', ')} FROM alumni ${where} ORDER BY \"Graduation Year\" DESC`,
      params
    );

    const header = EXPORT_COLUMNS.join(',');
    const lines = rowsResult.rows.map((row) =>
      EXPORT_COLUMNS.map((col) => escapeCsvValue(row[col])).join(',')
    );
    const csv = [header, ...lines].join('\n');

    try {
      await addLog({
        action: 'EXPORT',
        target: 'alumni_export.csv',
        totalRowsRead: rowsResult.rows.length,
        errors: 0,
        totalUploaded: null
      });
    } catch (logError) {
      console.error('Failed to write export log:', logError);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"alumni_export.csv\"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting alumni:', error);
    res.status(500).json({ error: 'Failed to export alumni' });
  }
};
