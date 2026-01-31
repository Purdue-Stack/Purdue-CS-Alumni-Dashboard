import express from 'express';
import { fetchAlumni } from '../controllers/alumniController';
import { fetchAllLogs, fetchLogsByAction } from '../controllers/logController';

const router = express.Router();

router.get('/alumni', fetchAlumni);
router.get('/logs', fetchAllLogs);
router.get('/logs/:action', fetchLogsByAction);

export default router;
