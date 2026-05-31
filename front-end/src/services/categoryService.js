import axiosInstance from "../utils/axiosInstance";

export const fetchCategories = (params = {}) =>
  axiosInstance.get("/api/categories", { params });

export const fetchCategoryById = (id) =>
  axiosInstance.get(`/api/categories/${id}`);

export const createCategory = (categoryData) =>
  axiosInstance.post("/api/categories", categoryData);

export const updateCategory = (id, categoryData) =>
  axiosInstance.put(`/api/categories/${id}`, categoryData);

export const deleteCategory = (id) =>
  axiosInstance.delete(`/api/categories/${id}`);

export const fetchCategoryBySlug = (slug) =>
  axiosInstance.get(`/api/categories/catetory/${slug}`);

export const fetchProductsByCategory = (slugType) =>
  axiosInstance.get(`/api/categories/${slugType}`);

export const fetchProductsByCategoryName = (slug, currentPage, limit = 8) =>
  axiosInstance.get(`/api/categories/name/${slug}?page=${currentPage}&limit=${limit}`);