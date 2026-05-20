import express from 'express';
import {
    countCartItems,
    deleteAllProductsFromCart,
    deleteProductFromCart,
    deleteCart,
    updateCart,
    updateCartItemQuantity,
    getCartByUserId,
    addToCart
} from '../controllers/cartController.js';

const router = express.Router();

// Thêm sản phẩm vào giỏ hàng
router.post('/add', addToCart);

// Lấy giỏ hàng của user đã đăng nhập
router.get('/me', getCartByUserId);

// Cập nhật giỏ hàng của user đã đăng nhập
router.put('/me', updateCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/item/:itemId", updateCartItemQuantity);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/product/:product_id', deleteProductFromCart);

// Xóa tất cả sản phẩm khỏi giỏ hàng
router.delete('/me', deleteAllProductsFromCart);

// Xóa giỏ hàng
router.delete('/delete', deleteCart);

// Đếm số lượng sản phẩm trong giỏ hàng
router.get('/count', countCartItems);

export default router;