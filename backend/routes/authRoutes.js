import express from 'express';
import { register, login, googleLogin, changePassword, adminLogin, forgotPassword, adminRegister } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/admin/login', adminLogin);
router.post('/admin/register', adminRegister);
router.put('/change-password', protect, changePassword);

export default router;