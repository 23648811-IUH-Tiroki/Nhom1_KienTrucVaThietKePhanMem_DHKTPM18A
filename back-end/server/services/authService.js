import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { recordLoginFailure, resetLoginFailures } from "../middleware/loginLimiter.js";
import { generateOTP } from "../utils/generateOTP.js";
import redisClient from "../configs/redisClient.js";
import { enqueueOtpEmail } from "../queues/otpQueue.js";
import { logger } from "../logger/logger.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL = 60 * 60 * 1000;
const FORGOT_PASSWORD_TTL_SECONDS = 5 * 60;
const FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS = 60;
const FORGOT_PASSWORD_MAX_RESENDS = 5;
const FORGOT_PASSWORD_MAX_ATTEMPTS = 5;
const FORGOT_PASSWORD_KEY_PREFIX = "forgot_password";

// ============ Helper Functions ============

/**
 * Hash password with salt
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

/**
 * Verify password against stored hash
 */
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

const getForgotPasswordKey = (email) => `${FORGOT_PASSWORD_KEY_PREFIX}:${String(email).trim().toLowerCase()}`;

const getForgotPasswordCooldownKey = (email) => `${FORGOT_PASSWORD_KEY_PREFIX}:cooldown:${String(email).trim().toLowerCase()}`;

const readForgotPasswordState = async (email) => {
  const rawState = await redisClient.get(getForgotPasswordKey(email));

  if (!rawState) {
    return null;
  }

  try {
    return JSON.parse(rawState);
  } catch (error) {
    logger.warn("Invalid forgot-password Redis payload", {
      email,
      message: error.message,
    });
    return null;
  }
};

const persistForgotPasswordState = async (email, state) => {
  await redisClient.set(getForgotPasswordKey(email), JSON.stringify(state), {
    EX: FORGOT_PASSWORD_TTL_SECONDS,
  });
};

