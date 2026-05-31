import axiosInstance from "../utils/axiosInstance";

export const fetchCart = () => axiosInstance.get("/api/carts/me");

export const addCartItem = (productId, quantity) =>
  axiosInstance.post("/api/carts/add", {
    product_id: productId,
    quantity,
  });

export const updateCartItem = (itemId, quantity) =>
  axiosInstance.put(`/api/carts/item/${itemId}`, { quantity });

export const removeCartItem = (itemId) =>
  axiosInstance.delete(`/api/carts/product/${itemId}`);

export const clearCart = () => axiosInstance.delete("/api/carts/me");