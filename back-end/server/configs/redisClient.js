import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";
import { logger } from "../logger/logger.js";

// Tạo một client Redis mới
const redisClient = createClient({
    url: process.env.REDIS_URL
});

// Xử lý lỗi kết nối Redis
redisClient.on("error", (err) => {
    logger.error("Redis client error", { message: err.message });
});

// Kết nối đến Redis
await redisClient.connect();
logger.info("Kết nối Redis thành công!");

export default redisClient;