import { Request, Response } from 'express';
import {
  createMentorshipRequest,
  listPendingMentorshipRequests,
  updateMentorshipStatus
} from '../models/mentorshipRequestModel';
import { addLog } from '../models/logModel';

export const submitMentorshipRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      purdueId,
      mentorshipConsent,
      email,
      linkedin,
      mentorshipAreas
    } = req.body;

    if (!firstName || !lastName || !purdueId || !mentorshipConsent || !email || !linkedin) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const id = await createMentorshipRequest({
      first_name: String(firstName).trim(),
      last_name: String(lastName).trim(),
      purdue_id: String(purdueId).trim(),
      mentorship_consent: String(mentorshipConsent).trim(),
      email: String(email).trim(),
      linkedin: String(linkedin).trim(),
      mentorship_areas: Array.isArray(mentorshipAreas) ? mentorshipAreas.map(String) : []
    });

    res.status(201).json({ message: 'Request submitted successfully', id });
  } catch (error) {
    console.error('Error submitting mentorship request:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

export const fetchPendingMentorshipRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await listPendingMentorshipRequests();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const approveMentorshipRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid request id' });
      return;
    }

    const updated = await updateMentorshipStatus(id, 'approved');
    if (!updated) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    try {
      await addLog({
        action: 'APPROVE',
        description: `Approved mentorship request ${id}`,
        target: `mentorship_request:${id}`
      });
    } catch (logError) {
      console.error('Failed to write mentorship approval log:', logError);
    }

    res.status(200).json({ message: 'Request approved' });
  } catch (error) {
    console.error('Error approving mentorship request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

export const denyMentorshipRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Invalid request id' });
      return;
    }

    const updated = await updateMentorshipStatus(id, 'denied');
    if (!updated) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    try {
      await addLog({
        action: 'DENY',
        description: `Denied mentorship request ${id}`,
        target: `mentorship_request:${id}`
      });
    } catch (logError) {
      console.error('Failed to write mentorship denial log:', logError);
    }

    res.status(200).json({ message: 'Request denied' });
  } catch (error) {
    console.error('Error denying mentorship request:', error);
    res.status(500).json({ error: 'Failed to deny request' });
  }
};
