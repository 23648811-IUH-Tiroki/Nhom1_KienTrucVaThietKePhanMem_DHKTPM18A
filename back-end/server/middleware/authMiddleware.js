import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getAccessTokenSecret = () => process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

export const protectedRoute = (req, res, next) => {
    try {
        const accessTokenSecret = getAccessTokenSecret();
        if (!accessTokenSecret) {
            return res.status(500).json({ message: "Thiếu cấu hình ACCESS_TOKEN_SECRET/JWT_SECRET" });
        }
        //Lấy token từ header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; //có 2 phần và lấy phần sau
        if (!token) {
            return res.status(401).json({
                message: "Không tìm thấy access token"
            });
        }
        //Xác nhận token hợp lệ
        jwt.verify(token, accessTokenSecret, async (err, decodeUser) => {
            if (err) {
                return res.status(403).json({
                    message: "Access token hết hạn hoặc không đúng!"
                });
            }
            //Tìm user
            const user = await User.findById(decodeUser.userId).select('-hashedPass');

            if (!user) {
                return res.status(404).json({
                    message: "Người dùng không tồn tại!"
                });
            }
            //Trả user về trong req
            req.user = user;
            next();
        })

    } catch (error) {
        console.error("Lỗi khi xác minh JWWT trong authMiddleWare", error);
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}