import express from 'express';
import { fetchPublicAlumni } from '../controllers/alumniController';
import { fetchInternships } from '../controllers/internshipController';
import { fetchMentors } from '../controllers/mentorController';
import { requireStudentAccess } from '../middleware/auth';

const router = express.Router();

router.get('/alumni', requireStudentAccess, fetchPublicAlumni);
router.get('/internships', requireStudentAccess, fetchInternships);
router.get('/mentors', requireStudentAccess, fetchMentors);

export default router;
