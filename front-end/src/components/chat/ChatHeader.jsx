import { Bot, X } from "lucide-react";

const ChatHeader = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between rounded-t-2xl bg-linear-to-r from-orange-500 to-amber-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/20 p-2">
                    <Bot size={16} />
                </div>
                <div>
                    <p className="text-sm font-semibold">Pet AI Assistant</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/85">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        <span>Đang sẵn sàng hỗ trợ</span>
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-white/90 transition hover:bg-white/20"
                aria-label="Dong hop thoai chat"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default ChatHeader;
