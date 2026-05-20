import axiosInstance from "../utils/axiosInstance";

export const fetchProfile = () => axiosInstance.get("/api/users/profile");

export const fetchUserById = (userId) => axiosInstance.get(`/api/users/${userId}`);

export const fetchUsersPaginated = (params) =>
  axiosInstance.get("/api/users/paginated", { params });

export const searchUsers = (params) => axiosInstance.get("/api/users/search", { params });

export const createUser = (formData) => axiosInstance.post("/api/users", formData);

export const updateUser = (userId, formData) =>
  axiosInstance.put(`/api/users/${userId}`, formData);

export const deleteUser = (userId) => axiosInstance.delete(`/api/users/${userId}`);