import User from '../models/User.js';

// Session-based protected route: require `req.session.userId` (stored in Redis)
export const protectedRoute = async (req, res, next) => {
    try {
        const sessionUserId = req.session?.userId;
        if (!sessionUserId) {
            return res.status(401).json({ message: "Không tìm thấy session. Vui lòng đăng nhập lại." });
        }
        const user = await User.findById(sessionUserId).select('-hashedPass');
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Lỗi khi xác minh session trong authMiddleware", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Bạn không có quyền truy cập trang này"
        });
    }

    next();
};