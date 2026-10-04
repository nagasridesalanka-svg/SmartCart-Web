/**
 * SmartCart - Authentication Routes
 * Endpoints for registration, login, and profile
 */

import { Router } from 'express';
import authController from '../controllers/authController.js';
import authenticate from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (requires valid JWT)
router.get('/me', authenticate, authController.getProfile);

export default router;
