import { Request, Response } from 'express';
import {
  listAlumni,
  AlumniListOptions,
  listDirectoryAlumni,
  updateAlumniAdmin,
  getAlumniById,
  listPendingMentorCandidates,
  AdminAlumniUpdateInput
} from '../models/alumniModel';
import { addLog } from '../models/logModel';
import { hideMentorDirectoryEntry, upsertMentorDirectoryEntry } from '../models/mentorModel';

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
    const graduationYears = parseList(req.query.graduationYears);
    const majors = parseList(req.query.majors);
    const outcomeTypes = parseList(req.query.outcomeTypes);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 24;
    const page = req.query.page ? Number(req.query.page) : 0;

    const { rows, total } = await listDirectoryAlumni({
      graduationYears,
      majors,
      outcomeTypes,
      search,
      limit: pageSize,
      offset: page * pageSize
    });
    res.status(200).json({ rows, total });
  } catch (error) {
    console.error('Error fetching public alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni records' });
  }
};

export const fetchPendingMentorCandidates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await listPendingMentorCandidates();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching pending mentor candidates:', error);
    res.status(500).json({ error: 'Failed to fetch pending mentor candidates' });
  }
};

function parseMentorshipAreas(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean);
  }
  return undefined;
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

function parseNullableNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function buildAdminUpdateInput(body: Record<string, unknown>): AdminAlumniUpdateInput {
  return {
    firstName: typeof body.firstName === 'string' ? body.firstName.trim() : undefined,
    lastName: typeof body.lastName === 'string' ? body.lastName.trim() : undefined,
    graduationYear: parseNullableNumber(body.graduationYear) ?? undefined,
    graduationTerm: parseNullableString(body.graduationTerm),
    outcomeType: parseNullableString(body.outcomeType),
    employer: parseNullableString(body.employer),
    jobTitle: parseNullableString(body.jobTitle),
    expectedFieldOfStudy: parseNullableString(body.expectedFieldOfStudy),
    isApproved: typeof body.isApproved === 'boolean' ? body.isApproved : undefined,
    isVisible: typeof body.isVisible === 'boolean' ? body.isVisible : undefined,
    isDeleted: typeof body.isDeleted === 'boolean' ? body.isDeleted : undefined,
    isAnonymized: typeof body.isAnonymized === 'boolean' ? body.isAnonymized : undefined,
    isDirectoryVisible: typeof body.isDirectoryVisible === 'boolean' ? body.isDirectoryVisible : undefined,
    degreeSeeking: parseNullableString(body.degreeSeeking),
    university: parseNullableString(body.university),
    city: parseNullableString(body.city),
    state: parseNullableString(body.state),
    baseSalary: parseNullableNumber(body.baseSalary),
    studentId: parseNullableNumber(body.studentId),
    degreeLevel: parseNullableString(body.degreeLevel),
    salaryPayPeriod: parseNullableString(body.salaryPayPeriod),
    email: parseNullableString(body.email),
    linkedIn: parseNullableString(body.linkedIn),
    mentorshipAreas: parseMentorshipAreas(body.mentorshipAreas),
    mentorshipOptIn: typeof body.mentorshipOptIn === 'boolean' ? body.mentorshipOptIn : undefined,
    mentorshipStatus:
      body.mentorshipStatus === 'none' ||
      body.mentorshipStatus === 'pending' ||
      body.mentorshipStatus === 'approved' ||
      body.mentorshipStatus === 'denied'
        ? body.mentorshipStatus
        : undefined
  };
}

export const updateAdminAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const alumniId = Number(req.params.id);
    if (!Number.isFinite(alumniId)) {
      res.status(400).json({ error: 'Invalid alumni id' });
      return;
    }

    const updated = await updateAlumniAdmin(alumniId, buildAdminUpdateInput(req.body as Record<string, unknown>));
    if (!updated) {
      res.status(404).json({ error: 'Alumni record not found' });
      return;
    }

    if (updated.mentorship_status === 'approved' && updated.mentorship_opt_in === true) {
      await upsertMentorDirectoryEntry(alumniId);
    }

    try {
      await addLog({
        action: 'EDIT',
        description: `Updated alumni record ${alumniId}`,
        target: `alumni:${alumniId}`
      });
    } catch (logError) {
      console.error('Failed to write alumni edit log:', logError);
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating alumni record:', error);
    res.status(500).json({ error: 'Failed to update alumni record' });
  }
};

export const approveMentorCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const alumniId = Number(req.params.id);
    if (!Number.isFinite(alumniId)) {
      res.status(400).json({ error: 'Invalid alumni id' });
      return;
    }

    const alumni = await getAlumniById(alumniId);
    if (!alumni) {
      res.status(404).json({ error: 'Alumni record not found' });
      return;
    }

    await updateAlumniAdmin(alumniId, {
      mentorshipOptIn: true,
      mentorshipStatus: 'approved',
      isDirectoryVisible: req.body.isDirectoryVisible === true ? true : alumni.is_directory_visible,
      email: req.body.email === undefined ? alumni['Email'] ?? alumni.Email ?? null : req.body.email,
      linkedIn: req.body.linkedIn === undefined ? alumni['LinkedIn'] ?? null : req.body.linkedIn,
      mentorshipAreas: parseMentorshipAreas(req.body.mentorshipAreas) ?? (Array.isArray(alumni.mentorship_areas) ? alumni.mentorship_areas : [])
    });

    const mentor = await upsertMentorDirectoryEntry(alumniId, {
      email: req.body.email === undefined ? undefined : req.body.email,
      linkedin: req.body.linkedIn === undefined ? undefined : req.body.linkedIn,
      mentorshipAreas: parseMentorshipAreas(req.body.mentorshipAreas)
    });

    try {
      await addLog({
        action: 'APPROVE',
        description: `Approved mentor candidate ${alumniId}`,
        target: `mentor:${alumniId}`
      });
    } catch (logError) {
      console.error('Failed to write mentor approval log:', logError);
    }

    res.status(200).json({ message: 'Mentor approved', mentor });
  } catch (error) {
    console.error('Error approving mentor candidate:', error);
    res.status(500).json({ error: 'Failed to approve mentor candidate' });
  }
};

export const denyMentorCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const alumniId = Number(req.params.id);
    if (!Number.isFinite(alumniId)) {
      res.status(400).json({ error: 'Invalid alumni id' });
      return;
    }

    const alumni = await getAlumniById(alumniId);
    if (!alumni) {
      res.status(404).json({ error: 'Alumni record not found' });
      return;
    }

    await updateAlumniAdmin(alumniId, {
      mentorshipOptIn: false,
      mentorshipStatus: 'denied'
    });
    await hideMentorDirectoryEntry(alumniId);

    try {
      await addLog({
        action: 'DENY',
        description: `Denied mentor candidate ${alumniId}`,
        target: `mentor:${alumniId}`
      });
    } catch (logError) {
      console.error('Failed to write mentor denial log:', logError);
    }

    res.status(200).json({ message: 'Mentor candidate denied' });
  } catch (error) {
    console.error('Error denying mentor candidate:', error);
    res.status(500).json({ error: 'Failed to deny mentor candidate' });
  }
};
