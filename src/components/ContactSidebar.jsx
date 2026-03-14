import { FaPhoneAlt } from "react-icons/fa";
import { FaFacebookMessenger } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

const ContactSidebar = () => {
  return (
    <div className="fixed right-4 bottom-50 flex flex-col gap-3 z-50">
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
    </div>
  );
};

export default ContactSidebar;
