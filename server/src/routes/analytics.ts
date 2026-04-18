import express from 'express';
import { fetchDashboardAnalytics, fetchHomeStats } from '../controllers/analyticsController';

const router = express.Router();

router.get('/dashboard', fetchDashboardAnalytics);
router.get('/home', fetchHomeStats);

export default router;