const createForgotPasswordState = (email, otpHash, otpPlain) => {
  const now = new Date().toISOString();

  return {
    email: String(email).trim().toLowerCase(),
    otpHash,
    verified: false,
    used: false,
    verifyAttempts: 0,
    resendCount: 0,
    expiresAt: new Date(Date.now() + FORGOT_PASSWORD_TTL_SECONDS * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
    verifiedAt: null,
    usedAt: null,
  };
};

const buildForgotPasswordEmail = (otp) => ({
  subject: "Mã xác thực đặt lại mật khẩu",
  text: `Mã xác thực đặt lại mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong 1 phút.`,
  html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p><strong>Mã xác thực của bạn là: ${otp}</strong></p><p>Mã có hiệu lực trong 1 phút.</p>`,
});

const queueForgotPasswordOtp = async ({ email, otp, purpose }) => {
  await enqueueOtpEmail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    email,
    purpose,
    otp,
    ...buildForgotPasswordEmail(otp),
  });
};

const normalizeForgotPasswordError = (message) => {
  return message || "Không thể xử lý yêu cầu đặt lại mật khẩu.";
};

// ============ Service Functions ============

/**
 * Sign up new user
 */
export const signUp = async (userData) => {
  const { email, password, lastName, firstName, birthDate } = userData;

  if (!password || !lastName || !firstName || !email || !birthDate) {
    throw new Error("Không thể thiếu email, password, lastName, firstName, birthDate!");
  }

  const duplicate = await User.findOne({ $or: [{ email }] });
  if (duplicate) {
    throw new Error("Email đã tồn tại!");
  }

  const hashedPass = hashPassword(password);
  await User.create({
    email,
    password: hashedPass,
    fullName: `${firstName} ${lastName}`,
    birthDate: new Date(birthDate),
  });

  return {
    message: "Đăng ký thành công!",
    user: { email, fullName: `${firstName} ${lastName}`, birthDate },
  };
};

/**
 * Sign in user
 */
export const signIn = async (userData, req) => {
  const { email } = userData;
  const password = userData.password ?? userData.passWord;

  if (!email) {
    throw new Error("Thiếu email!");
  }
  if (!password) {
    throw new Error("Thiếu password!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    await recordLoginFailure(email, req.ip || req.headers["x-forwarded-for"]);
    throw new Error("Email hoặc password không đúng");
  }

  if (user.isBlocked) {
    await recordLoginFailure(email, req.ip || req.headers["x-forwarded-for"]);
    throw new Error("Tài khoản đã bị khóa.");
  }

  const storedPassword = user.password ?? user.passWord;
  const passWordCorrect = verifyPassword(password, storedPassword);
  if (!passWordCorrect) {
    await recordLoginFailure(email, req.ip || req.headers["x-forwarded-for"]);
    throw new Error("Email hoặc password không đúng");
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

  const refreshToken = crypto.randomBytes(60).toString("hex");

  try {
    await redisClient.set(
      `refresh:${refreshToken}`,
      JSON.stringify({ userId: user._id.toString() }),
      { EX: Math.floor(REFRESH_TOKEN_TTL / 1000) }
    );
  } catch (err) {
    logger.warn("Không thể lưu refreshToken vào Redis", { message: err.message });
  }

  if (req && req.session) {
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

  await resetLoginFailures(email, req.ip || req.headers["x-forwarded-for"]);

  return {
    message: `User ${user.fullName} đã login!`,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

/**
 * Sign out user
 */
export const signOut = async (token, req) => {
  if (token) {
    try {
      await redisClient.del(`refresh:${token}`);
    } catch (err) {
      logger.warn("Không thể xóa refreshToken trên Redis", { message: err.message });
    }

    if (req.session) {
      req.session.destroy((err) => {
        if (err) logger.warn("Lỗi khi destroy session", { message: err.message });
      });
    }
  }

  return {
    message: "Đăng xuất thành công!",
  };
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (userData) => {
  const { email } = userData;

  if (!email) {
    throw new Error("Thiếu email!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Không tìm thấy tài khoản với email này!");
  }

  const resetCode = String(crypto.randomInt(100000, 1000000));
  const otpHash = bcrypt.hashSync(resetCode, 10);
  const forgotPasswordState = createForgotPasswordState(email, otpHash);

  await persistForgotPasswordState(email, forgotPasswordState);
  await redisClient.set(getForgotPasswordCooldownKey(email), "1", {
    EX: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
  });
  await queueForgotPasswordOtp({ email, otp: resetCode, purpose: "password-reset" });

  logger.info("Forgot-password OTP requested", {
    email,
    resendCooldownSeconds: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
    otpExpiresInSeconds: FORGOT_PASSWORD_TTL_SECONDS,
  });

  return {
    message: "Đã gửi mã xác thực đặt lại mật khẩu!",
    nextResendInSeconds: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
    otpExpiresInSeconds: FORGOT_PASSWORD_TTL_SECONDS,
  };
};

/**
 * Verify forgot-password OTP
 */
export const verifyPasswordResetOtp = async (userData) => {
  const { email, code, otp } = userData;
  const inputOtp = String(code ?? otp ?? "").trim();

  if (!email || !inputOtp) {
    throw new Error("Thiếu email hoặc mã OTP!");
  }

  const state = await readForgotPasswordState(email);
  if (!state) {
    throw new Error("OTP không tồn tại hoặc đã hết hạn!");
  }

  const isExpired = !state.expiresAt || new Date(state.expiresAt).getTime() < Date.now();
  if (isExpired) {
    await redisClient.del(getForgotPasswordKey(email));
    await redisClient.del(getForgotPasswordCooldownKey(email));
    throw new Error("OTP đã hết hạn!");
  }

  if (state.used) {
    throw new Error("OTP đã được sử dụng!");
  }

  if (state.verifyAttempts >= FORGOT_PASSWORD_MAX_ATTEMPTS) {
    throw new Error("Bạn đã nhập sai OTP quá nhiều lần!");
  }

  const isOtpValid = bcrypt.compareSync(inputOtp, state.otpHash);
  if (!isOtpValid) {
    const updatedState = {
      ...state,
      verifyAttempts: state.verifyAttempts + 1,
      updatedAt: new Date().toISOString(),
    };

    await persistForgotPasswordState(email, updatedState);

    if (updatedState.verifyAttempts >= FORGOT_PASSWORD_MAX_ATTEMPTS) {
      throw new Error("Bạn đã nhập sai OTP quá nhiều lần!");
    }

    throw new Error("OTP không đúng!");
  }

  const verifiedState = {
    ...state,
    verified: true,
    verifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verifyAttempts: 0,
  };

  await persistForgotPasswordState(email, verifiedState);

  logger.info("Forgot-password OTP verified", {
    email,
    verifyAttempts: verifiedState.verifyAttempts,
  });

  return {
    message: "Xác thực OTP thành công!",
    verified: true,
    otpExpiresInSeconds: Math.max(0, Math.floor((new Date(verifiedState.expiresAt).getTime() - Date.now()) / 1000)),
  };
};

/**
 * Resend forgot-password OTP
 */
export const resendPasswordResetOtp = async (userData) => {
  const { email } = userData;

  if (!email) {
    throw new Error("Thiếu email!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Không tìm thấy tài khoản với email này!");
  }

  const cooldown = await redisClient.get(getForgotPasswordCooldownKey(email));
  if (cooldown) {
    throw new Error(`Vui lòng chờ ${FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS}s trước khi gửi lại mã OTP.`);
  }

  const state = await readForgotPasswordState(email);
  if (!state) {
    throw new Error("OTP không tồn tại hoặc đã hết hạn!");
  }

  if (state.resendCount >= FORGOT_PASSWORD_MAX_RESENDS) {
    throw new Error("Bạn đã vượt quá số lần gửi lại OTP!");
  }

  const newOtp = String(crypto.randomInt(100000, 1000000));
  const newOtpHash = bcrypt.hashSync(newOtp, 10);
  const nextState = {
    ...state,
    otpHash: newOtpHash,
    otpPlain: newOtp,
    verified: false,
    used: false,
    verifyAttempts: 0,
    resendCount: state.resendCount + 1,
    expiresAt: new Date(Date.now() + FORGOT_PASSWORD_TTL_SECONDS * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await persistForgotPasswordState(email, nextState);
  await redisClient.set(getForgotPasswordCooldownKey(email), "1", {
    EX: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
  });
  await queueForgotPasswordOtp({ email, otp: newOtp, purpose: "password-reset-resend" });

  logger.info("Forgot-password OTP resent", {
    email,
    resendCount: nextState.resendCount,
    resendCooldownSeconds: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
    otpExpiresInSeconds: FORGOT_PASSWORD_TTL_SECONDS,
  });

  return {
    message: "Đã gửi lại mã OTP!",
    nextResendInSeconds: FORGOT_PASSWORD_RESEND_COOLDOWN_SECONDS,
    otpExpiresInSeconds: FORGOT_PASSWORD_TTL_SECONDS,
  };
};

/**
 * Reset password with code
 */
export const resetPassword = async (userData) => {
  const { email, newPassword, passWord } = userData;
  const password = newPassword ?? passWord;

  if (!email || !password) {
    throw new Error("Thiếu email hoặc mật khẩu mới!");
  }

  const state = await readForgotPasswordState(email);
  if (!state) {
    throw new Error("OTP không tồn tại hoặc đã hết hạn!");
  }

  const isExpired = !state.expiresAt || new Date(state.expiresAt).getTime() < Date.now();
  if (isExpired) {
    await redisClient.del(getForgotPasswordKey(email));
    await redisClient.del(getForgotPasswordCooldownKey(email));
    throw new Error("OTP đã hết hạn!");
  }

  if (!state.verified) {
    throw new Error("Vui lòng xác thực OTP trước khi đặt lại mật khẩu!");
  }

  if (state.used) {
    throw new Error("OTP đã được sử dụng!");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Không tìm thấy tài khoản với email này!");
  }

  await User.updateOne(
    { email },
    {
      $set: {
        password: hashPassword(password),
      },
    }
  );

  await redisClient.del(getForgotPasswordKey(email));
  await redisClient.del(getForgotPasswordCooldownKey(email));
  await redisClient.del(`${FORGOT_PASSWORD_KEY_PREFIX}:resendcount:${String(email).trim().toLowerCase()}`);

  logger.info("Forgot-password reset succeeded", {
    email,
    userId: user._id.toString(),
  });

  return {
    message: "Đặt lại mật khẩu thành công!",
  };
};

/**
 * Send signup verification code
 */
export const sendSignupCode = async (userData) => {
  const { email, password, lastName, firstName, birthDate } = userData;

  if (!email || !password || !lastName || !firstName || !birthDate) {
    throw new Error("Thiếu thông tin đăng ký. Vui lòng điền đầy đủ.");
  }

  const existing = await User.findOne({ $or: [{ email }] });
  if (existing) {
    throw new Error("Email đã được sử dụng.");
  }

  const resendKey = `signup_cooldown:${email}`;
  const cooldown = await redisClient.get(resendKey);
  if (cooldown) {
    throw new Error("Vui lòng chờ trước khi yêu cầu mã xác thực mới.");
  }

  const signupCode = generateOTP();
  const hashedOTP = bcrypt.hashSync(signupCode, 10);
  const storedPassword = hashPassword(password);

  const payload = {
    email,
    password: storedPassword,
    lastName,
    firstName,
    birthDate: new Date(birthDate),
  };

  await redisClient.set(
    `signup:${email}`,
    JSON.stringify({ code: hashedOTP, payload }),
    { EX: 60 }
  );

  if (!hasMailerConfig()) {
    if (process.env.NODE_ENV !== "production") {
      return {
        message: "SMTP chưa được cấu hình. Mã đăng ký được trả về cho môi trường dev.",
        devCode: signupCode,
      };
    }

    throw new Error("Thiếu cấu hình SMTP để gửi email.");
  }

  await enqueueOtpEmail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    email,
    purpose: "signup-verification",
    subject: "Mã xác thực đăng ký tài khoản",
    text: `Mã xác thực đăng ký của bạn là: ${signupCode}. Mã có hiệu lực trong 1 phút.`,
    html: `<p>Mã xác thực đăng ký của bạn là: <strong>${signupCode}</strong></p><p>Mã có hiệu lực trong 1 phút.</p>`,
    code: signupCode,
  });

  await redisClient.set(resendKey, "1", { EX: 60 });

  return {
    message: "Đã gửi mã xác thực đến email.",
  };
};

/**
 * Verify signup code and create user
 */
export const verifySignup = async (userData) => {
  const { email, code } = userData;

  if (!email || !code) {
    throw new Error("Thiếu email hoặc mã xác thực.");
  }

  const redisData = await redisClient.get(`signup:${email}`);
  if (!redisData) {
    throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn.");
  }

  const parsedData = JSON.parse(redisData);
  const isCodeValid = bcrypt.compareSync(code, parsedData.code);
  if (!isCodeValid) {
    throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn.");
  }

  const payload = parsedData.payload;

  const existing = await User.findOne({
    $or: [{ email }],
  });
  if (existing) {
    throw new Error("Email đã được sử dụng.");
  }

  await User.create({
    email: payload.email,
    password: payload.password,
    fullName: `${payload.firstName} ${payload.lastName}`,
    birthDate: payload.birthDate,
  });

  await redisClient.del(`signup:${email}`);
  await redisClient.del(`signup_cooldown:${email}`);

  return {
    message: "Đăng ký thành công!",
  };
};
