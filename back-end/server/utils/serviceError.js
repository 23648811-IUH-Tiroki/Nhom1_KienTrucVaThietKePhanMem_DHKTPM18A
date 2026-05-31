export const createServiceError = (message, statusCode = 500, payload = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  if (payload !== null) {
    error.payload = payload;
  }

  return error;
};