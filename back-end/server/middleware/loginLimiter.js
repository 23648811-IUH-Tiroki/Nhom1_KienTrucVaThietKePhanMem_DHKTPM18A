import Redis from "ioredis";
import { getPolicy } from "../utils/getPolicy.js";
const redis = new Redis(); // Kết nối đến Redis

//Giới hạn đăng nhập
export const loginLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"]; // Lấy địa chỉ IP của người dùng
    const { phone } = req.body;

    if(!phone) {
      return res.status(400).json({ message: "Vui lòng nhập số điện thoại." });
    }
    //key theo IP và phone để giới hạn đăng nhập
    const shortKey = `login_fail:${phone}:${ip}`; 
    const longKey = `login_fail_24h:${phone}`; //key theo phone để khóa 24h sau 20 lần thất bại
    let data = await redis.get(shortKey); // Lấy số lần đăng nhập thất bại từ Redis
    data = data ? JSON.parse(data) : { count: 0, lastFail: Date.now() }; // Nếu không có dữ liệu, khởi tạo với count = 0 và lastFail là thời điểm hiện tại
    
    const now = Date.now();

    //kiem tra 24h sau 20 lan that bai
    const fail24h = await redis.get(longKey);
    if(fail24h && Number(fail24h) >= 20) {
        return res.status(429).json({
            message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 24 giờ.",
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
            return res.status(429).json({ message: `Vui lòng chờ ${Math.ceil(waitTime / 1000)} giây trước khi thử lại.` }); // Trả về lỗi nếu người dùng cần chờ
        }
    }
    // Nếu đăng nhập thất bại, tăng số lần thất bại và cập nhật thời điểm thất bại
    req.loginLimiterData = { shortKey, longKey, data }; // Lưu key và data vào req để có thể sử dụng trong controller
    next();
  } catch (error) {
    console.error("Lỗi khi xử lý giới hạn đăng nhập:", error);
    next(); // Trong trường hợp có lỗi, vẫn cho phép tiếp tục xử lý đăng nhập để tránh gây ảnh hưởng đến trải nghiệm người dùng. Tuy nhiên, bạn có thể tùy chỉnh để trả về lỗi nếu muốn.
  }
};
