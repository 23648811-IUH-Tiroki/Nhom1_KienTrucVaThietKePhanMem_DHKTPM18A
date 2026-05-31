export const sendControllerError = (res, error, fallbackStatus = 500) => {
  const statusCode = error?.statusCode || fallbackStatus;

  if (error?.payload) {
    return res.status(statusCode).json(error.payload);
  }

  return res.status(statusCode).json({
    message: error?.message || "Lỗi hệ thống",
  });
};