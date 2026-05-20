import rateLimit from 'express-rate-limit';

const WINDOW_MS = 1 * 60 * 1000; // 1 phút
// Giới hạn request cho toàn hệ thống: 100 request/phút/IP
export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(WINDOW_MS / 60000)} phút.`, // Thông báo khi vượt quá giới hạn
});
