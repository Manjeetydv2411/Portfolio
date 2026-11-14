import express from 'express';
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/adminProjectController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectAdmin);

router.route('/').get(getAdminProjects).post(createProject);
router.route('/:id').patch(updateProject).delete(deleteProject);

export default router;
