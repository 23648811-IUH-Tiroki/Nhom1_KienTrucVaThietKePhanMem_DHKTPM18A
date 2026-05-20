import dotenv from "dotenv";
dotenv.config();
import { createClient } from "redis";

// Tạo một client Redis mới
const redisClient = createClient({
    url: process.env.REDIS_URL
});

// Xử lý lỗi kết nối Redis
redisClient.on("error", (err) => {
    console.error("Lỗi Redis:", err);
});

// Kết nối đến Redis
await redisClient.connect();
console.log("Kết nối Redis thành công!");

export default redisClient;