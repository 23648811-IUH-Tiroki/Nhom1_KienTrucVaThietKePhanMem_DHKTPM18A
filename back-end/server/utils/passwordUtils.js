import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Hash password with salt (PBKDF2) for new passwords.
 * Also supports verifying legacy bcrypt hashes.
 */
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(String(password), salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    return bcrypt.compareSync(String(password), storedHash);
  }

  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const hashedPassword = crypto
    .pbkdf2Sync(String(password), salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === hashedPassword;
};

