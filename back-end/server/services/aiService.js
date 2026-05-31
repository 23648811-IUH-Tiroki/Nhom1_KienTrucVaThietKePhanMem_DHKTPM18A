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

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 3000;

  const makeRequest = async () => {
    return axios.post(
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
      }
    );
  };

  let attempt = 0;
  let response;

  while (attempt < MAX_RETRIES) {
    try {
      response = await makeRequest();
      break;
    } catch (error) {
      attempt += 1;
      logger.warn(`AI request attempt ${attempt} failed`, { message: error.message || error });

      if (attempt >= MAX_RETRIES) {
        const reply = error.response?.data?.error?.message || "AI hiện không khả dụng.";
        throw createServiceError(reply, 500, { reply });
      }

      const jitter = Math.floor(Math.random() * 2000);
      const delayMs = BASE_DELAY_MS + jitter;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const aiMessage = response?.data?.choices?.[0]?.message?.content || "AI không phản hồi.";
  return { reply: aiMessage };
};

export default {
  createChatAI,
};