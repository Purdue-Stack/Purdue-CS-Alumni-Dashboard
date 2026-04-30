import express from 'express';
import { login, logout, me } from '../middleware/auth';

const router = express.Router();

router.get('/me', me);
router.post('/login', login);
router.post('/logout', logout);

export default router;
