import { getLockStatus } from "../utils/redisLoginLock.js";
import { logger } from "../logger/logger.js";

export const loginLimiter = async (req, res, next) => {
  const email = req.body?.email;
  if (!email) {
    return res.status(400).json({ message: "Vui lòng nhập email." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const lockStatus = await getLockStatus(normalizedEmail);
    logger.debug("loginLimiter lock check", {
      email: normalizedEmail,
      isLocked: lockStatus.isLocked,
      lockUntil: lockStatus.lockUntil,
      remainingMs: lockStatus.remainingMs,
      ttl: lockStatus.ttl,
      attempts: lockStatus.attempts,
    });

    if (lockStatus.isLocked) {
      return res.status(429).json({
        message: lockStatus.message,
        retryAfterSeconds: Math.max(0, Math.ceil(lockStatus.remainingMs / 1000)),
        lockUntil: lockStatus.lockUntil,
      });
    }

    req.loginLimiterData = { email: normalizedEmail };
    next();
  } catch (error) {
    logger.warn("Redis login limiter unavailable", {
      email: normalizedEmail,
      message: error.message,
    });
    next();
  }
};
