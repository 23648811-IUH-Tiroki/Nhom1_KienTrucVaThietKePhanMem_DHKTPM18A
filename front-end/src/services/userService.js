import axiosInstance from "../utils/axiosInstance";

export const fetchProfile = () => axiosInstance.get("/api/users/profile");

export const updateProfile = (formData) =>
  axiosInstance.put("/api/users/profile", formData);

export const fetchShippingAddress = () =>
  axiosInstance.get("/api/users/shipping-address");

export const updateShippingAddress = (payload) =>
  axiosInstance.put("/api/users/shipping-address", payload);

export const fetchUserById = (userId) => axiosInstance.get(`/api/users/${userId}`);

export const fetchUsersPaginated = (params) =>
  axiosInstance.get("/api/users/paginated", { params });

export const searchUsers = (params) => axiosInstance.get("/api/users/search", { params });

export const createUser = (formData) => axiosInstance.post("/api/users", formData);

export const updateUser = (userId, formData) =>
  axiosInstance.put(`/api/users/${userId}`, formData);

export const deleteUser = (userId) => axiosInstance.delete(`/api/users/${userId}`);