import mongoose from "mongoose";

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
        default: "Đang giao hàng",
        enum: ["Chờ xử lý", "Đang xử lý", "Đang giao hàng", "Đã giao hàng", "Hoàn tất", "Đã hủy"],
    },
    order_date: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    
}, {collection: "orders"});

const Order = mongoose.model("Order", orderSchema);
export default Order;