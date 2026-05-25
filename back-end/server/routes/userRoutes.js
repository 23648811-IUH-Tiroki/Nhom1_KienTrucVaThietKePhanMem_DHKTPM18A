import express from 'express';
import {
  getAllUsers,
  getUsersWithPagination,
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} from '../controllers/userController.js';
import { protectedRoute, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectedRoute);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.use(requireAdmin);

router.get('/', getAllUsers);
router.get('/paginated', getUsersWithPagination);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;