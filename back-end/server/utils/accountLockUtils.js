import User from "../models/User.js";
import { logger } from "../logger/logger.js";

const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Check if user account is locked
 * @param {Object} user - User document
 * @returns {boolean} true if account is locked
 */
export const isAccountLocked = (user) => {
  if (!user) return false;
  if (!user.lockUntil) return false;
  return user.lockUntil > new Date();
};

/**
 * Get remaining lock time in minutes
 * @param {Object} user - User document
 * @returns {number} remaining minutes, 0 if unlocked
 */
export const getRemainingLockMinutes = (user) => {
  if (!isAccountLocked(user)) return 0;
  return Math.ceil((user.lockUntil - new Date()) / 1000 / 60);
};

/**
 * Lock user account for 24 hours
 * @param {string} userId - User ID
 * @returns {Object} updated user
 */
export const lockAccountFor24Hours = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        lockUntil: new Date(Date.now() + LOCK_DURATION_MS),
        loginAttempts: MAX_LOGIN_ATTEMPTS,
      },
      { new: true }
    );
    
    logger.warn("Account locked for 24 hours", { userId });
    return user;
  } catch (error) {
    logger.error("Error locking account", { userId, error: error.message });
    throw error;
  }
};

/**
 * Unlock user account and reset login attempts
 * @param {string} userId - User ID
 * @returns {Object} updated user
 */
export const unlockAccount = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        lockUntil: null,
        loginAttempts: 0,
      },
      { new: true }
    );
    
    logger.info("Account unlocked", { userId });
    return user;
  } catch (error) {
    logger.error("Error unlocking account", { userId, error: error.message });
    throw error;
  }
};

/**
 * Check and auto-unlock account if lock period expired
 * @param {Object} user - User document
 * @returns {Object} updated user or original user
 */
export const checkAndAutoUnlock = async (user) => {
  if (!isAccountLocked(user)) {
    return user;
  }

  try {
    const updatedUser = await unlockAccount(user._id);
    return updatedUser;
  } catch (error) {
    logger.error("Error in checkAndAutoUnlock", { error: error.message });
    return user;
  }
};

/**
 * Increment login attempts and lock if needed
 * @param {Object} user - User document
 * @returns {Object} updated user
 */
export const incrementLoginAttempts = async (user) => {
  const newAttempts = (user.loginAttempts || 0) + 1;
  
  try {
    let updateData = {
      loginAttempts: newAttempts,
    };

    // Lock account after MAX_LOGIN_ATTEMPTS
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      logger.warn("Account locked due to max failed attempts", { userId: user._id });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    });

    return updatedUser;
  } catch (error) {
    logger.error("Error incrementing login attempts", {
      userId: user._id,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Reset login attempts for successful login
 * @param {Object} user - User document
 * @returns {Object} updated user
 */
export const resetLoginAttempts = async (user) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        loginAttempts: 0,
        lockUntil: null,
      },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    logger.error("Error resetting login attempts", {
      userId: user._id,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get account lock status for frontend
 * @param {Object} user - User document
 * @returns {Object} lock status info
 */
export const getAccountLockStatus = (user) => {
  const locked = isAccountLocked(user);
  const remainingMinutes = getRemainingLockMinutes(user);
  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0));

  return {
    isLocked: locked,
    lockUntil: user.lockUntil || null,
    remainingMinutes: remainingMinutes,
    loginAttempts: user.loginAttempts || 0,
    remainingAttempts: remainingAttempts,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
  };
};
