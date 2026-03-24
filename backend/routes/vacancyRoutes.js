import express from 'express';
import {
  getAllVacancies,
  applyVacancy,
  getMyApplications
} from '../controllers/vacancyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllVacancies);
router.post('/apply', protect, applyVacancy);
router.get('/my-applications', protect, getMyApplications);

export default router;