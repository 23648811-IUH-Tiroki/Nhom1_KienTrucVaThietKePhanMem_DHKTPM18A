import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const aiHttp = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    withCredentials: true,
});

const supportContact = {
    phone: "0915 020 903",
    email: "info@petstationshop.com",
};

class ActionProvider {
    constructor(createChatBotMessage, setStateFunc) {
        this.createChatBotMessage = createChatBotMessage;
        this.setState = setStateFunc;
        this.isSending = false;
        this.lastRateLimitAt = 0;
    }

    addBotMessage(text) {
        const message = this.createChatBotMessage(text);
        this.setState((prev) => ({
            ...prev,
            messages: [...prev.messages, message],
        }));
    }

    async handleUserMessage(message) {
        const text = String(message || "").trim();
        if (!text) return;

        const now = Date.now();
        if (this.isSending) return;
        if (now - this.lastRateLimitAt < 1500) return;

        this.isSending = true;

        try {
            const res = await aiHttp.post("/api/ai/chat", {
                provider: "openai",
                message: text,
                context: {},
                candidates: [],
                supportContact,
            });

            const replyText = res?.data?.text;
            if (typeof replyText === "string" && replyText.trim()) {
                this.addBotMessage(replyText.trim());
                return;
            }
        } catch (error) {
            const status = error?.response?.status;
            if (status === 429) {
                this.lastRateLimitAt = Date.now();
                this.addBotMessage(
                    "Ban gui qua nhanh. Vui long cho vai giay roi thu lai nhe."
                );
                return;
            }
        } finally {
            this.isSending = false;
        }

        this.addBotMessage(
            "He thong dang ban. Ban vui long thu lai sau it phut hoac lien he hotline 0915 020 903."
        );
    }
}

export default ActionProvider;
