import { message } from "antd";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { current } from "@reduxjs/toolkit";

export const createOrder = async (req, res) => {
  try {
    const { user_id, items, total_price, status } = req.body;

    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({
          message: `Không tìm thấy sản phẩm với ID: ${item.product_id}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${product.name} không đủ số lượng trong kho`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      user_id,
      items,
      total_price,
      status,
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng với tùy chọn lọc theo user_id
export const getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = {};

    if (user_id) {
      query.user_id = user_id;
    }

    const orders = await Order.find(query)
      .populate("user_id")
      .populate("items.product_id");

    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy đơn hàng theo ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id")
      .populate("items.product_id");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const currentOrder = await Order.findById(orderId);

    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status === "Đã hủy" && currentOrder.status !== "Đã hủy") {
      for (const item of currentOrder.items) {
        const product = await Product.findById(item.product_id);
        if (product) {
          product.stock += item.quantity;
          product.sold -= item.quantity;
          await product.save();
        }
      }
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user_id")
      .populate("items.product_id");
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { timeFilter = "7days" } = req.query;
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
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    const monthlyStartDate = new Date();
    monthlyStartDate.setDate(monthlyStartDate.getDate() - 30);
    const monthlyRevenue = orders
      .filter((order) => new Date(order.order_date) >= monthlyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);

    const weeklyStartDate = new Date();
    weeklyStartDate.setDate(weeklyStartDate.getDate() - 7);
    const weeklyRevenue = orders
      .filter((order) => new Date(order.order_date) >= weeklyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);

    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    res.status(200).json({
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      averageOrderValue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const orders = await Order.find()
      .sort({ order_date: -1 })
      .limit(parseInt(limit))
      .populate("user_id", "fullName");

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      customer: order.user_id ? order.user_id.fullName : "Unknown Customer",
      total: order.total_price,
      status: order.status,
      date: order.order_date,
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
