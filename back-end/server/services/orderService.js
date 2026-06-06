import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { createServiceError } from "../utils/serviceError.js";
import PaymentContext from "./payment/paymentContext.js";
import CodPaymentStrategy from "./payment/codStrategy.js";
import MomoPaymentStrategy from "./payment/momoStrategy.js";
import PaypalPaymentStrategy from "./payment/paypalStrategy.js";
import { logger } from "../logger/logger.js";

const REVENUE_STATUSES = ["delivered"];
const ONLINE_PAYMENT_METHODS = ["MOMO", "PAYPAL"];
const PAYMENT_HOLD_MINUTES = Number(process.env.PAYMENT_HOLD_MINUTES || 15);
const RESTOCKABLE_STATUSES = ["waiting_payment", "pending", "confirmed", "shipping"];

const isOnlinePaymentMethod = (value) =>
  ONLINE_PAYMENT_METHODS.includes(String(value || "").toUpperCase());

const buildPaymentExpiryDate = (baseTime = Date.now()) =>
  new Date(baseTime + PAYMENT_HOLD_MINUTES * 60 * 1000);

export const normalizeStatus = (value) => {
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

const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createServiceError("Danh sách sản phẩm không hợp lệ.", 400);
  }

  for (const item of items) {
    if (!item?.product_id || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw createServiceError("Sản phẩm hoặc số lượng không hợp lệ.", 400);
    }
  }
};

const aggregateOrderItems = (items = []) => {
  const itemMap = new Map();

  for (const item of items) {
    const productId = String(item.product_id);
    const nextQuantity = Number(item.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw createServiceError(`ID sản phẩm không hợp lệ: ${productId}`, 400);
    }

    const currentQuantity = itemMap.get(productId) || 0;
    itemMap.set(productId, currentQuantity + nextQuantity);
  }

  return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
    product_id: productId,
    quantity,
  }));
};

const normalizePaymentMethod = (value) => String(value || "COD").trim().toUpperCase();

const resolveOrderOwnerId = (requestedUserId, currentUser) => {
  if (!currentUser?._id) {
    throw createServiceError("Bạn cần đăng nhập để đặt hàng.", 401);
  }

  const requesterId = currentUser._id.toString();
  if (!requestedUserId) {
    return requesterId;
  }

  const requestedId = String(requestedUserId);
  if (currentUser.role !== "admin" && requestedId !== requesterId) {
    throw createServiceError("Bạn chỉ được tạo đơn hàng cho chính mình.", 403);
  }

  return requestedId;
};

const hydrateOrderById = async (orderId, session = null) => {
  let query = Order.findById(orderId).populate("user_id").populate("items.product_id");
  if (session) {
    query = query.session(session);
  }
  return query;
};

const ensureOrderAccess = (order, currentUser) => {
  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  if (
    currentUser?.role !== "admin" &&
    order.user_id?.toString?.() !== currentUser?._id?.toString()
  ) {
    throw createServiceError("Bạn không có quyền truy cập đơn hàng này.", 403);
  }
};

const restockOrderItems = async (order, session, previousStatus = null) => {
  for (const item of order.items) {
    const stockInc = Number(item.quantity || 0);
    const soldInc = previousStatus === "delivered" ? -stockInc : 0;

    await Product.updateOne(
      { _id: item.product_id },
      { $inc: { stock: stockInc, sold: soldInc } },
      { session },
    );
  }
};

const expireOrderDocument = async (order, session) => {
  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  if (order.payment_status !== "pending" || order.status !== "waiting_payment") {
    return order;
  }

  const now = new Date();
  if (!order.payment_expires_at || order.payment_expires_at.getTime() > now.getTime()) {
    throw createServiceError("Đơn hàng chưa hết hạn thanh toán.", 400);
  }

  const updated = await Order.findOneAndUpdate(
    {
      _id: order._id,
      status: "waiting_payment",
      payment_status: "pending",
    },
    {
      status: "expired",
      payment_status: "expired",
      updatedAt: now,
    },
    { new: true, session },
  );

  if (!updated) {
    return order;
  }

  await restockOrderItems(order, session);
  return updated;
};

const getPaymentStrategy = (paymentMethod) => {
  switch (normalizePaymentMethod(paymentMethod)) {
    case "MOMO":
      return new MomoPaymentStrategy();
    case "PAYPAL":
      return new PaypalPaymentStrategy();
    default:
      return new CodPaymentStrategy();
  }
};

