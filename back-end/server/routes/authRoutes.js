import express from 'express';
import { requestPasswordReset, resendPasswordResetOtp, resetPassword, signIn, signOut, signUp } from '../controllers/authController.js';
import { sendSignupCode, verifyPasswordResetOtp, verifySignup } from '../controllers/authController.js';
import { checkDuplicate } from '../controllers/userController.js';

const router = express.Router();

// ===== PUBLIC AUTH ROUTES (No authentication required) =====
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/check-duplicate', checkDuplicate);
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset-otp', verifyPasswordResetOtp);
router.post('/resend-password-reset-otp', resendPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.post('/send-signup-code', sendSignupCode);
router.post('/verify-signup', verifySignup);

export default router;
