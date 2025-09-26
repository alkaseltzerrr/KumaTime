import express from 'express';
import { body } from 'express-validator';
import { createSession, getSessionHistory, getStats } from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const sessionValidation = [
  body('duration')
    .isInt({ min: 1, max: 3600 })
    .withMessage('Duration must be between 1 and 3600 minutes'),
  body('sessionType')
    .isIn(['focus', 'break'])
    .withMessage('Session type must be either "focus" or "break"')
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.post('/', sessionValidation, createSession);
router.get('/history', getSessionHistory);
router.get('/stats', getStats);

export default router;