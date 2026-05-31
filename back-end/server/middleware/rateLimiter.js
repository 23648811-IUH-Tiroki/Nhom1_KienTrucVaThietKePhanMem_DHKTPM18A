import rateLimit from 'express-rate-limit';

const WINDOW_MS = 1 * 60 * 1000; // 1 phút
// Giới hạn request cho toàn hệ thống: 100 request/phút/IP
export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(WINDOW_MS / 60000)} phút.`, // Thông báo khi vượt quá giới hạn
    handler: (req, res, next, options) => {
        const resetTime = req.rateLimit?.resetTime?.getTime?.() || (Date.now() + WINDOW_MS);
        const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));

        return res.status(options.statusCode).json({
            message: options.message,
            retryAfterSeconds,
            lockUntil: resetTime,
        });
    },
});
