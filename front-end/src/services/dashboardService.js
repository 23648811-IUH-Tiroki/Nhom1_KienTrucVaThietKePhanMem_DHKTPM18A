import axiosInstance from "../utils/axiosInstance";

export const fetchDashboardStats = (params) =>
  axiosInstance.get("/api/dashboard/stats", { params });

export const fetchRecentOrders = (params) =>
  axiosInstance.get("/api/dashboard/recent-orders", { params });

export const fetchNotifications = (params) =>
  axiosInstance.get("/api/dashboard/notifications", { params });

export const fetchRevenueByDay = (params) =>
  axiosInstance.get("/api/dashboard/revenue-by-day", { params });

export const fetchRevenueByCategory = (params) =>
  axiosInstance.get("/api/dashboard/revenue-by-category", { params });

export const importOrders = (formData) =>
  axiosInstance.post("/api/dashboard/import-orders", formData);