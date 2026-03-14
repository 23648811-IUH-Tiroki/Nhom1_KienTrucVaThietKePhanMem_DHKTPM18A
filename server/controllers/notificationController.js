import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getNotifications = async (req, res) => {
    try {
        const { user_id, limit = 10, isRead } = req.query;
        let query = {};
        
        if (user_id) {
            query.user_id = user_id;
        }
        
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        
        const notifications = await Notification.find(query)
            .sort({ created_at: -1 })
            .limit(parseInt(limit));
            
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNotification = async (req, res) => {
    try {
        const { message, type, user_id } = req.body;
        const notification = new Notification({
            message,
            type,
            user_id
        });
        
        const savedNotification = await notification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        
        res.status(200).json(notification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const generateSystemNotifications = async (req, res) => {
    try {
        const lowStockThreshold = 10;
        const notifications = [];
        
        const lowStockProducts = await Product.find({ stock: { $lte: lowStockThreshold } });
        for (const product of lowStockProducts) {
            notifications.push({
                message: `Sản phẩm "${product.name}" sắp hết hàng (còn ${product.stock} sản phẩm)`,
                type: "stock"
            });
        }
    
        const pendingOrders = await Order.find({ status: "Chờ xử lý" })
            .sort({ order_date: -1 })
            .limit(5);
            
        for (const order of pendingOrders) {
            notifications.push({
                message: `Đơn hàng #${order._id.toString().slice(-6)} đang chờ xử lý`,
                type: "order"
            });
        }
        
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const limitedNotifications = notifications.slice(0, 5);
        
        res.status(200).json(limitedNotifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};