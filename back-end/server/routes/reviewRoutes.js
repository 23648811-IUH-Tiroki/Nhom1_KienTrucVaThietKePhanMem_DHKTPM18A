import express from "express";
import {
  createReview,
  deleteReview,
  checkOrderReview,
  canReviewProduct,
  getMyPurchasedProducts,
  getMyReviews,
  getReviewsByProduct,
  hideReview,
  updateReview,
} from "../controllers/reviewController.js";
import { protectedRoute, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/can-review/:productId", protectedRoute, canReviewProduct);
router.get("/my-purchased-products", protectedRoute, getMyPurchasedProducts);
router.get("/my-reviews", protectedRoute, getMyReviews);
router.post("/check-order-review", protectedRoute, checkOrderReview);
router.post("/create", protectedRoute, createReview);
router.get("/:productId", getReviewsByProduct);
router.put("/update/:id", protectedRoute, updateReview);
router.delete("/:id", protectedRoute, deleteReview);
router.patch("/:id/hide", protectedRoute, requireAdmin, hideReview);

export default router;