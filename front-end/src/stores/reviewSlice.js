import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  canReviewProduct as canReviewProductRequest,
  checkOrderReview as checkOrderReviewRequest,
  createReview as createReviewRequest,
  deleteReview as deleteReviewRequest,
  fetchMyReviews as fetchMyReviewsRequest,
  fetchPurchasedProducts as fetchPurchasedProductsRequest,
  fetchReviewsByProductId as fetchReviewsByProductIdRequest,
  hideReview as hideReviewRequest,
  updateReview as updateReviewRequest,
} from "../services/reviewService";

const emptySummary = {
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
};

const normalizeSummary = (summary = {}) => ({
  averageRating: Number(summary.averageRating || 0),
  totalReviews: Number(summary.totalReviews || 0),
  ratingBreakdown: {
    5: Number(summary.ratingBreakdown?.[5] || 0),
    4: Number(summary.ratingBreakdown?.[4] || 0),
    3: Number(summary.ratingBreakdown?.[3] || 0),
    2: Number(summary.ratingBreakdown?.[2] || 0),
    1: Number(summary.ratingBreakdown?.[1] || 0),
  },
});

const upsertReview = (reviews, review) => {
  const reviewId = review?._id || review?.id;
  if (!reviewId) {
    return reviews;
  }

  const nextReviews = reviews.filter((item) => (item?._id || item?.id) !== reviewId);
  return [review, ...nextReviews];
};

const removeReviewById = (reviews, reviewId) =>
  reviews.filter((review) => (review?._id || review?.id) !== reviewId);

const mergePurchasedWithReviews = (items, reviews) => {
  const reviewMap = new Map(
    reviews.map((review) => [String(review.product?._id || review.product), review]),
  );

  return items.map((item) => {
    const productId = String(item.product?._id || item.product);
    const review = reviewMap.get(productId) || null;

    return {
      ...item,
      reviewed: Boolean(review),
      review,
      canReview: Boolean(item.canReview) && !review,
    };
  });
};

export const fetchMyReviews = createAsyncThunk(
  "reviews/fetchMyReviews",
  async () => {
    const response = await fetchMyReviewsRequest();
    return response.data;
  },
);

export const fetchPurchasedProducts = createAsyncThunk(
  "reviews/fetchPurchasedProducts",
  async () => {
    const response = await fetchPurchasedProductsRequest();
    return response.data;
  },
);

export const canReviewProduct = createAsyncThunk(
  "reviews/canReviewProduct",
  async (productId) => {
    const response = await canReviewProductRequest(productId);
    return response.data;
  },
);

export const checkOrderReview = createAsyncThunk(
  "reviews/checkOrderReview",
  async (payload) => {
    const response = await checkOrderReviewRequest(payload);
    return response.data;
  },
);

export const fetchReviewsByProductId = createAsyncThunk(
  "reviews/fetchByProductId",
  async (productId) => {
    const response = await fetchReviewsByProductIdRequest(productId);
    return response.data;
  },
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (payload) => {
    const response = await createReviewRequest(payload);
    return response.data;
  },
);

export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ reviewId, payload }) => {
    const response = await updateReviewRequest(reviewId, payload);
    return response.data;
  },
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId) => {
    const response = await deleteReviewRequest(reviewId);
    return response.data;
  },
);

