import { Request, Response } from 'express';
import { query } from '../db';
import { getAllLogs } from '../models/logModel';
import { listPendingMentorCandidates } from '../models/alumniModel';

const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA',
  washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'district of columbia': 'DC'
};

const STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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

const INTERNSHIP_CONVERSION_LABELS = {
  sameCompany: 'Converted at Same Company',
  differentCompany: 'Hired at Different Company',
  noRecordedJob: 'No Recorded Job Outcome'
} as const;

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
  const match = trimmed.match(/\b([A-Z]{2})\b/);
  if (match) {
    return match[1];
  }
  return STATE_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

function normalizeEmployer(value: string | null): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(corporation|corp|incorporated|inc|llc|ltd|co|company|technologies|technology)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isInternshipOutcome(value: string | null): boolean {
  return !!value && /intern/i.test(value);
}

function isJobOutcome(value: string | null): boolean {
  return !!value && /(job|employed)/i.test(value);
}

type BuildFilterOptions = {
  includeEmploymentTypes?: boolean;
  includeSearch?: boolean;
};

function buildFilters(req: Request, options: BuildFilterOptions = {}) {
  const { includeEmploymentTypes = true, includeSearch = true } = options;
  const params: any[] = [];
  const clauses: string[] = ['is_deleted = false', 'is_approved = true'];

  const graduationYears = parseList(req.query.graduationYears);
  if (graduationYears.length) {
    params.push(graduationYears.map((y) => Number(y)));
    clauses.push(`"Graduation Year" = ANY($${params.length}::int[])`);
  }

  const majors = parseList(req.query.majors);
  if (majors.length) {
    params.push(majors);
    clauses.push(`"Expected Field of Study" = ANY($${params.length}::text[])`);
  }

  const degreeLevels = parseList(req.query.degreeLevels);
  if (degreeLevels.length) {
    params.push(degreeLevels);
    clauses.push(`"Degree Level" = ANY($${params.length}::text[])`);
  }

  const tracks = parseList(req.query.tracks);
  if (tracks.length) {
    params.push(tracks);
    clauses.push(`"Track" = ANY($${params.length}::text[])`);
  }

  const locations = parseList(req.query.locations);
  if (locations.length) {
    params.push(locations);
    clauses.push(`"State" = ANY($${params.length}::text[])`);
  }

  const employmentTypes = includeEmploymentTypes ? parseList(req.query.employmentTypes) : [];
  if (employmentTypes.length) {
    const patterns: string[] = [];
    employmentTypes.forEach((type) => {
      if (type === 'Full Time') patterns.push('%Job%', '%Employed%');
      if (type === 'Part Time') patterns.push('%Part%');
      if (type === 'Internship') patterns.push('%Intern%');
    });
    if (patterns.length) {
      const orClauses = patterns.map((pattern) => {
        params.push(pattern);
        return `"Outcome Type" ILIKE $${params.length}`;
      });
      clauses.push(`(${orClauses.join(' OR ')})`);
    }
  }

  const search = includeSearch && typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    clauses.push(`(
      "Employer" ILIKE $${idx}
      OR "Job Title" ILIKE $${idx}
      OR "Track" ILIKE $${idx}
      OR "Expected Field of Study" ILIKE $${idx}
      OR "City" ILIKE $${idx}
      OR "State" ILIKE $${idx}
    )`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

async function buildInternshipConversionData(req: Request) {
  const { where: eligibilityWhere, params: eligibilityParams } = buildFilters(req);
  const eligibleStudentsResult = await query(
    `SELECT DISTINCT COALESCE("Student ID"::text, CONCAT(LOWER(TRIM("First Name")), '|', LOWER(TRIM("Last Name")), '|', "Graduation Year"::text)) AS student_key
     FROM alumni
     ${eligibilityWhere}
       AND ("Outcome Type" ILIKE '%Intern%' OR "Outcome Type" ILIKE '%Job%' OR "Outcome Type" ILIKE '%Employed%')`,
    eligibilityParams
  );

  const eligibleStudentKeys = eligibleStudentsResult.rows
    .map((row) => String(row.student_key ?? '').trim())
    .filter(Boolean);

  const counts = {
    sameCompany: 0,
    differentCompany: 0,
    noRecordedJob: 0
  };

  if (!eligibleStudentKeys.length) {
    return [
      { name: INTERNSHIP_CONVERSION_LABELS.sameCompany, value: 0 },
      { name: INTERNSHIP_CONVERSION_LABELS.differentCompany, value: 0 },
      { name: INTERNSHIP_CONVERSION_LABELS.noRecordedJob, value: 0 }
    ];
  }

  const { where: contextWhere, params: contextParams } = buildFilters(req, {
    includeEmploymentTypes: false,
    includeSearch: false
  });

  const conversionRowsResult = await query(
    `SELECT
       COALESCE("Student ID"::text, CONCAT(LOWER(TRIM("First Name")), '|', LOWER(TRIM("Last Name")), '|', "Graduation Year"::text)) AS student_key,
       "Outcome Type" AS outcome_type,
       "Employer" AS employer
     FROM alumni
     ${contextWhere}
       AND COALESCE("Student ID"::text, CONCAT(LOWER(TRIM("First Name")), '|', LOWER(TRIM("Last Name")), '|', "Graduation Year"::text)) = ANY($${contextParams.length + 1}::text[])
       AND ("Outcome Type" ILIKE '%Intern%' OR "Outcome Type" ILIKE '%Job%' OR "Outcome Type" ILIKE '%Employed%')`,
    [...contextParams, eligibleStudentKeys]
  );

  const studentMap = new Map<string, { internships: Set<string>; jobs: Set<string>; hasJob: boolean; hasSameCompanyJob: boolean }>();
  conversionRowsResult.rows.forEach((row) => {
    const studentKey = String(row.student_key ?? '').trim();
    if (!studentKey) return;

    const current = studentMap.get(studentKey) ?? {
      internships: new Set<string>(),
      jobs: new Set<string>(),
      hasJob: false,
      hasSameCompanyJob: false
    };

    const outcomeType = String(row.outcome_type ?? '');
    const employer = normalizeEmployer(row.employer ?? null);

    if (isInternshipOutcome(outcomeType)) {
      if (employer) {
        current.internships.add(employer);
        if (current.jobs.has(employer)) {
          current.hasSameCompanyJob = true;
        }
      }
    } else if (isJobOutcome(outcomeType)) {
      current.hasJob = true;
      if (employer) {
        current.jobs.add(employer);
        if (current.internships.has(employer)) {
          current.hasSameCompanyJob = true;
        }
      }
    }

    studentMap.set(studentKey, current);
  });

  studentMap.forEach((student) => {
    if (!student.internships.size) return;
    if (student.hasSameCompanyJob) {
      counts.sameCompany += 1;
      return;
    }
    if (student.hasJob) {
      counts.differentCompany += 1;
      return;
    }
    counts.noRecordedJob += 1;
  });

  return [
    { name: INTERNSHIP_CONVERSION_LABELS.sameCompany, value: counts.sameCompany },
    { name: INTERNSHIP_CONVERSION_LABELS.differentCompany, value: counts.differentCompany },
    { name: INTERNSHIP_CONVERSION_LABELS.noRecordedJob, value: counts.noRecordedJob }
  ];
}

export const fetchDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { where, params } = buildFilters(req);

    const [outcomesResult, internshipConversions] = await Promise.all([
      query(`SELECT "State", COUNT(*)::int AS count FROM alumni ${where} GROUP BY "State"`, params),
      buildInternshipConversionData(req)
    ]);

    const outcomesMap = new Map<string, number>();
    outcomesResult.rows.forEach((row) => {
      const code = normalizeStateCode(row.State ?? row['State']);
      if (code) {
        outcomesMap.set(code, (outcomesMap.get(code) ?? 0) + Number(row.count));
      }
    });

    const salaryWhere = `${where} AND "Base Salary" IS NOT NULL`;
    const salaryResult = await query(`SELECT "Base Salary" FROM alumni ${salaryWhere}`, params);
    const salaryBands = SALARY_BANDS.map((band) => ({ name: band.label, value: 0 }));
    salaryResult.rows.forEach((row) => {
      const salary = Number(row['Base Salary']);
      if (!Number.isFinite(salary)) return;
      const target = SALARY_BANDS.findIndex((band) => band.max == null ? salary >= band.min : salary >= band.min && salary <= band.max);
      if (target >= 0) salaryBands[target].value += 1;
    });

    const companiesResult = await query(
      `SELECT "Employer" AS name, COUNT(*)::int AS value
       FROM alumni ${where} AND "Employer" IS NOT NULL AND "Employer" <> ''
       GROUP BY "Employer"
       ORDER BY value DESC
       LIMIT 10`,
      params
    );

    const gradResult = await query(
      `SELECT "University" AS name, COUNT(*)::int AS value
       FROM alumni ${where}
         AND ("Outcome Type" ILIKE '%Graduate%' OR "Outcome Type" ILIKE '%Grad%' OR "Outcome Type" ILIKE '%School%')
         AND "University" IS NOT NULL AND "University" <> ''
       GROUP BY "University"
       ORDER BY value DESC
       LIMIT 10`,
      params
    );

    res.status(200).json({
      outcomesByState: STATE_CODES.map((code) => ({ state: code, value: outcomesMap.get(code) ?? 0 })),
      salaryBands,
      topCompanies: companiesResult.rows,
      gradAdmissions: gradResult.rows,
      internshipConversions
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
};

export const fetchHomeStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [countResult, salaryResult, mentorResult] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM alumni WHERE is_deleted = false AND is_approved = true`),
      query(`SELECT COALESCE(AVG("Base Salary"), 0)::float AS average_salary FROM alumni WHERE is_deleted = false AND is_approved = true AND "Base Salary" IS NOT NULL`),
      query(`SELECT COUNT(*)::int AS count FROM mentorship_directory WHERE is_deleted = false AND is_approved = true AND is_visible = true`)
    ]);

    res.status(200).json({
      alumniTracked: Number(countResult.rows[0]?.count ?? 0),
      averageSalary: Math.round(Number(salaryResult.rows[0]?.average_salary ?? 0)),
      mentorsAvailable: Number(mentorResult.rows[0]?.count ?? 0)
    });
  } catch (error) {
    console.error('Error fetching home stats:', error);
    res.status(500).json({ error: 'Failed to fetch home stats' });
  }
};

export const fetchAdminSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [alumniCount, mentorCount, internshipCount, pendingMentors, logs] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM alumni WHERE is_deleted = false`),
      query(`SELECT COUNT(*)::int AS count FROM mentorship_directory WHERE is_deleted = false AND is_approved = true AND is_visible = true`),
      query(`SELECT COUNT(*)::int AS count FROM internships WHERE is_deleted = false AND is_visible = true`),
      listPendingMentorCandidates(),
      getAllLogs()
    ]);

    res.status(200).json({
      counts: {
        alumni: Number(alumniCount.rows[0]?.count ?? 0),
        mentors: Number(mentorCount.rows[0]?.count ?? 0),
        internships: Number(internshipCount.rows[0]?.count ?? 0),
        pendingMentors: pendingMentors.length
      },
      pendingMentors,
      recentLogs: logs.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching admin summary:', error);
    res.status(500).json({ error: 'Failed to fetch admin summary' });
  }
};
