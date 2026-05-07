import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Sessions from '../models/Session.js';

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

const getAccessTokenSecret = () => process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

// Helper functions for password hashing using crypto.pbkdf2
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
    const [salt, hash] = storedHash.split(':');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === hashedPassword;
};

export const signUp = async (req, res) => {
    try {
        const { phone, password, lastName, firstName, email, birthDate } = req.body;
        if (!phone || !password || !lastName || !firstName || !email || !birthDate) {
            return res.status(400).json({ message: "Không thể thiếu phone, password, lastName, firstName, email, birthDate!" });
        }

        //Kiểm tra user đã tồn tại?
        const duplicate = await User.findOne({ $or: [{ phone }, { email }] });
        if (duplicate) {
            return res.status(409).json({ message: "Phone hoặc email đã tồn tại!" });
        }
        //Mã hóa password
        const hashedPass = hashPassword(password);
        //Tạo user mới
        await User.create({
            phone,
            email,
            password: hashedPass,
            fullName: `${firstName} ${lastName}`,
            birthDate: new Date(birthDate)
        });
        //return
        return res.status(201).json({ message: "Đăng ký thành công!", user: { phone, email, fullName: `${firstName} ${lastName}`, birthDate } });
    } catch (error) {
        console.error("Lỗi khi gọi signup", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const signIn = async (req, res) => {
    try {
        //Lấy input 
        const { phone, password } = req.body;
        if (!phone || !password) {
            return res.status(400).json({ message: "Thiếu phone hoặc password" });
        }
        //Lấy hashedPass trong DB so sánh với pass input
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: "Phone hoặc password không đúng" });

        }
        //Kiểm tra password
        const passWordCorrect = verifyPassword(password, user.password);
        if (!passWordCorrect) {
            return res.status(401).json({ message: "Phone hoặc password không đúng" });
        }
        //Nếu khớp, tạo accessToken với JWT
        const accessTokenSecret = getAccessTokenSecret();
        if (!accessTokenSecret) {
            return res.status(500).json({ message: "Thiếu cấu hình ACCESS_TOKEN_SECRET/JWT_SECRET" });
        }
        const accessToken = jwt.sign({ userId: user._id }, accessTokenSecret, { expiresIn: ACCESS_TOKEN_TTL });
        //Tạo Refresh token
        const refreshToken = crypto.randomBytes(60).toString('hex');
        //Tạo Session mới để lưu refresh vào Token
        await Sessions.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        })
        //Trả về refresh
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, //Cookie không thể truy cập bằng JS
            secure: true, //Cookie chỉ gửi qua HTTPS
            sameSite: "none", //BE, FE deloy riêng
            maxAge: REFRESH_TOKEN_TTL
        })
        //Trả về access
        return res.status(200).json({
            message: `User ${user.fullName} đã login!`,
            accessToken: accessToken
        });
    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}

export const signOut = async (req, res) => {
    try {
        //Lất refresh từ cookie
        const token = req.cookies?.refreshToken;

        if (token) {
            //Xóa refresh trong Session
            await Sessions.deleteOne({ refreshToken: token }); //hủy phiên đăng nhập
            //Xóa cookie
            res.clearCookie("refreshToken");
        }
        return res.status(200).json({ message: "Đăng xuất thành công!" });
    } catch (error) {
        console.error("Lỗi khi gọi signout", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
}