import express from 'express';
import {
  getAllUsers,
  getUsersWithPagination,
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  login,
  register,
  checkDuplicate,
  logout,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/paginated', getUsersWithPagination);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', login);
router.post('/register', register);
router.post('/check-duplicate', checkDuplicate);
router.post('/logout', logout); 
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;