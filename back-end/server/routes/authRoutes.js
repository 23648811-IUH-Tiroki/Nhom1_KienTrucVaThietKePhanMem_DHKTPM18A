import express from 'express';
import { requestPasswordReset, resetPassword, signIn, signOut, signUp } from '../controllers/authController.js';
import { sendSignupCode, verifySignup } from '../controllers/authController.js';
import { checkDuplicate } from '../controllers/userController.js';
import { loginLimiter } from '../middleware/loginLimiter.js';

const router = express.Router();

// ===== PUBLIC AUTH ROUTES (No authentication required) =====
router.post('/signup', signUp);
router.post('/signin', loginLimiter, signIn);
router.post('/signout', signOut);
router.post('/check-duplicate', checkDuplicate);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/send-signup-code', sendSignupCode);
router.post('/verify-signup', verifySignup);

export default router;