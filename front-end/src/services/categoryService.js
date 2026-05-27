import axiosInstance from "../utils/axiosInstance";

export const fetchCategories = () => axiosInstance.get("/api/categories");

export const createCategory = (categoryData) =>
  axiosInstance.post("/api/categories", categoryData);

export const fetchCategoryBySlug = (slug) =>
  axiosInstance.get(`/api/categories/catetory/${slug}`);

export const fetchProductsByCategory = (slugType) =>
  axiosInstance.get(`/api/categories/${slugType}`);

export const fetchProductsByCategoryName = (slug, currentPage, limit = 8) =>
  axiosInstance.get(`/api/categories/name/${slug}?page=${currentPage}&limit=${limit}`);