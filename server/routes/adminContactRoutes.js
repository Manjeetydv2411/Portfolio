import express from 'express';
import {
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
} from '../controllers/adminContactController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin protection middleware to all contact message routes
router.use(protectAdmin);

router.route('/').get(getMessages);
router.route('/:id').get(getMessageById);
router.route('/:id/status').patch(updateMessageStatus);
router.route('/:id').delete(deleteMessage);

export default router;
