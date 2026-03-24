import express from 'express';
import {
  getProfile,
  updatePersonalDetails,
  updateAddressDetails,
  updateExtraDetails,
  addEducation,
  completeProfile,
  upload,
  updateEducation,
deleteEducation,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile/personal', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'citizenshipFront', maxCount: 1 },
  { name: 'citizenshipBack', maxCount: 1 }
]), updatePersonalDetails);
router.put('/profile/address', updateAddressDetails);
router.put('/profile/extra', updateExtraDetails);
router.post('/profile/education', upload.array('documents', 10), addEducation);
router.put('/profile/education/:educationId', updateEducation);
router.delete('/profile/education/:educationId', deleteEducation);
router.put('/profile/complete', completeProfile);

export default router;