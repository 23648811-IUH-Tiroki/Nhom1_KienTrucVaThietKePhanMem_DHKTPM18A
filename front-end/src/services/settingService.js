import axiosInstance from "../utils/axiosInstance";

export const fetchSettings = () => axiosInstance.get("/api/settings");

export const updateSettings = (settings) =>
  axiosInstance.put("/api/settings", settings);