export const createOrder = async (orderData = {}, currentUser = null) => {
  const { items, status } = orderData;
  validateOrderItems(items);

  const normalizedItems = aggregateOrderItems(items);
  const paymentMethod = normalizePaymentMethod(
    orderData.payment_method || orderData.paymentMethod,
  );
  const userId = resolveOrderOwnerId(orderData.user_id, currentUser);
  const isOnlinePayment = isOnlinePaymentMethod(paymentMethod);
  const normalizedStatus = isOnlinePayment
    ? "waiting_payment"
    : normalizeStatus(status) || "pending";
  const createdAt = new Date();
  const paymentExpiresAt = isOnlinePayment
    ? buildPaymentExpiryDate(createdAt.getTime())
    : null;

  let savedOrder = null;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (isOnlinePayment) {
        const existingPendingOrder = await Order.findOne({
          user_id: userId,
          status: "waiting_payment",
          payment_status: "pending",
        })
          .sort({ createdAt: -1, order_date: -1 })
          .session(session);

        if (existingPendingOrder) {
          const isExpiredOrder =
            existingPendingOrder.payment_expires_at &&
            existingPendingOrder.payment_expires_at.getTime() <= createdAt.getTime();

          if (isExpiredOrder) {
            await expireOrderDocument(existingPendingOrder, session);
          } else {
            throw createServiceError(
              "Bạn đang có một đơn hàng chờ thanh toán. Vui lòng hoàn tất hoặc chờ đơn hiện tại hết hạn trước khi tạo đơn mới.",
              400,
            );
          }
        }
      }

      const productIds = normalizedItems.map((item) => item.product_id);
      const products = await Product.find({ _id: { $in: productIds } })
        .select("_id name price stock")
        .session(session);

      const productMap = new Map(
        products.map((product) => [product._id.toString(), product]),
      );

      let subtotal = 0;
      for (const item of normalizedItems) {
        const product = productMap.get(String(item.product_id));
        if (!product) {
          throw createServiceError(
            `Không tìm thấy sản phẩm với ID: ${item.product_id}`,
            404,
          );
        }

        if (Number(product.stock || 0) < Number(item.quantity)) {
          throw createServiceError(
            `Sản phẩm ${product.name} không đủ số lượng trong kho.`,
            400,
          );
        }

        subtotal += Number(product.price || 0) * Number(item.quantity || 0);
      }

      for (const item of normalizedItems) {
        const result = await Product.updateOne(
          { _id: item.product_id, stock: { $gte: Number(item.quantity) } },
          { $inc: { stock: -Number(item.quantity) } },
          { session },
        );

        if (result.modifiedCount === 0) {
          throw createServiceError(
            `Sản phẩm không đủ số lượng trong kho (ID: ${item.product_id}).`,
            400,
          );
        }
      }

      const shippingCost = Math.max(0, Number(orderData.shippingCost || 0));
      const calculatedTotal = subtotal + shippingCost;
      const paymentContext = new PaymentContext(getPaymentStrategy(paymentMethod));
      const paymentResult = isOnlinePayment
        ? { success: true, payment_status: "pending", transactionId: null }
        : await paymentContext.executePayment(calculatedTotal, {
            user_id: userId,
            items: normalizedItems,
          });

      const newOrder = new Order({
        user_id: userId,
        items: normalizedItems,
        total_price: calculatedTotal,
        createdAt,
        order_date: createdAt,
        status: normalizedStatus,
        payment_method: paymentMethod,
        payment_status: paymentResult.payment_status || "pending",
        payment_expires_at: paymentExpiresAt,
        updatedAt: createdAt,
      });

      savedOrder = await newOrder.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return hydrateOrderById(savedOrder._id);
};

export const getOrders = async (queryParams = {}, currentUser = null) => {
  const { user_id } = queryParams;
  const query = {};

  if (currentUser?.role !== "admin") {
    if (user_id && user_id !== currentUser?._id?.toString()) {
      throw createServiceError("Bạn chỉ được xem đơn hàng của chính mình", 403);
    }

    query.user_id = currentUser?._id;
  } else if (user_id) {
    query.user_id = user_id;
  }

  return Order.find(query).populate("user_id").populate("items.product_id");
};

