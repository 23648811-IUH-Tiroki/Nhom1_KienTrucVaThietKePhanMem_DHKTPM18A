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
} from '../controllers/userController.js';
import { protectedRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protectedRoute);

router.get('/', getAllUsers);
router.get('/paginated', getUsersWithPagination);
router.get('/search', searchUsers);
router.get('/profile', getProfile);
router.get('/:id', getUserById);
router.post('/', createUser);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;