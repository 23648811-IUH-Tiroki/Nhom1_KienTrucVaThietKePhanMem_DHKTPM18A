import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["order", "user", "stock", "system"],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
}, { collection: "notifications" });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;