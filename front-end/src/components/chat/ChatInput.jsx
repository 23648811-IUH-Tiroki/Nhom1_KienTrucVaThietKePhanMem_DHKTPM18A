import { SendHorizonal } from "lucide-react";
import { useState } from "react";

const ChatInput = ({ onSend, disabled }) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const text = value.trim();
        if (!text || disabled) return;
        onSend(text);
        setValue("");
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1.5 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:focus-within:border-orange-400/70 dark:focus-within:ring-orange-400/20">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Nhập nội dung cần hỗ trợ..."
                    className="flex-1 bg-transparent px-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-400"
                    disabled={disabled}
                />
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="rounded-lg bg-orange-500 p-2 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                    aria-label="Gui tin nhan"
                >
                    <SendHorizonal size={16} />
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
