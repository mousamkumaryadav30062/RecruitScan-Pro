import express from 'express';
import {
  getAllUsers,
  getAllApplications,
  getApprovedApplications,
  updateApplicationStatus,
  autoAssignSymbolNumbers,
  assignExamCenter,
  assignSymbolNumber,
  generateAdmitCard,
  generateAllAdmitCards,
  getDashboardStats
} from '../controllers/adminController.js';
import { createVacancy, updateVacancy, deleteVacancy,getAllVacancies } from '../controllers/vacancyController.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(adminProtect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/vacancy/status', getAllVacancies);
router.post('/vacancy', createVacancy);
router.put('/vacancy/:id', updateVacancy); // New
router.delete('/vacancy/:id', deleteVacancy); // New
router.get('/applications', getAllApplications);
router.get('/applications/approved', getApprovedApplications);
router.put('/applications/status', updateApplicationStatus);
router.post('/applications/auto-assign-symbols', autoAssignSymbolNumbers);
router.post('/applications/assign-center', assignExamCenter);
router.put('/applications/symbol', assignSymbolNumber);
router.post('/admit-card/generate', generateAdmitCard);
router.post('/admit-card/generate-all', generateAllAdmitCards);

export default router;