import express from 'express';
import { signIn, signOut, signUp } from '../controllers/authController.js';
import { checkDuplicate } from '../controllers/userController.js';

const router = express.Router();

// ===== PUBLIC AUTH ROUTES (No authentication required) =====
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/check-duplicate', checkDuplicate);

export default router;