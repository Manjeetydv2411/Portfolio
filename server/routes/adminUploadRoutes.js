import express from 'express';
import rateLimit from 'express-rate-limit';
import { uploadImage } from '../controllers/adminUploadController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import upload, { validateImageSignature } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rate limiter for image uploads (prevent abuse)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many image uploads from this IP, please try again after 15 minutes.',
  },
});

router.post('/', protectAdmin, uploadLimiter, upload.single('image'), validateImageSignature, uploadImage);

export default router;
