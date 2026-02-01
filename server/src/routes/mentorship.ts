import express from 'express';
import { submitMentorshipRequest } from '../controllers/mentorshipController';

const router = express.Router();

router.post('/request', submitMentorshipRequest);

export default router;
