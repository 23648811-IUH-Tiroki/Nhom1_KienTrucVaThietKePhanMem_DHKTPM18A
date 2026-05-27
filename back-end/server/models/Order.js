import mongoose from "mongoose";

const normalizeStatus = (value) => {
    if (!value) return value;
    const normalized = String(value).trim();

    switch (normalized) {
        case "pending":
        case "Chờ xử lý":
        case "Chờ xác nhận":
            return "pending";
        case "confirmed":
        case "Đang xử lý":
        case "Đã xác nhận":
            return "confirmed";
        case "shipping":
        case "Đang giao hàng":
        case "Đang giao":
            return "shipping";
        case "delivered":
        case "Đã giao hàng":
        case "Đã giao":
        case "Hoàn tất":
            return "delivered";
        case "cancelled":
        case "Đã hủy":
            return "cancelled";
        default:
            return normalized;
    }
};

const orderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    total_price: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
        set: normalizeStatus,
    },
    order_date: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

}, { collection: "orders" });

const Order = mongoose.model("Order", orderSchema);
export default Order;