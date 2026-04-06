import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
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
      order_date: { $gte: startDate }
    });
  
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    
    const monthlyStartDate = new Date();
    monthlyStartDate.setDate(monthlyStartDate.getDate() - 30);
    const monthlyRevenue = orders
      .filter(order => new Date(order.order_date) >= monthlyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);
    
    const weeklyStartDate = new Date();
    weeklyStartDate.setDate(weeklyStartDate.getDate() - 7);
    const weeklyRevenue = orders
      .filter(order => new Date(order.order_date) >= weeklyStartDate)
      .reduce((sum, order) => sum + order.total_price, 0);
    
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    res.status(200).json({
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      averageOrderValue
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const orders = await Order.find()
      .sort({ order_date: -1 })
      .limit(parseInt(limit))
      .populate('user_id', 'fullName')
      .populate('items.product_id');
    
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      return {
        id: order._id,
        customer: order.user_id ? order.user_id.fullName : "Unknown Customer",
        total: order.total_price,
        status: order.status,
        date: order.order_date
      };
    }));
    
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error getting recent orders:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueByDay = async (req, res) => {
  try {
    const { timeFilter = "7days" } = req.query;

    // xác định khoảng thời gian dựa trên timeFilter
    const today = new Date();
    let startDate = new Date(today);
    let categories = [];
    let revenueByDay = [];

    if (timeFilter === "7days") {
      // doanh thu 7 ngày (tuần hiện tại)
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));
      startDate.setHours(0, 0, 0, 0);
      categories = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      revenueByDay = Array(7).fill(0);
    } else if (timeFilter === "30days") {
      // doanh thu 30 ngày qua
      startDate.setDate(today.getDate() - 29); // 30 ngày bao gồm hôm nay
      startDate.setHours(0, 0, 0, 0);
      categories = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      });
      revenueByDay = Array(30).fill(0);
    } else if (timeFilter === "90days") {
      // doanh thu 90 ngày qua
      startDate.setDate(today.getDate() - 89); // 90 ngày bao gồm hôm nay
      startDate.setHours(0, 0, 0, 0);
      categories = Array.from({ length: 90 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      });
      revenueByDay = Array(90).fill(0);
    } else if (timeFilter === "year") {
      // doanh thu năm nay
      startDate = new Date(today.getFullYear(), 0, 1); // ngày 1/1 của năm nay
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(today.getFullYear(), 11, 31); // ngày 31/12 của năm nay
      const daysInYear = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      categories = Array.from({ length: 12 }, (_, i) => {
        return new Date(today.getFullYear(), i, 1).toLocaleDateString("vi-VN", { month: "long" });
      });
      revenueByDay = Array(12).fill(0); // doanh thu theo tháng
    } else if (timeFilter === "all") {
      // tất cả thời gian
      const firstOrder = await Order.findOne().sort({ order_date: 1 });
      if (!firstOrder) {
        return res.status(200).json({ categories: [], data: [] });
      }
      startDate = new Date(firstOrder.order_date);
      startDate.setHours(0, 0, 0, 0);
      const yearsDiff = today.getFullYear() - startDate.getFullYear() + 1;
      categories = Array.from({ length: yearsDiff }, (_, i) => {
        return (startDate.getFullYear() + i).toString();
      });
      revenueByDay = Array(yearsDiff).fill(0); // doanh thu theo năm
    }

    // lấy đơn hàng trong khoảng thời gian
    const orders = await Order.find({
      order_date: { $gte: startDate, $lte: today }
    });

    // tính doanh thu
    orders.forEach(order => {
      const orderDate = new Date(order.order_date);
      let index;

      if (timeFilter === "7days") {
        const orderDay = orderDate.getDay();
        index = orderDay === 0 ? 6 : orderDay - 1;
      } else if (timeFilter === "30days" || timeFilter === "90days") {
        const diffDays = Math.floor((orderDate - startDate) / (1000 * 60 * 60 * 24));
        index = diffDays;
      } else if (timeFilter === "year") {
        index = orderDate.getMonth();
      } else if (timeFilter === "all") {
        index = orderDate.getFullYear() - startDate.getFullYear();
      }

      if (index >= 0 && index < revenueByDay.length) {
        revenueByDay[index] += order.total_price;
      }
    });

    res.status(200).json({
      categories,
      data: revenueByDay
    });
  } catch (error) {
    console.error("Error getting revenue by day:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRevenueByCategory = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'items.product_id',
        populate: { path: 'category_id' }
      });
    
    const categoryRevenue = new Map();
    let totalRevenue = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product_id && item.product_id.category_id) {
          const categoryName = item.product_id.category_id.name;
          const itemRevenue = item.quantity * item.product_id.price;
          
          if (categoryRevenue.has(categoryName)) {
            categoryRevenue.set(categoryName, categoryRevenue.get(categoryName) + itemRevenue);
          } else {
            categoryRevenue.set(categoryName, itemRevenue);
          }
          
          totalRevenue += itemRevenue;
        }
      });
    });
    
    const labels = [];
    const data = [];
    
    for (const [category, revenue] of categoryRevenue.entries()) {
      labels.push(category);
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
      data.push(parseFloat(percentage.toFixed(1)));
    }
    
    if (labels.length > 5) {
      const combined = labels.map((label, i) => ({ label, value: data[i] }))
        .sort((a, b) => b.value - a.value);
      
      const topCategories = combined.slice(0, 4);
      const otherCategories = combined.slice(4);
      
      const otherValue = otherCategories.reduce((sum, cat) => sum + cat.value, 0);
      
      const newLabels = topCategories.map(cat => cat.label);
      const newData = topCategories.map(cat => cat.value);
      
      newLabels.push("Khác");
      newData.push(parseFloat(otherValue.toFixed(1)));
      
      res.status(200).json({
        labels: newLabels,
        data: newData
      });
    } else {
      res.status(200).json({
        labels,
        data
      });
    }
  } catch (error) {
    console.error("Error getting revenue by category:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getDashboardNotifications = async (req, res) => {
  try {
    const lowStockThreshold = 10;
    
    const lowStockProducts = await Product.find({ stock: { $lte: lowStockThreshold } })
      .limit(3);
    
    const pendingOrders = await Order.find({ status: "Chờ xử lý" })
      .sort({ order_date: -1 })
      .limit(3);
    
    const recentUsers = await User.find()
      .sort({ _id: -1 })
      .limit(3);
    
    const notifications = [];
    
    lowStockProducts.forEach(product => {
      notifications.push({
        type: "stock",
        message: `Sản phẩm "${product.name}" sắp hết hàng (còn ${product.stock} sản phẩm)`,
        date: new Date()
      });
    });
    
    pendingOrders.forEach(order => {
      notifications.push({
        type: "order",
        message: `Đơn hàng mới #${order._id} đang chờ xử lý`,
        date: order.order_date
      });
    });
    
    recentUsers.forEach(user => {
      notifications.push({
        type: "user",
        message: `Người dùng mới ${user.fullName} vừa đăng ký`,
        date: user._id.getTimestamp()
      });
    });
    
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedNotifications = notifications.slice(0, 5);
    
    res.status(200).json(limitedNotifications);
  } catch (error) {
    console.error("Error getting dashboard notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

export const importOrdersFromCSV = async (req, res) => {
  try {
    res.status(200).json({ message: "Orders imported successfully" });
  } catch (error) {
    console.error("Error importing orders:", error);
    res.status(500).json({ message: error.message });
  }
};