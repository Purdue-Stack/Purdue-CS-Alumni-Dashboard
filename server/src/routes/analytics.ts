import express from 'express';
import { fetchDashboardAnalytics, fetchDashboardFilterOptions, fetchHomeStats } from '../controllers/analyticsController';

const router = express.Router();

router.get('/dashboard/filter-options', fetchDashboardFilterOptions);
router.get('/dashboard', fetchDashboardAnalytics);
router.get('/home', fetchHomeStats);

export default router;
