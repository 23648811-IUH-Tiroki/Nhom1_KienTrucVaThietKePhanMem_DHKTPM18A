import axiosInstance from "../utils/axiosInstance";

export const createOrder = (orderData) => axiosInstance.post("/api/orders", orderData);

export const fetchOrders = () => axiosInstance.get("/api/orders");

export const fetchOrdersByUser = (userId) =>
  axiosInstance.get(`/api/orders?user_id=${userId}`);

export const fetchOrderStats = () => axiosInstance.get("/api/orders/stats");

export const fetchActivePaymentOrder = () =>
  axiosInstance.get("/api/orders/active-payment");

export const updateOrder = (orderId, payload) =>
  axiosInstance.put(`/api/orders/${orderId}`, payload);

export const deleteOrder = (orderId) => axiosInstance.delete(`/api/orders/${orderId}`);

export const confirmOrderPayment = (orderId) =>
  axiosInstance.post(`/api/orders/${orderId}/pay`);

export const expireOrder = (orderId) =>
  axiosInstance.post(`/api/orders/${orderId}/expire`);
