import crypto from "crypto";
import morgan from "morgan";
import { logger } from "./logger.js";

morgan.token("request-id", (req, res) => req.requestId || res.locals.requestId || "-");

export const requestContextMiddleware = (req, res, next) => {
  const incomingRequestId = req.get("x-request-id");
  const requestId = incomingRequestId || crypto.randomUUID();

  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
};

export const httpLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length] req=:request-id",
  {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  },
);

export const notFoundHandler = (req, res) => {
  logger.warn("Route not found", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(404).json({
    message: "Route not found",
  });
};

export const errorHandler = (error, req, res, _next) => {
  logger.error("Unhandled server error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    message: error?.message,
    stack: error?.stack,
  });

  return res.status(error?.statusCode || 500).json({
    message: error?.message || "Lỗi hệ thống",
  });
};