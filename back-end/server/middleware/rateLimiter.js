import rateLimit from 'express-rate-limit';

const WINDOW_MS = 1 * 60 * 1000; // 15 phút
//Chặn request cho toàn bộ hệ thống, mỗi IP chỉ được phép gửi tối đa 100 request trong vòng 15 phút
export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 10,
    message: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(WINDOW_MS / 60000)} phút.`, // Thông báo khi vượt quá giới hạn
});
