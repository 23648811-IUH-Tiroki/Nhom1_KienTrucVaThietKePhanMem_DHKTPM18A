import axiosInstance from "../utils/axiosInstance";

export const fetchProducts = () => axiosInstance.get("/api/products");

export const fetchProductBySlug = (slug) => axiosInstance.get(`/api/products/${slug}`);

export const fetchSaleProducts = () => axiosInstance.get("/api/products/product/sales");

export const createProduct = (productData) => axiosInstance.post("/api/products", productData);

export const updateProduct = (productId, productData) =>
  axiosInstance.put(`/api/products/${productId}`, productData);

export const deleteProduct = (productId) =>
  axiosInstance.delete(`/api/products/${productId}`);

export const filterProductsByPrice = (priceRanges) =>
  axiosInstance.post("/api/products/filterPrice", { priceRanges });

export const fetchProductsByCategoryId = (categoryId) =>
  axiosInstance.get("/api/products", { params: { category: categoryId } });

export const searchProducts = (query) =>
  axiosInstance.get(`/api/products/search?q=${query}`);

export const searchProductsByQuery = (query) =>
  axiosInstance.get("/api/products/search", { params: { query } });