export const hideReview = createAsyncThunk(
  "reviews/hideReview",
  async (reviewId) => {
    const response = await hideReviewRequest(reviewId);
    return response.data;
  },
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    productId: null,
    reviews: [],
    myReviews: [],
    purchasedProducts: [],
    canReview: {
      canReview: false,
      purchased: false,
      reviewed: false,
      orderId: null,
      review: null,
      message: null,
    },
    summary: emptySummary,
    loadReviews: false,
    loadPurchasedProducts: false,
    loadMyReviews: false,
    checkingCanReview: false,
    submitting: false,
    deleting: false,
    error: null,
  },
  reducers: {
    resetReviewError: (state) => {
      state.error = null;
    },
    seedReviewsFromProduct: (state, action) => {
      const product = action.payload || null;
      const reviews = product?.reviews || [];
      const summary = product?.reviewSummary || emptySummary;
      state.productId = product?._id || null;
      state.reviews = reviews;
      state.summary = normalizeSummary(summary);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReviews.pending, (state) => {
        state.loadMyReviews = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.myReviews = Array.isArray(action.payload) ? action.payload : [];
        state.loadMyReviews = false;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loadMyReviews = false;
        state.error = action.error.message || "Không thể tải review của tôi.";
      })
      .addCase(fetchPurchasedProducts.pending, (state) => {
        state.loadPurchasedProducts = true;
        state.error = null;
      })
      .addCase(fetchPurchasedProducts.fulfilled, (state, action) => {
        state.purchasedProducts = Array.isArray(action.payload) ? action.payload : [];
        state.loadPurchasedProducts = false;
      })
      .addCase(fetchPurchasedProducts.rejected, (state, action) => {
        state.loadPurchasedProducts = false;
        state.error = action.error.message || "Không thể tải sản phẩm đã mua.";
      })
      .addCase(canReviewProduct.pending, (state) => {
        state.checkingCanReview = true;
        state.error = null;
      })
      .addCase(canReviewProduct.fulfilled, (state, action) => {
        state.canReview = action.payload || state.canReview;
        state.checkingCanReview = false;
      })
      .addCase(canReviewProduct.rejected, (state, action) => {
        state.checkingCanReview = false;
        state.error = action.error.message || "Không thể kiểm tra điều kiện đánh giá.";
      })
      .addCase(checkOrderReview.fulfilled, (state, action) => {
        state.canReview = action.payload || state.canReview;
      })
      .addCase(fetchReviewsByProductId.pending, (state) => {
        state.loadReviews = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProductId.fulfilled, (state, action) => {
        state.productId = action.meta.arg || state.productId;
        state.reviews = action.payload?.reviews || [];
        state.summary = normalizeSummary(action.payload);
        state.loadReviews = false;
      })
      .addCase(fetchReviewsByProductId.rejected, (state, action) => {
        state.loadReviews = false;
        state.error = action.error.message || "Không thể tải đánh giá.";
      })
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        if (action.payload?.review) {
          state.reviews = upsertReview(state.reviews, action.payload.review);
          state.myReviews = upsertReview(state.myReviews, action.payload.review);
          state.purchasedProducts = mergePurchasedWithReviews(
            state.purchasedProducts,
            state.myReviews,
          );
        }
        state.summary = normalizeSummary(action.payload?.summary);
        state.canReview = {
          ...state.canReview,
          canReview: false,
          reviewed: true,
          review: action.payload?.review || state.canReview.review,
        };
        state.submitting = false;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Không thể gửi đánh giá.";
      })
      .addCase(updateReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        if (action.payload?.review) {
          state.reviews = upsertReview(state.reviews, action.payload.review);
          state.myReviews = upsertReview(state.myReviews, action.payload.review);
          state.purchasedProducts = mergePurchasedWithReviews(
            state.purchasedProducts,
            state.myReviews,
          );
        }
        state.summary = normalizeSummary(action.payload?.summary);
        state.canReview = {
          ...state.canReview,
          reviewed: true,
          review: action.payload?.review || state.canReview.review,
        };
        state.submitting = false;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Không thể cập nhật đánh giá.";
      })
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        if (action.payload?.reviewId) {
          state.reviews = removeReviewById(state.reviews, action.payload.reviewId);
          state.myReviews = removeReviewById(state.myReviews, action.payload.reviewId);
          state.purchasedProducts = state.purchasedProducts.map((item) => {
            if ((item.review?._id || item.review?.id) === action.payload.reviewId) {
              return { ...item, reviewed: false, review: null, canReview: true };
            }
            return item;
          });
        }
        state.summary = normalizeSummary(action.payload?.summary);
        state.deleting = false;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || "Không thể xóa đánh giá.";
      })
      .addCase(hideReview.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(hideReview.fulfilled, (state, action) => {
        if (action.payload?.reviewId) {
          state.reviews = removeReviewById(state.reviews, action.payload.reviewId);
          state.myReviews = removeReviewById(state.myReviews, action.payload.reviewId);
        }
        state.summary = normalizeSummary(action.payload?.summary);
        state.deleting = false;
      })
      .addCase(hideReview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || "Không thể ẩn đánh giá.";
      });
  },
});

export const { resetReviewError, seedReviewsFromProduct } = reviewSlice.actions;
export default reviewSlice.reducer;
