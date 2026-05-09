import { Bot, X } from "lucide-react";

const ChatHeader = ({ onClose }) => {
    return (
        <div className="chatbot-kit-header">
            <div className="chatbot-kit-header__left">
                <div className="chatbot-kit-header__icon">
                    <Bot size={16} />
                </div>
                <div>
                    <p className="chatbot-kit-header__title">Pet AI Assistant</p>
                    <div className="chatbot-kit-header__status">
                        <span className="chatbot-kit-header__dot" />
                        <span>Dang san sang ho tro</span>
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="chatbot-kit-header__close"
                aria-label="Dong hop thoai chat"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default ChatHeader;
