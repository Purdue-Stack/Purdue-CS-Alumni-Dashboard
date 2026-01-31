import express from 'express';
import { fetchAlumni } from '../controllers/alumniController';

const router = express.Router();

router.get('/alumni', fetchAlumni);

export default router;
