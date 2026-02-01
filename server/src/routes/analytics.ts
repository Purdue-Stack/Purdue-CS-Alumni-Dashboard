import express from 'express';
import { fetchDashboardAnalytics } from '../controllers/analyticsController';

const router = express.Router();

router.get('/dashboard', fetchDashboardAnalytics);

export default router;
