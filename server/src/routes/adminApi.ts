import express from 'express';
import { fetchAlumni } from '../controllers/alumniController';
import { fetchAllLogs, fetchLogsByAction } from '../controllers/logController';
import {
  fetchPendingMentorshipRequests,
  approveMentorshipRequest,
  denyMentorshipRequest
} from '../controllers/mentorshipController';

const router = express.Router();

router.get('/alumni', fetchAlumni);
router.get('/logs', fetchAllLogs);
router.get('/logs/:action', fetchLogsByAction);
router.get('/mentorship/requests', fetchPendingMentorshipRequests);
router.post('/mentorship/requests/:id/approve', approveMentorshipRequest);
router.post('/mentorship/requests/:id/deny', denyMentorshipRequest);

export default router;