export const getOrderById = async (orderId, currentUser = null) => {
  const order = await Order.findById(orderId)
    .populate("user_id")
    .populate("items.product_id");

  if (!order) {
    throw createServiceError("Order not found", 404);
  }

  if (currentUser?.role !== "admin" && order.user_id?._id?.toString() !== currentUser?._id?.toString()) {
    throw createServiceError("Bạn không có quyền xem đơn hàng này", 403);
  }

  return order;
};

export const getActivePaymentOrder = async (currentUser = null) => {
  if (!currentUser?._id) {
    throw createServiceError("Bạn cần đăng nhập để tiếp tục thanh toán.", 401);
  }

  const order = await Order.findOne({
    user_id: currentUser._id,
    status: "waiting_payment",
    payment_status: "pending",
  })
    .sort({ createdAt: -1, order_date: -1 })
    .populate("user_id")
    .populate("items.product_id");

  if (!order) {
    return null;
  }

  const isExpired =
    order.payment_expires_at &&
    order.payment_expires_at.getTime() <= Date.now();

  if (!isExpired) {
    return order;
  }

  await expireOrderById(order._id, currentUser);
  return null;
};

export const updateOrder = async (orderId, updateData = {}, currentUser = null) => {
  const { status } = updateData;
  const normalizedStatus = normalizeStatus(status);

  if (!normalizedStatus) {
    throw createServiceError("Trạng thái không hợp lệ.", 400);
  }

  let updatedOrder = null;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(orderId).session(session);
      if (!currentOrder) {
        throw createServiceError("Order not found", 404);
      }

      ensureOrderAccess(currentOrder, currentUser);

      const previousStatus = normalizeStatus(currentOrder.status);
      const isAdmin = currentUser?.role === "admin";
      const currentStatus = normalizeStatus(currentOrder.status);

      if (!isAdmin) {
        if (normalizedStatus !== "cancelled") {
          throw createServiceError("Bạn không có quyền cập nhật trạng thái đơn hàng.", 403);
        }

        if (currentOrder.user_id?.toString() !== currentUser?._id?.toString()) {
          throw createServiceError("Bạn chỉ được huỷ đơn hàng của chính mình.", 403);
        }

        if (!["pending", "confirmed", "waiting_payment"].includes(currentStatus)) {
          throw createServiceError("Không thể huỷ đơn hàng ở trạng thái hiện tại.", 400);
        }
      }

      if (normalizedStatus === "delivered" && previousStatus !== "delivered") {
        for (const item of currentOrder.items) {
          await Product.updateOne(
            { _id: item.product_id },
            { $inc: { sold: Number(item.quantity || 0) } },
            { session }
          );
        }
      }

      const isRestockStatus = ["cancelled", "expired"].includes(normalizedStatus);
      const wasAlreadyRestocked = ["cancelled", "expired"].includes(previousStatus);
      if (isRestockStatus && !wasAlreadyRestocked) {
        await restockOrderItems(currentOrder, session, previousStatus);
      }

      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: normalizedStatus, updatedAt: new Date() },
        { new: true, session }
      )
        .populate("user_id")
        .populate("items.product_id");

      if (!updatedOrder) {
        throw createServiceError("Order not found", 404);
      }
    });
  } finally {
    session.endSession();
  }

  return updatedOrder;
};

export const confirmOrderPayment = async (orderId, currentUser = null) => {
  let updatedOrder = null;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      ensureOrderAccess(order, currentUser);

      if (!isOnlinePaymentMethod(order.payment_method)) {
        throw createServiceError("Đơn hàng này không yêu cầu thanh toán trực tuyến.", 400);
      }

      if (order.payment_status === "paid") {
        updatedOrder = order;
        return;
      }

      if (order.status === "expired") {
        throw createServiceError("Đơn hàng đã hết hạn thanh toán.", 400);
      }

      if (order.payment_expires_at && order.payment_expires_at.getTime() <= Date.now()) {
        await expireOrderDocument(order, session);
        throw createServiceError("Phiên thanh toán đã hết hạn.", 400, {
          message:
            "Phiên thanh toán đã hết hạn. Sản phẩm đã được trả lại kho. Vui lòng đặt hàng lại nếu muốn tiếp tục mua.",
          code: "PAYMENT_EXPIRED",
        });
      }

      const paymentContext = new PaymentContext(
        getPaymentStrategy(order.payment_method),
      );
      const paymentResult = await paymentContext.executePayment(order.total_price, {
        user_id: order.user_id,
        items: order.items,
      });

      if (!paymentResult?.success || paymentResult.payment_status !== "paid") {
        throw createServiceError("Thanh toán thất bại. Vui lòng thử lại.", 400);
      }

      order.payment_status = "paid";
      order.status = "confirmed";
      order.payment_completed_at = new Date();
      order.payment_expires_at = null;
      order.updatedAt = new Date();

      updatedOrder = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return hydrateOrderById(updatedOrder._id);
};

