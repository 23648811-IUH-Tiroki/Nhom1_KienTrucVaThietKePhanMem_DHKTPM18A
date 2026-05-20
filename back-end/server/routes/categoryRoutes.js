import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryByType,
    searchCategories,
    getProductByCatetoryType,
    getProductByCatetoryName
} from '../controllers/categoryController.js'
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get("/:slug_type", getProductByCatetoryType);
router.get("/catetory/:slug_type", getCategoryByType);
router.get('/search', searchCategories);
router.get("/name/:slug", getProductByCatetoryName)

router.use(requireAdmin);

// router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;