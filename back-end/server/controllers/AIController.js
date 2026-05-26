import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createChatAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!message) {
            return res.status(400).json({
                reply: "Message is required",
            });
        }

        if (!apiKey) {
            return res.status(503).json({
                reply: "AI hiện chưa được cấu hình (thiếu OPENROUTER_API_KEY).",
            });
        }

        // Retry logic: up to 3 attempts with 3-5s delay between tries
        const MAX_RETRIES = 3;
        const BASE_DELAY_MS = 3000; // 3 seconds

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
                },
            );
        };

        let attempt = 0;
        let response;
        while (attempt < MAX_RETRIES) {
            try {
                response = await makeRequest();
                break; // success
            } catch (err) {
                attempt += 1;
                console.warn(`AI request attempt ${attempt} failed:`, err.message || err);
                if (attempt >= MAX_RETRIES) {
                    throw err; // rethrow to outer catch
                }
                // delay between retries with small jitter
                const jitter = Math.floor(Math.random() * 2000); // up to 2s jitter
                const delayMs = BASE_DELAY_MS + jitter; // between 3s and ~5s
                await new Promise((r) => setTimeout(r, delayMs));
            }
        }

        const aiMessage = response.data.choices?.[0]?.message?.content || "AI không phản hồi.";

        return res.json({ reply: aiMessage });
    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);
        return res.status(500).json({ reply: error.response?.data?.error?.message || "AI hiện không khả dụng." });
    }
};