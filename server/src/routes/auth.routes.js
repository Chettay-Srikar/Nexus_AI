import { Router } from 'express';
import { register, login, logout, getMe, changePassword, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);
router.put('/profile', authenticate, updateProfile);

export default router;
