import mongoose from "mongoose";

const normalizeStatus = (value) => {
    if (!value) return value;
    const normalized = String(value).trim();

    switch (normalized) {
        case "waiting_payment":
        case "Chờ thanh toán":
        case "PENDING_PAYMENT":
        case "WAITING_PAYMENT":
            return "waiting_payment";
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
        case "expired":
        case "Hết hạn":
        case "Đơn hết hạn":
            return "expired";
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["waiting_payment", "pending", "confirmed", "shipping", "delivered", "cancelled", "expired"],
        set: normalizeStatus,
    },
    payment_method: {
        type: String,
        required: true,
        default: "COD",
        enum: ["COD", "MOMO", "PAYPAL"],
    },
    payment_status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "paid", "refunded", "expired"],
    },
    payment_expires_at: {
        type: Date,
        default: null,
    },
    payment_completed_at: {
        type: Date,
        default: null,
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

orderSchema.index({ status: 1, order_date: -1 });
orderSchema.index({ user_id: 1, order_date: -1 });
orderSchema.index({ payment_expires_at: 1, status: 1, payment_status: 1 });

orderSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.paymentExpiredAt = ret.payment_expires_at ?? null;
        ret.paymentCompletedAt = ret.payment_completed_at ?? null;
        return ret;
    },
});

orderSchema.set("toObject", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
