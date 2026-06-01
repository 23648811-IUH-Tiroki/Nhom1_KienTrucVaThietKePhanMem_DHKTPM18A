import { logger } from "../logger/logger.js";

logger.warn(
  "Deprecated accountLockUtils.js is no longer used. Use redisLoginLock.js for Redis-only login state.",
);

export {};
