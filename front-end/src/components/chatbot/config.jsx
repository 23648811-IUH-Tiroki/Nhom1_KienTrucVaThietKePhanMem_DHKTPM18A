import { createChatBotMessage } from "react-chatbot-kit";
import ChatHeader from "./ChatHeader";
import BotAvatar from "./BotAvatar";
import UserAvatar from "./UserAvatar";

const buildConfig = ({ onClose }) => ({
    botName: "Pet AI Assistant",
    initialMessages: [
        createChatBotMessage(
            "Chao ban. Minh la tro ly tu van cua shop. Ban can ho tro gi cho cho hoac meo a?"
        ),
    ],
    customComponents: {
        header: () => <ChatHeader onClose={onClose} />,
        botAvatar: () => <BotAvatar />,
        userAvatar: () => <UserAvatar />,
    },
    customStyles: {
        botMessageBox: {
            backgroundColor: "#ffffff",
        },
        chatButton: {
            backgroundColor: "#f97316",
        },
    },
});

export default buildConfig;
