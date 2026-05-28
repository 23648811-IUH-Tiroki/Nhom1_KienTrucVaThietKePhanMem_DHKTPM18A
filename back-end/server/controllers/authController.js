import * as authService from "../services/authService.js";

//Đăng ký
export const signUp = async (req, res) => {
  try {
    const result = await authService.signUp(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi signup:", error.message);
    return res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

//Đăng nhập
export const signIn = async (req, res) => {
  try {
    const result = await authService.signIn(req.body, req);
    
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: result.message,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn:", error.message);
    return res.status(401).json({ message: error.message || "Lỗi hệ thống" });
  }
};

//Đăng xuất
export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const result = await authService.signOut(token, req);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi signout:", error.message);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//Yêu cầu đặt lại mật khẩu
export const requestPasswordReset = async (req, res) => {
  try {
    const result = await authService.requestPasswordReset(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi requestPasswordReset:", error.message);
    return res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

//Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi resetPassword:", error.message);
    return res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

//Gửi mã xác thực đăng ký
export const sendSignupCode = async (req, res) => {
  try {
    const result = await authService.sendSignupCode(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi sendSignupCode:", error.message);
    return res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

//Xác thực mã đăng ký và tạo tài khoản
export const verifySignup = async (req, res) => {
  try {
    const result = await authService.verifySignup(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Lỗi khi gọi verifySignup:", error.message);
    return res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};
