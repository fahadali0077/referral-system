import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;
