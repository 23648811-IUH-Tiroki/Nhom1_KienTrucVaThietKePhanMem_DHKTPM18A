import redisClient from "../configs/redisClient.js";
import { logger } from "../logger/logger.js";

const ATTEMPTS_PREFIX = "login_attempts:";
const LOCK_PREFIX = "lock:";
const ATTEMPTS_TTL_SECONDS = 24 * 60 * 60;

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getAttemptsKey = (email) => `${ATTEMPTS_PREFIX}${normalizeEmail(email)}`;
const getLockKey = (email) => `${LOCK_PREFIX}${normalizeEmail(email)}`;

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRemainingLockText = (remainingMs) => {
  if (remainingMs <= 0) return "0 giờ 0 phút";
  const roundedMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return `${hours} giờ`;
};

const formatLockMessage = (remainingMs) =>
  `Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau ${getRemainingLockText(
    remainingMs,
  )}.`;

export const getLockStatus = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return {
      isLocked: false,
      lockUntil: null,
      remainingMs: 0,
      ttl: null,
      message: null,
    };
  }

  try {
    const lockKey = getLockKey(normalizedEmail);
    const rawLockUntil = await redisClient.get(lockKey);
    const attempts = await getAttemptCount(normalizedEmail);

    logger.debug("Redis getLockStatus raw value", {
      email: normalizedEmail,
      lockKey,
      rawLockUntil,
      attempts,
    });

    if (!rawLockUntil) {
      return {
        isLocked: false,
        lockUntil: null,
        remainingMs: 0,
        ttl: null,
        attempts,
        message: null,
      };
    }

    const lockUntil = parseNumber(rawLockUntil);
    const now = Date.now();
    if (lockUntil <= now) {
      await redisClient.del(lockKey);
      return {
        isLocked: false,
        lockUntil: null,
        remainingMs: 0,
        ttl: null,
        message: null,
      };
    }

    const remainingMs = lockUntil - now;
    const ttl = await redisClient.ttl(lockKey);

    logger.debug("Redis lock status", {
      lockKey,
      lockUntil,
      remainingMs,
      ttl,
    });

    return {
      isLocked: true,
      lockUntil,
      remainingMs,
      ttl,
      attempts,
      message: formatLockMessage(remainingMs),
    };
  } catch (error) {
    logger.warn("Redis lock check failed", {
      email: normalizedEmail,
      message: error.message,
    });

    return {
      isLocked: false,
      lockUntil: null,
      remainingMs: 0,
      ttl: null,
      message: null,
    };
  }
};

export const recordFailedLogin = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return {
      attempts: 0,
      isLocked: false,
      lockUntil: null,
      remainingMs: 0,
      message: null,
    };
  }

  try {
    const lockStatus = await getLockStatus(normalizedEmail);
    if (lockStatus.isLocked) {
      return lockStatus;
    }

    const attemptsKey = getAttemptsKey(normalizedEmail);
    const attempts = await redisClient.incr(attemptsKey);
    await redisClient.expire(attemptsKey, ATTEMPTS_TTL_SECONDS);

    logger.debug("Redis recordFailedLogin attempt", {
      email: normalizedEmail,
      attemptsKey,
      attempts,
      lockThreshold: LOCK_THRESHOLD,
    });

    let lockUntil = null;
    let remainingMs = 0;
    let ttl = null;
    let message = null;

    if (attempts >= LOCK_THRESHOLD) {
      const lockKey = getLockKey(normalizedEmail);
      lockUntil = Date.now() + LOCK_DURATION_MS;
      await redisClient.set(lockKey, String(lockUntil), {
        EX: Math.ceil(LOCK_DURATION_MS / 1000),
      });
      await redisClient.del(attemptsKey);
      remainingMs = LOCK_DURATION_MS;
      ttl = await redisClient.ttl(lockKey);
      message = formatLockMessage(remainingMs);
    }

    logger.debug("Redis failed login", {
      attemptsKey,
      attempts,
      lockKey: lockUntil ? getLockKey(normalizedEmail) : null,
      lockUntil,
      ttl,
    });

    return {
      attempts,
      isLocked: Boolean(lockUntil),
      lockUntil,
      remainingMs,
      ttl,
      message,
    };
  } catch (error) {
    logger.warn("Redis failed login write failed", {
      email: normalizedEmail,
      message: error.message,
    });

    return {
      attempts: 0,
      isLocked: false,
      lockUntil: null,
      remainingMs: 0,
      message: null,
    };
  }
};

export const resetLoginState = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  try {
    const attemptsKey = getAttemptsKey(normalizedEmail);
    const lockKey = getLockKey(normalizedEmail);

    await redisClient.del(attemptsKey, lockKey);
    logger.debug("Redis login state reset", {
      attemptsKey,
      lockKey,
    });
  } catch (error) {
    logger.warn("Redis reset login state failed", {
      email: normalizedEmail,
      message: error.message,
    });
  }
};

export const getAttemptCount = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return 0;

  try {
    const raw = await redisClient.get(getAttemptsKey(normalizedEmail));
    return parseNumber(raw);
  } catch (error) {
    logger.warn("Redis get attempt count failed", {
      email: normalizedEmail,
      message: error.message,
    });
    return 0;
  }
};
