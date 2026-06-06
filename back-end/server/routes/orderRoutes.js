import express from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderStats,
    getRecentOrders,
    confirmOrderPayment,
    expireOrder,
    getActivePaymentOrder,
} from "../controllers/orderController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// tạo đơn hàng mới
router.post("/", createOrder);

// lấy tất cả đơn hàng (admin xem tất cả, user chỉ xem của mình)
router.get("/", getOrders);

// thống kê đơn hàng (admin)
router.get("/stats", requireAdmin, getOrderStats);

// đơn hàng gần đây (admin)
router.get("/recent", requireAdmin, getRecentOrders);

// đơn đang chờ thanh toán của user hiện tại
router.get("/active-payment", getActivePaymentOrder);

// xác nhận thanh toán
router.post("/:id/pay", confirmOrderPayment);

// hết hạn thanh toán
router.post("/:id/expire", expireOrder);

// lấy đơn hàng theo ID (admin hoặc chủ đơn)
router.get("/:id", getOrderById);

// cập nhật đơn hàng:
// - admin: cập nhật mọi trạng thái
// - user: chỉ được huỷ đơn của chính mình
router.put("/:id", updateOrder);

// xoá đơn hàng (admin)
router.delete("/:id", requireAdmin, deleteOrder);

export default router;