export const expireOrderById = async (orderId, currentUser = null) => {
  let expiredOrder = null;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      ensureOrderAccess(order, currentUser);

      if (
        currentUser?.role !== "admin" &&
        order.user_id?.toString() !== currentUser?._id?.toString()
      ) {
        throw createServiceError("Bạn không có quyền cập nhật đơn hàng này.", 403);
      }

      expiredOrder = await expireOrderDocument(order, session);
    });
  } finally {
    await session.endSession();
  }

  return hydrateOrderById(expiredOrder._id);
};

export const expireStaleOrders = async () => {
  const now = new Date();
  const candidates = await Order.find({
    status: "waiting_payment",
    payment_status: "pending",
    payment_expires_at: { $lte: now },
  }).select("_id");

  if (!candidates.length) {
    return { expiredCount: 0 };
  }

  let expiredCount = 0;
  for (const order of candidates) {
    try {
      const expiredOrder = await expireOrderById(order._id, {
        _id: order._id,
        role: "admin",
      });
      if (normalizeStatus(expiredOrder?.status) === "expired") {
        expiredCount += 1;
      }
    } catch (error) {
      logger.warn("Failed to expire order", {
        orderId: order._id?.toString?.(),
        message: error.message,
      });
    }
  }

  return { expiredCount };
};

export const deleteOrder = async (orderId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw createServiceError("Order not found", 404);
      }

      const currentStatus = normalizeStatus(order.status);
      if (RESTOCKABLE_STATUSES.includes(currentStatus)) {
        await restockOrderItems(order, session, currentStatus === "delivered" ? "delivered" : null);
      }

      await Order.deleteOne({ _id: orderId }, { session });
    });
  } finally {
    await session.endSession();
  }

  return { message: "Order deleted successfully" };
};

export const getOrderStats = async (timeFilter = "7days") => {
  let startDate = new Date();

  switch (timeFilter) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "year":
      startDate = new Date(startDate.getFullYear(), 0, 1);
      break;
    case "all":
      startDate = new Date(2000, 0, 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  const orders = await Order.find({
    order_date: { $gte: startDate },
    status: { $in: REVENUE_STATUSES },
  }).select("total_price");

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);

  const monthlyStartDate = new Date();
  monthlyStartDate.setDate(monthlyStartDate.getDate() - 30);
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        order_date: { $gte: monthlyStartDate },
        status: { $in: REVENUE_STATUSES },
      },
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$total_price", 0] } } } },
  ]).then((rows) => Number(rows?.[0]?.total || 0));

  const weeklyStartDate = new Date();
  weeklyStartDate.setDate(weeklyStartDate.getDate() - 7);
  const weeklyRevenue = await Order.aggregate([
    {
      $match: {
        order_date: { $gte: weeklyStartDate },
        status: { $in: REVENUE_STATUSES },
      },
    },
    { $group: { _id: null, total: { $sum: { $ifNull: ["$total_price", 0] } } } },
  ]).then((rows) => Number(rows?.[0]?.total || 0));

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    averageOrderValue,
  };
};

export const getRecentOrders = async (limit = 5) => {
  const orders = await Order.find()
    .sort({ order_date: -1 })
    .limit(Number.parseInt(limit, 10))
    .populate("user_id", "fullName");

  return orders.map((order) => ({
    id: order._id,
    customer: order.user_id ? order.user_id.fullName : "Unknown Customer",
    total: order.total_price,
    status: order.status,
    date: order.order_date,
  }));
};

export default {
  normalizeStatus,
  createOrder,
  getOrders,
  getOrderById,
  getActivePaymentOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  getRecentOrders,
  confirmOrderPayment,
  expireOrderById,
  expireStaleOrders,
};
