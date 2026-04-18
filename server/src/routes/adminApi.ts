import express from 'express';
import {
  fetchAlumni,
  fetchPendingMentorCandidates,
  updateAdminAlumni,
  approveMentorCandidate,
  denyMentorCandidate
} from '../controllers/alumniController';
import { fetchAllLogs, fetchLogsByAction } from '../controllers/logController';
import { exportAlumniCsv } from '../controllers/exportController';
import { fetchAdminSummary } from '../controllers/analyticsController';

const router = express.Router();

router.get('/alumni', fetchAlumni);
router.patch('/alumni/:id', updateAdminAlumni);
router.get('/analytics/summary', fetchAdminSummary);
router.get('/logs', fetchAllLogs);
router.get('/logs/:action', fetchLogsByAction);
router.get('/mentors/pending', fetchPendingMentorCandidates);
router.post('/mentors/:id/approve', approveMentorCandidate);
router.post('/mentors/:id/deny', denyMentorCandidate);
router.get('/export', exportAlumniCsv);

export default router;
