import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const createChatAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                reply: "Message is required",
            });
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openrouter/free", //chọn AI model phù hợp với nhu cầu của bạn
                messages: [
                    {
                        role: "system",
                        content: "Bạn là AI hỗ trợ khách hàng PetShop.",
                    },
                    {
                        role: "user",
                        content: message,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "PetShop AI",
                    "Content-Type": "application/json",
                },
            }
        );

        const aiMessage = response.data.choices?.[0]?.message?.content || "AI không phản hồi.";

        return res.json({
            reply: aiMessage,
        });
    } catch (error) {
        console.error("OpenRouter Error:", error.response?.data || error.message);

        return res.status(500).json({
            reply: error.response?.data?.error?.message || "AI hiện không khả dụng.",
        });
    }
};