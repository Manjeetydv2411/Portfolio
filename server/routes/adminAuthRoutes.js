import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
} from '../controllers/adminAuthController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strict rate limiter for admin login to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
});

router.post('/login', loginLimiter, loginAdmin);
router.get('/me', protectAdmin, getAdminProfile);
router.post('/logout', logoutAdmin);

export default router;
