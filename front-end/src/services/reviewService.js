import axiosInstance from "../utils/axiosInstance";

export const fetchMyReviews = () => axiosInstance.get("/api/reviews/my-reviews");

export const fetchPurchasedProducts = () =>
  axiosInstance.get("/api/reviews/my-purchased-products");

export const canReviewProduct = (productId) =>
  axiosInstance.get(`/api/reviews/can-review/${productId}`);

export const checkOrderReview = (payload) =>
  axiosInstance.post("/api/reviews/check-order-review", payload);

export const fetchReviewsByProductId = (productId) =>
  axiosInstance.get(`/api/reviews/${productId}`);

export const createReview = (payload) =>
  axiosInstance.post("/api/reviews/create", payload);

export const updateReview = (reviewId, payload) =>
  axiosInstance.put(`/api/reviews/update/${reviewId}`, payload);

export const deleteReview = (reviewId) =>
  axiosInstance.delete(`/api/reviews/${reviewId}`);

export const hideReview = (reviewId) =>
  axiosInstance.patch(`/api/reviews/${reviewId}/hide`);