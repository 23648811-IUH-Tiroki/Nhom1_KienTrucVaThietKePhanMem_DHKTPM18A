import { useEffect, useRef, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { createEmptyAgentContext, generateAgentReply, getWelcomeMessage } from "../../services/mockAgentService";

const makeUserMessage = (text) => ({
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender: "user",
    text,
    timestamp: new Date().toISOString(),
});

const ChatWidget = ({ buttonClassName = "", panelClassName = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [agentContext, setAgentContext] = useState(() => createEmptyAgentContext());
    const listRef = useRef(null);

    useEffect(() => {
        if (!isOpen || initialized) return;
        setMessages([getWelcomeMessage()]);
        setInitialized(true);
    }, [isOpen, initialized]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSend = async (text) => {
        const userMessage = makeUserMessage(text);
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const { reply, context } = await generateAgentReply(text, agentContext);
            setTimeout(() => {
                setMessages((prev) => [...prev, reply]);
                setAgentContext(context);
                setIsTyping(false);
            }, 700);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `bot-error-${Date.now()}`,
                    sender: "bot",
                    text: "Hệ thống đang bận. Bạn vui lòng thử lại sau ít phút hoặc liên hệ hotline 0915 020 903.",
                    timestamp: new Date().toISOString(),
                },
            ]);
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[160] flex flex-col items-end gap-3">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`h-12 w-12 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${buttonClassName}`}
                aria-label={isOpen ? "Đóng chat bot" : "Mở chat bot"}
            >
                <span className="flex items-center justify-center">
                    <MessageCircleMore size={22} />
                </span>
            </button>

            {isOpen && (
                <div
                    className={`w-[calc(100vw-2.5rem)] max-w-96 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl ring-1 ring-orange-100/70 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800 ${panelClassName}`}
                >
                    <ChatHeader onClose={() => setIsOpen(false)} />

                    <div
                        ref={listRef}
                        className="flex max-h-[55vh] min-h-[280px] flex-col gap-3 overflow-y-auto bg-gray-50 p-3 dark:bg-slate-950"
                    >
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                        {isTyping && (
                            <ChatMessage
                                message={{
                                    id: "typing",
                                    sender: "bot",
                                    text: "typing",
                                    timestamp: new Date().toISOString(),
                                    isTyping: true,
                                }}
                            />
                        )}
                    </div>

                    <ChatInput onSend={handleSend} disabled={isTyping} />
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
