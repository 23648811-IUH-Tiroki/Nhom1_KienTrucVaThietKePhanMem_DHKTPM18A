import express from 'express';
import { signIn, signOut, signUp } from '../controllers/authController.js';

const router = express.Router();

// ===== PUBLIC AUTH ROUTES (No authentication required) =====
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);

export default router;