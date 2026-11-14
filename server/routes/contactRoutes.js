import express from 'express';
import rateLimit from 'express-rate-limit';
import { submitContact } from '../controllers/contactController.js';

const router = express.Router();

// Rate limiter for contact form submissions (prevent spam)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 contact submissions per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact submissions from this IP, please try again after 15 minutes.',
  },
});

router.route('/').post(contactLimiter, submitContact);

export default router;
