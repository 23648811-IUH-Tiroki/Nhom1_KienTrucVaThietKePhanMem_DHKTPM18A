import express from 'express';
import {
    getAllProducts,
    getProductByName,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsSale,
    searchProducts,
    filterProductsByPrice,
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/', getAllProducts);
router.get("/product/sales", getProductsSale)
router.get('/:slug', getProductByName);
router.post("/filterPrice", filterProductsByPrice)

router.use(requireAdmin);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;