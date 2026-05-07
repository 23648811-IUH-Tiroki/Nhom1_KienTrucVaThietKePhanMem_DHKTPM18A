import { Bot, UserRound } from "lucide-react";

const formatTime = (timestamp) => {
    try {
        return new Date(timestamp).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
};

const TypingDots = () => (
    <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-400 [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-400 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-slate-400" />
    </span>
);

const ChatMessage = ({ message }) => {
    const isUser = message.sender === "user";

    return (
        <div className={`flex w-full gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
                <div className="mt-1 rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
                    <Bot size={14} />
                </div>
            )}

            <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    isUser ? "bg-orange-500 text-white" : "bg-white text-gray-700 dark:bg-slate-900 dark:text-slate-100"
                }`}
            >
                <p className="whitespace-pre-wrap break-words leading-6">
                    {message.isTyping ? <TypingDots /> : message.text}
                </p>
                <p className={`mt-1 text-[11px] ${isUser ? "text-orange-100" : "text-gray-400 dark:text-slate-400"}`}>
                    {formatTime(message.timestamp)}
                </p>
            </div>

            {isUser && (
                <div className="mt-1 rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-sky-500/15 dark:text-sky-300">
                    <UserRound size={14} />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
