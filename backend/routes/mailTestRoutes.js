import express from 'express';
import { testEmail } from '../controllers/mailTestController.js';

const router = express.Router();

// POST /api/test-email
router.post('/test-email', testEmail);

export default router;
