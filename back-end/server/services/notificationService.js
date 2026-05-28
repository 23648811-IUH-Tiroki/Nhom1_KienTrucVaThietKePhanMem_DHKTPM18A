import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createServiceError } from "../utils/serviceError.js";

export const getNotifications = async (params = {}) => {
  const { user_id, limit = 10, isRead } = params;
  const query = {};

  if (user_id) {
    query.user_id = user_id;
  }

  if (isRead !== undefined) {
    query.isRead = isRead === "true" || isRead === true;
  }

  return Notification.find(query).sort({ created_at: -1 }).limit(Number.parseInt(limit, 10));
};

export const createNotification = async (data = {}) => {
  const notification = new Notification({
    message: data.message,
    type: data.type,
    user_id: data.user_id,
  });

  return notification.save();
};

export const markAsRead = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw createServiceError("Notification not found", 404);
  }

  return notification;
};

export const deleteNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndDelete(notificationId);

  if (!notification) {
    throw createServiceError("Notification not found", 404);
  }

  return { message: "Notification deleted successfully" };
};

export const generateSystemNotifications = async () => {
  const lowStockThreshold = 10;
  const notifications = [];

  const lowStockProducts = await Product.find({ stock: { $lte: lowStockThreshold } });
  lowStockProducts.forEach((product) => {
    notifications.push({
      message: `Sản phẩm "${product.name}" sắp hết hàng (còn ${product.stock} sản phẩm)`,
      type: "stock",
      sortDate: new Date(),
    });
  });

  const pendingOrders = await Order.find({ status: "pending" }).sort({ order_date: -1 }).limit(5);
  pendingOrders.forEach((order) => {
    notifications.push({
      message: `Đơn hàng #${order._id.toString().slice(-6)} đang chờ xử lý`,
      type: "order",
      sortDate: order.order_date,
    });
  });

  notifications.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  return notifications.slice(0, 5).map(({ sortDate, ...notification }) => notification);
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  generateSystemNotifications,
};