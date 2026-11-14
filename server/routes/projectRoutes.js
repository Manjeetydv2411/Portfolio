import express from 'express';
import { getPublicProjects } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getPublicProjects);

export default router;
