import { expireStaleOrders } from "../services/orderService.js";
import { logger } from "../logger/logger.js";

const DEFAULT_POLL_MS = 30 * 1000;

export const startOrderExpiryWorker = () => {
    const pollMs = Number(process.env.ORDER_EXPIRY_POLL_MS || DEFAULT_POLL_MS);

    const timer = setInterval(async () => {
        try {
            const result = await expireStaleOrders();
            if (result.expiredCount > 0) {
                logger.info("Expired stale orders", { expiredCount: result.expiredCount });
            }
        } catch (error) {
            logger.warn("Order expiry job failed", { message: error.message });
        }
    }, pollMs);

    return {
        close: async () => clearInterval(timer),
    };
};
