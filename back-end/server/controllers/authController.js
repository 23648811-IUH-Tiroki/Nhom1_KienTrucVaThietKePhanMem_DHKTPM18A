import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
// Sessions DB model removed — using Redis-based sessions only
import {
  recordLoginFailure,
  resetLoginFailures,
} from "../middleware/loginLimiter.js";
import { generateOTP } from "../utils/generateOTP.js";
import redisClient from "../configs/redisClient.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL = 60 * 60 * 1000;

// Hàm băm mật khẩu với salt riêng biệt cho mỗi mật khẩu
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

// Hàm kiểm tra mật khẩu bằng cách tách salt và hash từ storedHash
const verifyPassword = (password, storedHash) => {
  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    return bcrypt.compareSync(password, storedHash);
  }

  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === hashedPassword;
};

// Hàm tạo transporter cho nodemailer
const createMailer = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === "true",
    auth: {
      user,
      pass,
    },
  });
};

//Đăng ký
export const signUp = async (req, res) => {
  try {
    const { email, password, lastName, firstName, birthDate } = req.body;
    if (
      !password ||
      !lastName ||
      !firstName ||
      !email ||
      !birthDate
    ) {
      return res.status(400).json({
        message:
          "Không thể thiếu email, password, lastName, firstName, birthDate!",
      });
    }

    //Kiểm tra user đã tồn tại?
    const duplicate = await User.findOne({ $or: [{ email }] });
    if (duplicate) {
      return res.status(409).json({ message: "Email đã tồn tại!" });
    }
    //Mã hóa password
    const hashedPass = hashPassword(password);
    //Tạo user mới
    await User.create({
      email,
      password: hashedPass,
      fullName: `${firstName} ${lastName}`,
      birthDate: new Date(birthDate),
    });
    //return
    return res.status(201).json({
      message: "Đăng ký thành công!",
      user: { email, fullName: `${firstName} ${lastName}`, birthDate },
    });
  } catch (error) {
    console.error("Lỗi khi gọi signup", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Đăng nhập
export const signIn = async (req, res) => {
  try {
    //Lấy input
    const { email } = req.body;
    const password = req.body.password ?? req.body.passWord;
    if (!email) {
      return res.status(400).json({ message: "Thiếu email!" });
    }
    if (!password) {
      return res.status(400).json({ message: "Thiếu password!" });
    }
    //Lấy hashedPass trong DB so sánh với pass input
    const user = await User.findOne({ email });
    if (!user) {
      await recordLoginFailure(email, req.ip || req.headers["x-forwarded-for"]);
      return res
        .status(401)
        .json({ message: "Email hoặc password không đúng" });
    }
    //Kiểm tra password
    const storedPassword = user.password ?? user.passWord;
    const passWordCorrect = verifyPassword(password, storedPassword);
    if (!passWordCorrect) {
      await recordLoginFailure(email, req.ip || req.headers["x-forwarded-for"]);
      return res
        .status(401)
        .json({ message: "Email hoặc password không đúng" });
    }
    //Nếu khớp, tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    //Tạo Refresh token
    const refreshToken = crypto.randomBytes(60).toString("hex");
    // Lưu refreshToken vào Redis (tồn tại trong TTL)
    try {
      await redisClient.set(
        `refresh:${refreshToken}`,
        JSON.stringify({ userId: user._id.toString() }),
        { EX: Math.floor(REFRESH_TOKEN_TTL / 1000) },
      );
    } catch (err) {
      console.warn("Không thể lưu refreshToken vào Redis:", err.message);
    }
    // Lưu session trên server (Redis via express-session)
    if (req && req.session) {
      // Regenerate session to prevent fixation, then set values
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) return reject(err);
          req.session.userId = user._id.toString();
          req.session.email = user.email;
          req.session.refreshToken = refreshToken;
          req.session.save((err2) => (err2 ? reject(err2) : resolve()));
        });
      });
    }
    //Trả về refresh cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //Cookie không thể truy cập bằng JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", //BE, FE deloy riêng
      maxAge: REFRESH_TOKEN_TTL,
    });
    await resetLoginFailures(email, req.ip || req.headers["x-forwarded-for"]);
    //Trả về access
    return res.status(200).json({
      message: `User ${user.fullName} đã login!`,
      accessToken: accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Đăng xuất
export const signOut = async (req, res) => {
  try {
    //Lất refresh từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // (No DB sessions) — remove refresh token from Redis and destroy express-session
      // Xóa refresh token trong Redis nếu có
      try {
        await redisClient.del(`refresh:${token}`);
      } catch (err) {
        console.warn("Không thể xóa refreshToken trên Redis:", err.message);
      }
      // Destroy express-session (Redis store)
      if (req.session) {
        req.session.destroy((err) => {
          if (err) console.warn('Lỗi khi destroy session:', err.message);
        });
      }
      // Xóa cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      });
    }
    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    console.error("Lỗi khi gọi signout", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Yêu cầu đặt lại mật khẩu
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Thiếu email!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản với email này!" });
    }

    const resetCode = String(crypto.randomInt(100000, 1000000));
    await User.updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: bcrypt.hashSync(resetCode, 10),
          resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL),
        },
      },
    );

    const mailer = createMailer();
    if (!mailer) {
      return res.status(500).json({
        message: "Thiếu cấu hình SMTP để gửi email đặt lại mật khẩu.",
      });
    }

    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Mã xác thực đặt lại mật khẩu",
      text: `Mã xác thực đặt lại mật khẩu của bạn là: ${resetCode}. Mã có hiệu lực trong 60 phút.`,
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p><strong>Mã xác thực của bạn là: ${resetCode}</strong></p><p>Mã có hiệu lực trong 60 phút.</p>`,
    });

    return res
      .status(200)
      .json({ message: "Đã gửi email xác thực đặt lại mật khẩu!" });
  } catch (error) {
    console.error("Lỗi khi gọi requestPasswordReset", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, code, token, newPassword, passWord } = req.body;
    const password = newPassword ?? passWord;
    const resetCode = code ?? token;

    if (!email || !resetCode || !password) {
      return res
        .status(400)
        .json({ message: "Thiếu email, mã xác thực hoặc mật khẩu mới!" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }

    const codeMatches = bcrypt.compareSync(resetCode, user.resetPasswordToken);
    if (!codeMatches) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashPassword(password),
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      },
    );

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi khi gọi resetPassword", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Gửi mã xác thực đăng ký
export const sendSignupCode = async (req, res) => {
  try {
    const { email, password, lastName, firstName, birthDate } = req.body;
    if (
      !email ||
      !password ||
      !lastName ||
      !firstName ||
      !birthDate
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin đăng ký. Vui lòng điền đầy đủ." });
    }

    const existing = await User.findOne({ $or: [{ email }] });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email đã được sử dụng." });
    }
    //Chống Spam: Kiểm tra nếu đã gửi code trong 60s qua Redis
    const resendKey = `signup_cooldown:${email}`;
    const cooldown = await redisClient.get(resendKey);
    if (cooldown) {
      return res
        .status(429)
        .json({ message: "Vui lòng chờ trước khi yêu cầu mã xác thực mới." });
    }
    //Tạo OTP
    const signupCode = generateOTP();
    const hashedOTP = bcrypt.hashSync(signupCode, 10);

    // store hashed password using same method as signUp
    const storedPassword = hashPassword(password);

    const payload = {
      email,
      password: storedPassword,
      lastName,
      firstName,
      birthDate: new Date(birthDate),
    };

    //Lưu vào redis và hết hạng trong 60s
    await redisClient.set(
      `signup:${email}`,
      JSON.stringify({ code: hashedOTP, payload }),
      { EX: 60 }, //60 giay
    );

    //Gửi email chứa OTP
    const mailer = createMailer();
    if (!mailer) {
      return res
        .status(500)
        .json({ message: "Thiếu cấu hình SMTP để gửi email." });
    }
    // Gửi email với mã OTP
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Mã xác thực đăng ký tài khoản",
      text: `Mã xác thực đăng ký của bạn là: ${signupCode}. Mã có hiệu lực trong 1 phút.`,
      html: `<p>Mã xác thực đăng ký của bạn là: <strong>${signupCode}</strong></p><p>Mã có hiệu lực trong 1 phút.</p>`,
    });

    await redisClient.set(resendKey, "1", { EX: 60 }); //Đặt khóa chống spam trong 60s
    return res.status(200).json({ message: "Đã gửi mã xác thực đến email." });
  } catch (error) {
    console.error("Lỗi khi gọi sendSignupCode", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Xác thực mã đăng ký và tạo tài khoản
export const verifySignup = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Thiếu email hoặc mã xác thực." });
    }
    // Lấy dữ liệu từ Redis
    const redisData = await redisClient.get(`signup:${email}`);
    if (!redisData) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
    }
    // Parse dữ liệu từ Redis để lấy mã OTP và payload
    const parsedData = JSON.parse(redisData);
    //Sai ma OTP
    const isCodeValid = bcrypt.compareSync(code, parsedData.code);
    if (!isCodeValid) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn." });
    }
    const payload = parsedData.payload;

    const existing = await User.findOne({
      $or: [{ email }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email đã được sử dụng." });
    }
    //Tạo user mới
    await User.create({
      email: payload.email,
      password: payload.password,
      fullName: `${payload.firstName} ${payload.lastName}`,
      birthDate: payload.birthDate,
    });

    //Xoa otp
    await redisClient.del(`signup:${email}`);
    //Xoa khóa chống spam
    await redisClient.del(`signup_cooldown:${email}`);
    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi khi gọi verifySignup", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
