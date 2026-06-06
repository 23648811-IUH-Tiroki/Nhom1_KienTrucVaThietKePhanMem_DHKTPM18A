import { useEffect, useRef, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { MdSmartToy } from "react-icons/md";
import { SiZalo } from "react-icons/si";
import { getAIResponse } from "../services/AIService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
const ContactSidebar = () => {
  const [openChat, setOpenChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: "AI",
      text: "Chào mừng bạn đến với PetShop! Tôi có thể giúp được gì cho bạn?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const getAdaptiveAIDelay = () => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) {
      return 300;
    }

    const typeDelayMap = {
      "slow-2g": 1200,
      "2g": 1000,
      "3g": 700,
      "4g": 250,
    };

    const typeDelay = typeDelayMap[connection.effectiveType] || 300;
    const rttDelay = connection.rtt ? Math.round(connection.rtt * 1.25) : 0;

    return Math.min(1500, Math.max(200, Math.max(typeDelay, rttDelay)));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isLoading) return;

    const currentMessage = inputMessage;

    const userMessage = {
      role: "user",
      text: currentMessage,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInputMessage("");
    setIsLoading(true);

    try {
      const delayMs = getAdaptiveAIDelay();
      const res = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            resolve(await getAIResponse(currentMessage));
          } catch (error) {
            reject(error);
          }
        }, delayMs);
      });

      const aiResponse = {
        role: "ai",
        text: res.data.reply || res.data.aiMessage,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            error.response?.data?.reply ||
            error.response?.data?.message ||
            "Xin lỗi, hiện tại AI đang bận. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-50">
        {/* Gọi điện */}
        <a
          href="tel:+84123456789"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform transform hover:scale-110"
        >
          <FaPhoneAlt size={20} />
        </a>

        {/* Zalo */}
        <a
          href="https://zalo.me/0123456789"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition-transform transform hover:scale-110"
        >
          <SiZalo size={22} />
        </a>

        {/* Messenger */}
        <a
          href="https://m.me/example"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0084FF] text-white shadow-lg transition-transform transform hover:scale-110"
        >
          <FaFacebookMessenger size={22} />
        </a>

        {/* AI chat  */}
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform transform hover:scale-110"
          onClick={() => setOpenChat(true)}
          aria-label="Mở chatbox AI"
        >
          <MdSmartToy size={22} />
        </button>
      </div>
      {/* Chatbox AI */}
      {openChat && (
        <>
          <div
            onClick={() => setOpenChat(false)}
            className="fixed inset-0 bg-black/40 z-998"
          />

          <aside className="fixed right-18 bottom-0 z-999 w-90 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">AI hỗ trợ khách hàng</p>
                <p className="text-xs text-white/80">
                  Phản hồi nhanh ngay bên cạnh
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenChat(false)}
                className="rounded-full p-2 transition hover:bg-white/15"
                aria-label="Đóng chatbox AI"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex h-105 flex-col bg-linear-to-b from-slate-50 to-white">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] break-words rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 bg-white p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={isLoading}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default ContactSidebar;
