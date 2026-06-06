import axios from "axios";
import dotenv from "dotenv";
import { createServiceError } from "../utils/serviceError.js";
import { logger } from "../logger/logger.js";

dotenv.config();

export const createChatAI = async (message) => {
  if (!message) {
    throw createServiceError("Message is required", 400, { reply: "Message is required" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw createServiceError(
      "AI hiện chưa được cấu hình (thiếu OPENROUTER_API_KEY).",
      503,
      { reply: "AI hiện chưa được cấu hình (thiếu OPENROUTER_API_KEY)." }
    );
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          { role: "system", content: "Bạn là AI hỗ trợ khách hàng PetShop." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "PetShop AI",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const aiMessage = response?.data?.choices?.[0]?.message?.content || "AI không phản hồi.";
    return { reply: aiMessage };
  } catch (error) {
    logger.warn("AI request failed", { message: error.message || error });
    let reply = error.response?.data?.error?.message || "";

    if (!reply && error.code === "ECONNABORTED") {
      reply = "Yêu cầu tới AI đã hết thời gian chờ. Vui lòng thử lại sau.";
    }

    if (!reply && !error.response) {
      reply = "Không thể kết nối tới AI lúc này. Vui lòng thử lại sau.";
    }

    if (!reply) {
      reply = "AI hiện không khả dụng.";
    }

    throw createServiceError(reply, 500, { reply, message: reply });
  }
};

export default {
  createChatAI,
};
