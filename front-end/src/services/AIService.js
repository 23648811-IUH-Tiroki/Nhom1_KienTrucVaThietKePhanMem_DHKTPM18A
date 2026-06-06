import axiosInstance from "../utils/axiosInstance";

export const getAIResponse = (message) => {
    return axiosInstance.post("/api/ai/chat", { message });
};
