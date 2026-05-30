import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  normalizeEmail,
} from "../utils/validation.js";

describe("validation utils", () => {
  test("normalizeEmail trims + lowercases", () => {
    expect(normalizeEmail("  User@Gmail.Com ")).toBe("user@gmail.com");
  });

  test("email validation", () => {
    expect(isValidEmail("user@gmail.com")).toBe(true);
    expect(isValidEmail("test123@yahoo.com")).toBe(true);
    expect(isValidEmail("admin@company.vn")).toBe(true);

    expect(isValidEmail("abc")).toBe(false);
    expect(isValidEmail("abc@")).toBe(false);
    expect(isValidEmail("abc@gmail")).toBe(false);
    expect(isValidEmail("@gmail.com")).toBe(false);
  });

  test("password validation", () => {
    expect(isValidPassword("abc12345")).toBe(true);
    expect(isValidPassword("Password123")).toBe(true);
    expect(isValidPassword("user2025")).toBe(true);

    expect(isValidPassword("abcdefgh")).toBe(false);
    expect(isValidPassword("12345678")).toBe(false);
    expect(isValidPassword("11111111")).toBe(false);
    expect(isValidPassword("password")).toBe(false);
    expect(isValidPassword("a1b2")).toBe(false); // < 5 chars
  });

  test("phone validation", () => {
    expect(isValidPhone("0901234567")).toBe(true);
    expect(isValidPhone("09876543210")).toBe(true);

    expect(isValidPhone("abc123")).toBe(false);
    expect(isValidPhone("09a1234567")).toBe(false);
    expect(isValidPhone("09012@3456")).toBe(false);
    expect(isValidPhone("090123456")).toBe(false);
    expect(isValidPhone("090123456789")).toBe(false);
  });
});

