import Redis from "ioredis";
import { getPolicy } from "../utils/getPolicy.js";
import { logger } from "../logger/logger.js";
const redis = new Redis(); // Kết nối đến Redis

const buildLoginKeys = (email, ip) => ({
  shortKey: `login_fail:${email}:${ip}`,
  longKey: `login_fail_24h:${email}`,
});

export const recordLoginFailure = async (email, ip) => {
  if (!email) {
    return;
  }

  const { shortKey, longKey } = buildLoginKeys(email, ip);
  const now = Date.now();
  let data = await redis.get(shortKey);
  data = data ? JSON.parse(data) : { count: 0, lastFail: now };

  if (now - data.lastFail > 15 * 60 * 1000) {
    data = { count: 0, lastFail: now };
  }

  data.count += 1;
  data.lastFail = now;

  await redis.set(shortKey, JSON.stringify(data), "EX", 15 * 60);
  await redis.set(longKey, String(data.count), "EX", 24 * 60 * 60);
};

export const resetLoginFailures = async (email, ip) => {
  if (!email) {
    return;
  }

  const { shortKey } = buildLoginKeys(email, ip);
  await redis.del(shortKey);
};

//Giới hạn đăng nhập
export const loginLimiter = async (req, res, next) => {
  try {
    const ip = req.ip;// Lấy địa chỉ IP của người dùng
    const { email } = req.body;

    if(!email) {
      return res.status(400).json({ message: "Vui lòng nhập email." });
    }
    const { shortKey, longKey } = buildLoginKeys(email, ip);
    let data = await redis.get(shortKey);
    data = data ? JSON.parse(data) : { count: 0, lastFail: Date.now() };

    const now = Date.now();

    //kiem tra 24h sau 20 lan that bai
    const fail24h = await redis.get(longKey);
    if(fail24h && Number(fail24h) >= 20) {
        return res.status(429).json({
            message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 24 giờ.",
        retryAfterSeconds: 24 * 60 * 60,
        lockUntil: Date.now() + 24 * 60 * 60 * 1000,
        });
    }
    
    // //kiem tra so lan sai hien tai
    // let data = await redis.get(shortKey);
    // data = data ? JSON.parse(data) : { count: 0, lastFail: now }; //khởi tạo với count = 0 và lastFail là thời điểm hiện tại
    
    //reset count sau 15 phút nếu không có lần đăng nhập thất bại nào
    if(now - data.lastFail > 15 * 60 * 1000) { //15 phút
        data = { count: 0, lastFail: now };
    }

    const policy = getPolicy(data.count); // Lấy chính sách giới hạn dựa trên số lần thất bại
    if(policy.delay > 0) {
        const waitTime = data.lastFail + policy.delay * 1000 - now; // Tính thời gian còn lại cần chờ`
        
        if(waitTime > 0) {
          return res.status(429).json({ 
            message: `Vui lòng chờ ${Math.ceil(waitTime / 1000)} giây trước khi thử lại.`,
            retryAfterSeconds: Math.ceil(waitTime / 1000),
            lockUntil: Date.now() + waitTime,
          }); // Trả về lỗi nếu người dùng cần chờ
        }
    }
    // Nếu đăng nhập thất bại, tăng số lần thất bại và cập nhật thời điểm thất bại
    req.loginLimiterData = { shortKey, longKey, data, email, ip }; // Lưu key và data để controller có thể ghi nhận thất bại
    next();
  } catch (error) {
    logger.error("Lỗi khi xử lý giới hạn đăng nhập", { message: error.message, stack: error.stack });
    next(); // Trong trường hợp có lỗi, vẫn cho phép tiếp tục xử lý đăng nhập để tránh gây ảnh hưởng đến trải nghiệm người dùng. Tuy nhiên, bạn có thể tùy chỉnh để trả về lỗi nếu muốn.
  }
};
