//gio han dang nhap sai
export const getPolicy = (count) => {
  // Sau 20 lần thất bại, khóa trong 24 giờ
  if (count >= 20) {
    return {
      delay: 24 * 60 * 60, //24h
    //   block24h: true, //khoa 24h
      message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 24 giờ.",
    };
  }
  // Sau 10 lần thất bại, khóa trong 1 giờ và gửi email cảnh báo
  if (count >= 10) {
    return {
      delay: 60 * 60, //1h
    //   sendMail: true, //gửi email cảnh báo 
      message:
        "Bạn đã đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau một thời gian.",
    };
  }
  //sai 5 lần, khóa trong 3 phút
  if (count >= 5) {
    return {
      delay: 3 * 60, //3 phút
      message: `Bạn đã đăng nhập thất bại ${count} lần. Vui lòng thử lại sau một thời gian.`,
    };
  }
  //sai 3 lần, khóa trong 30 giây
  if (count >= 3) {
    return {
      delay: 30, // 15 giây
      message: `Bạn đã đăng nhập thất bại ${count} lần. Vui lòng thử lại sau một thời gian.`,
    };
  }
  // Mặc định: không giới hạn khi count < 3
  return {
    delay: 0,
    message: "Đăng nhập",
  };
};