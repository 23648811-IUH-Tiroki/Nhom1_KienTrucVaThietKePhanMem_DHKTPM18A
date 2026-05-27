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
  getShippingAddress,
  updateShippingAddress,
} from '../controllers/userController.js';
import { protectedRoute, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectedRoute);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/shipping-address', getShippingAddress);
router.put('/shipping-address', updateShippingAddress);

router.use(requireAdmin);

router.get('/', getAllUsers);
router.get('/paginated', getUsersWithPagination);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);

// Admin user management is handled under /api/admin for block/role actions.

export default router;