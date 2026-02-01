import { Request, Response } from 'express';
import { query } from '../db';

const STATE_NAME_TO_CODE: Record<string, string> = {
  'alabama': 'AL',
  'alaska': 'AK',
  'arizona': 'AZ',
  'arkansas': 'AR',
  'california': 'CA',
  'colorado': 'CO',
  'connecticut': 'CT',
  'delaware': 'DE',
  'florida': 'FL',
  'georgia': 'GA',
  'hawaii': 'HI',
  'idaho': 'ID',
  'illinois': 'IL',
  'indiana': 'IN',
  'iowa': 'IA',
  'kansas': 'KS',
  'kentucky': 'KY',
  'louisiana': 'LA',
  'maine': 'ME',
  'maryland': 'MD',
  'massachusetts': 'MA',
  'michigan': 'MI',
  'minnesota': 'MN',
  'mississippi': 'MS',
  'missouri': 'MO',
  'montana': 'MT',
  'nebraska': 'NE',
  'nevada': 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  'ohio': 'OH',
  'oklahoma': 'OK',
  'oregon': 'OR',
  'pennsylvania': 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  'tennessee': 'TN',
  'texas': 'TX',
  'utah': 'UT',
  'vermont': 'VT',
  'virginia': 'VA',
  'washington': 'WA',
  'west virginia': 'WV',
  'wisconsin': 'WI',
  'wyoming': 'WY',
  'district of columbia': 'DC'
};

const STATE_CODES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const SALARY_BANDS = [
  { label: '50k', min: 50000, max: 59999 },
  { label: '60k', min: 60000, max: 69999 },
  { label: '70k', min: 70000, max: 79999 },
  { label: '80k', min: 80000, max: 89999 },
  { label: '90k', min: 90000, max: 99999 },
  { label: '100k', min: 100000, max: 109999 },
  { label: '110k', min: 110000, max: 119999 },
  { label: '120k', min: 120000, max: 129999 },
  { label: '130k', min: 130000, max: 139999 },
  { label: '140k', min: 140000, max: 149999 },
  { label: '150k+', min: 150000, max: null }
];

function parseList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((item) => item.trim()).filter(Boolean);
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function normalizeStateCode(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\\b([A-Z]{2})\\b/);
  if (match) {
    return match[1];
  }
  const lower = trimmed.toLowerCase();
  return STATE_NAME_TO_CODE[lower] ?? null;
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

export const fetchDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { where, params } = buildFilters(req);

    const outcomesResult = await query(
      `SELECT \"State\", COUNT(*)::int AS count FROM alumni ${where} GROUP BY \"State\"`,
      params
    );

    const outcomesMap = new Map<string, number>();
    outcomesResult.rows.forEach((row) => {
      const code = normalizeStateCode(row.State ?? row['State']);
      if (code) {
        outcomesMap.set(code, (outcomesMap.get(code) ?? 0) + Number(row.count));
      }
    });

    const outcomesByState = STATE_CODES.map((code) => ({
      state: code,
      value: outcomesMap.get(code) ?? 0
    }));

    const salaryWhere = where
      ? `${where} AND \"Base Salary\" IS NOT NULL`
      : `WHERE \"Base Salary\" IS NOT NULL`;
    const salaryResult = await query(
      `SELECT \"Base Salary\" FROM alumni ${salaryWhere}`,
      params
    );

    const salaryCounts = SALARY_BANDS.map((band) => ({ name: band.label, value: 0 }));
    salaryResult.rows.forEach((row) => {
      const salary = Number(row['Base Salary']);
      if (!Number.isFinite(salary)) return;
      const bandIndex = SALARY_BANDS.findIndex((band) => {
        if (band.max == null) return salary >= band.min;
        return salary >= band.min && salary <= band.max;
      });
      if (bandIndex >= 0) {
        salaryCounts[bandIndex].value += 1;
      }
    });

    const companiesWhere = where
      ? `${where} AND \"Employer\" IS NOT NULL AND \"Employer\" <> ''`
      : `WHERE \"Employer\" IS NOT NULL AND \"Employer\" <> ''`;
    const companiesResult = await query(
      `SELECT \"Employer\" AS name, COUNT(*)::int AS value FROM alumni ${companiesWhere} GROUP BY \"Employer\" ORDER BY value DESC LIMIT 10`,
      params
    );

    const gradWhere = where
      ? `${where} AND (\"Outcome Type\" ILIKE '%Graduate%' OR \"Outcome Type\" ILIKE '%Grad%' OR \"Outcome Type\" ILIKE '%School%') AND \"University\" IS NOT NULL AND \"University\" <> ''`
      : `WHERE (\"Outcome Type\" ILIKE '%Graduate%' OR \"Outcome Type\" ILIKE '%Grad%' OR \"Outcome Type\" ILIKE '%School%') AND \"University\" IS NOT NULL AND \"University\" <> ''`;
    const gradResult = await query(
      `SELECT \"University\" AS name, COUNT(*)::int AS value FROM alumni ${gradWhere} GROUP BY \"University\" ORDER BY value DESC LIMIT 10`,
      params
    );

    res.status(200).json({
      outcomesByState,
      salaryBands: salaryCounts,
      topCompanies: companiesResult.rows,
      gradAdmissions: gradResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
};
