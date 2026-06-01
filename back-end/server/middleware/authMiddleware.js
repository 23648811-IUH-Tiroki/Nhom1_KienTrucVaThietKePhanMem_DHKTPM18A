import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logger } from "../logger/logger.js";

// Protected route: prefer JWT from Authorization header, fallback to session
export const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : null;

        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                userId = decoded?.userId || null;
            } catch (error) {
                return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
            }
        } else if (req.session?.userId) {
            userId = req.session.userId;
        }

        if (!userId) {
            return res
                .status(401)
                .json({ message: "Không tìm thấy token hoặc session. Vui lòng đăng nhập lại." });
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        // Always validate the latest account status for JWT/session users.
        if (user.isBlocked || user.status !== "Active") {
            return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa bởi hệ thống" });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error("Lỗi khi xác minh auth trong authMiddleware", { message: error.message, stack: error.stack });
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const requireAdmin = (req, res, next) => {
    if (!(req.user?.role === "admin" || req.user?.role === "superadmin")) {
        return res.status(403).json({
            message: "Bạn không có quyền truy cập trang này"
        });
    }

    next();
};