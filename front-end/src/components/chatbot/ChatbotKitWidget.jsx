import { useState } from "react";
import { MessageCircleMore } from "lucide-react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "./chatbotKit.css";
import buildConfig from "./config.jsx";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

const ChatbotKitWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="chatbot-kit-shell fixed bottom-5 right-5 z-[160] flex flex-col items-end gap-3">
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                    aria-label="Mo chat bot"
                >
                    <MessageCircleMore size={22} />
                </button>
            )}

            {isOpen && (
                <div className="w-[calc(100vw-2.5rem)] max-w-[380px] overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl">
                    <Chatbot
                        config={buildConfig({ onClose: () => setIsOpen(false) })}
                        messageParser={MessageParser}
                        actionProvider={ActionProvider}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatbotKitWidget;
