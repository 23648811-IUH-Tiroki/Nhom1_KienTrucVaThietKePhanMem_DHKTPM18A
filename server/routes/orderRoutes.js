import express from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderStats,
    getRecentOrders
} from "../controllers/orderController.js";

const router = express.Router();

// tạo đơn hàng mới
router.post("/", createOrder);

// lấy tất cả đơn hàng
router.get("/", getOrders);

// lấy thống kê đơn hàng
router.get("/stats", getOrderStats);

// lấy đơn hàng gần đây
router.get("/recent", getRecentOrders);

// lấy đơn hàng theo ID
router.get("/:id", getOrderById);

// cập nhật đơn hàng
router.put("/:id", updateOrder);

// xóa đơn hàng
router.delete("/:id", deleteOrder);

export default router;