import express from 'express';
import { fetchPublicAlumni } from '../controllers/alumniController';
import { fetchInternships } from '../controllers/internshipController';
import { fetchMentors } from '../controllers/mentorController';

const router = express.Router();

router.get('/alumni', fetchPublicAlumni);
router.get('/internships', fetchInternships);
router.get('/mentors', fetchMentors);

export default router;
