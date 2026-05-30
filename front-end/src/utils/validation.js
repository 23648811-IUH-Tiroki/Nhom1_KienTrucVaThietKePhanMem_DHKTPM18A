export const EMAIL_RULE_MESSAGE = "Vui lòng nhập địa chỉ email hợp lệ.";
export const PASSWORD_RULE_MESSAGE =
  "Mật khẩu phải có ít nhất 5 ký tự và bao gồm cả chữ và số.";
export const PHONE_RULE_MESSAGE =
  "Số điện thoại chỉ được chứa chữ số và có độ dài từ 10 đến 11 số.";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{5,}$/;
export const PHONE_REGEX = /^\d{10,11}$/;

export const normalizeEmail = (value) =>
  String(value || "").trim().toLowerCase();

export const isValidEmail = (value) => {
  const email = normalizeEmail(value);
  return Boolean(email) && EMAIL_REGEX.test(email);
};

export const isValidPassword = (value) =>
  PASSWORD_REGEX.test(String(value || ""));

export const isValidPhone = (value) =>
  PHONE_REGEX.test(String(value || "").trim());
