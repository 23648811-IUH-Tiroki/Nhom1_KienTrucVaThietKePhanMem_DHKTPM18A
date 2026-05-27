import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const normalizeImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter((image) => typeof image === "string" && image.trim())
    .slice(0, 5);
};

const buildEmptySummary = () => ({
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
});

const REVIEWABLE_ORDER_STATUSES = [
  "delivered",
  "completed",
  "đã giao hàng",
  "đã giao hàng thành công",
  "hoàn tất",
];

const normalizeStatus = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

const isReviewableStatus = (value) => REVIEWABLE_ORDER_STATUSES.includes(normalizeStatus(value));

const normalizeObjectId = (value) => (mongoose.isValidObjectId(value) ? String(value) : null);

const buildReviewPopulation = () => [
  { path: "user", select: "fullName avatar role" },
  { path: "product", select: "name slug images price" },
  { path: "orderId", select: "status order_date total_price items" },
];

const populateReview = (query) => query.populate(buildReviewPopulation());

const orderHasProduct = (order, productId) => {
  const targetId = String(productId);
  return Array.isArray(order?.items) && order.items.some((item) => {
    const itemProductId = item?.product_id?._id || item?.product_id;
    return String(itemProductId) === targetId;
  });
};

const findEligibleOrderForProduct = async ({ userId, productId, orderId = null }) => {
  const purchaseQuery = {
    user_id: userId,
    status: { $in: REVIEWABLE_ORDER_STATUSES },
    "items.product_id": productId,
  };

  if (orderId) {
    const exactOrder = await Order.findById(orderId)
      .populate("user_id", "fullName avatar role")
      .populate("items.product_id", "name slug images price");

    if (!exactOrder) return null;

    if (String(exactOrder.user_id?._id || exactOrder.user_id) !== String(userId)) {
      return null;
    }

    if (!isReviewableStatus(exactOrder.status) || !orderHasProduct(exactOrder, productId)) {
      return null;
    }

    return exactOrder;
  }

  return Order.findOne(purchaseQuery)
    .sort({ order_date: -1 })
    .populate("user_id", "fullName avatar role")
    .populate("items.product_id", "name slug images price");
};

const getUserReviewMap = async (userId) => {
  const reviews = await Review.find({ user: userId })
    .populate(buildReviewPopulation())
    .sort({ createdAt: -1 });

  const reviewMap = new Map();
  reviews.forEach((review) => {
    const productId = String(review.product?._id || review.product);
    if (!reviewMap.has(productId)) {
      reviewMap.set(productId, review);
    }
  });

  return { reviews, reviewMap };
};

const buildCanReviewResponse = ({ order, review }) => {
  if (!order) {
    return {
      canReview: false,
      purchased: false,
      reviewed: Boolean(review),
      orderId: null,
      review: review || null,
      message: "Bạn cần mua sản phẩm và nhận hàng thành công trước khi đánh giá",
    };
  }

  return {
    canReview: !review,
    purchased: true,
    reviewed: Boolean(review),
    orderId: order._id,
    review: review || null,
    order,
    message: review
      ? "Sản phẩm này đã được bạn đánh giá. Bạn có thể chỉnh sửa review."
      : "Bạn có thể đánh giá sản phẩm này.",
  };
};

export const getReviewSummaryByProductId = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    return buildEmptySummary();
  }

  const summary = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isHidden: false,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (!summary.length) {
    return buildEmptySummary();
  }

  const ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  summary[0].ratingCounts.forEach((rating) => {
    const normalizedRating = Math.round(Number(rating));
    if (ratingBreakdown[normalizedRating] !== undefined) {
      ratingBreakdown[normalizedRating] += 1;
    }
  });

  return {
    averageRating: Number((summary[0].averageRating || 0).toFixed(1)),
    totalReviews: summary[0].totalReviews || 0,
    ratingBreakdown,
  };
};

const updateProductReviewStats = async (productId) => {
  try {
    if (!mongoose.isValidObjectId(productId)) return null;

    const summary = await getReviewSummaryByProductId(productId);

    await Product.findByIdAndUpdate(
      productId,
      {
        rating: summary.averageRating || 0,
        numReviews: summary.totalReviews || 0,
      },
      { new: true }
    );

    return summary;
  } catch (err) {
    console.error("updateProductReviewStats error:", err);
    return null;
  }
};

const parseUserAndProduct = (req, res, productIdParam) => {
  const userId = req.user?._id;
  const productId = normalizeObjectId(productIdParam);

  if (!userId) {
    res.status(401).json({ message: "Bạn cần đăng nhập để tiếp tục." });
    return null;
  }

  if (!productId) {
    res.status(400).json({ message: "Sản phẩm không hợp lệ." });
    return null;
  }

  return { userId, productId };
};

export const canReviewProduct = async (req, res) => {
  try {
    const parsed = parseUserAndProduct(req, res, req.params.productId);
    if (!parsed) return;

    const order = await findEligibleOrderForProduct({
      userId: parsed.userId,
      productId: parsed.productId,
    });

    const review = await Review.findOne({
      user: parsed.userId,
      product: parsed.productId,
      isHidden: false,
    }).populate(buildReviewPopulation());

    return res.json(buildCanReviewResponse({ order, review }));
  } catch (error) {
    console.error("canReviewProduct error:", error);
    return res.status(500).json({ message: error.message || "Không thể kiểm tra điều kiện đánh giá." });
  }
};

export const checkOrderReview = async (req, res) => {
  try {
    const { productId, orderId } = req.body;
    const parsedProductId = normalizeObjectId(productId);
    const parsedOrderId = normalizeObjectId(orderId);

    if (!parsedProductId || !parsedOrderId) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng hoặc sản phẩm." });
    }

    const order = await findEligibleOrderForProduct({
      userId: req.user._id,
      productId: parsedProductId,
      orderId: parsedOrderId,
    });

    if (!order) {
      return res.status(403).json({
        canReview: false,
        purchased: false,
        message: "Bạn cần mua sản phẩm và nhận hàng thành công trước khi đánh giá",
      });
    }

    const review = await Review.findOne({
      user: req.user._id,
      product: parsedProductId,
      orderId: parsedOrderId,
      isHidden: false,
    }).populate(buildReviewPopulation());

    return res.json(buildCanReviewResponse({ order, review }));
  } catch (error) {
    console.error("checkOrderReview error:", error);
    return res.status(500).json({ message: error.message || "Không thể kiểm tra đánh giá theo đơn hàng." });
  }
};

export const getMyPurchasedProducts = async (req, res) => {
  try {
    const orders = await Order.find({
      user_id: req.user._id,
      status: { $in: REVIEWABLE_ORDER_STATUSES },
    })
      .populate("user_id", "fullName avatar role")
      .populate("items.product_id", "name slug images price");

    const { reviewMap } = await getUserReviewMap(req.user._id);

    const productMap = new Map();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product_id;
        if (!product?._id) return;

        const productKey = String(product._id);
        const review = reviewMap.get(productKey) || null;

        const currentItem = productMap.get(productKey);
        const payload = {
          product,
          orderId: order._id,
          orderDate: order.order_date,
          orderStatus: order.status,
          orderStatusNormalized: normalizeStatus(order.status),
          quantity: item.quantity,
          reviewed: Boolean(review),
          review,
          canReview: isReviewableStatus(order.status) && !review,
          isVerifiedPurchase: true,
        };

        if (!currentItem || new Date(order.order_date) > new Date(currentItem.orderDate)) {
          productMap.set(productKey, payload);
        }
      });
    });

    return res.json(Array.from(productMap.values()));
  } catch (error) {
    console.error("getMyPurchasedProducts error:", error);
    return res.status(500).json({ message: error.message || "Không thể tải danh sách sản phẩm đã mua." });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const { reviews } = await getUserReviewMap(req.user._id);
    const summaryByProduct = await Promise.all(
      reviews.map(async (review) => ({
        review,
        summary: await getReviewSummaryByProductId(review.product?._id || review.product),
      })),
    );

    return res.json(summaryByProduct.map(({ review, summary }) => ({
      ...review.toObject(),
      summary,
    })));
  } catch (error) {
    console.error("getMyReviews error:", error);
    return res.status(500).json({ message: error.message || "Không thể tải review của tôi." });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, images = [] } = req.body;
    const parsedProductId = normalizeObjectId(productId);
    const parsedOrderId = normalizeObjectId(orderId);

    if (!parsedProductId) {
      return res.status(400).json({ message: "Sản phẩm không hợp lệ." });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Số sao phải từ 1 đến 5." });
    }

    const trimmedComment = String(comment || "").trim();
    if (!trimmedComment) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung đánh giá." });
    }

    const product = await Product.findById(parsedProductId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const eligibleOrder = await findEligibleOrderForProduct({
      userId: req.user._id,
      productId: parsedProductId,
      orderId: parsedOrderId,
    });

    if (!eligibleOrder) {
      return res.status(403).json({
        message: "Bạn cần mua sản phẩm và nhận hàng thành công trước khi đánh giá",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      product: parsedProductId,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "Bạn đã đánh giá sản phẩm này rồi. Vui lòng chỉnh sửa review hiện có.",
        review: existingReview,
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: parsedProductId,
      orderId: eligibleOrder._id,
      rating: numericRating,
      comment: trimmedComment,
      images: normalizeImages(images),
      isVerifiedPurchase: true,
    });

    const populatedReview = await populateReview(Review.findById(review._id));

    const summary = await getReviewSummaryByProductId(parsedProductId);
    // update product aggregated fields
    await updateProductReviewStats(parsedProductId);

    return res.status(201).json({
      message: "Đã gửi đánh giá thành công.",
      review: populatedReview,
      summary,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Bạn chỉ được đánh giá 1 lần cho mỗi sản phẩm.",
      });
    }

    console.error("Create review error:", error);
    return res.status(500).json({
      message: error.message || "Không thể tạo đánh giá.",
    });
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Sản phẩm không hợp lệ." });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const reviews = await Review.find({
      product: productId,
      isHidden: false,
    })
      .populate(buildReviewPopulation())
      .sort({ createdAt: -1 });

    const summary = await getReviewSummaryByProductId(productId);

    return res.json({
      reviews,
      ...summary,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      message: error.message || "Không thể tải đánh giá.",
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Đánh giá không hợp lệ." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại." });
    }

    const isOwner = String(review.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa đánh giá này.",
      });
    }

    await Review.deleteOne({ _id: id });

    const summary = await getReviewSummaryByProductId(review.product);
    // update product aggregated fields
    await updateProductReviewStats(review.product);

    return res.json({
      message: "Đã xóa đánh giá.",
      reviewId: id,
      summary,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      message: error.message || "Không thể xóa đánh giá.",
    });
  }
};

export const hideReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Đánh giá không hợp lệ." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại." });
    }

    review.isHidden = true;
    await review.save();

    const summary = await getReviewSummaryByProductId(review.product);
    // update product aggregated fields
    await updateProductReviewStats(review.product);

    return res.json({
      message: "Đã ẩn đánh giá.",
      reviewId: id,
      summary,
    });
  } catch (error) {
    console.error("Hide review error:", error);
    return res.status(500).json({
      message: error.message || "Không thể ẩn đánh giá.",
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, orderId, rating, comment, images = [] } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Đánh giá không hợp lệ." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại." });
    }

    const isOwner = String(review.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa review này." });
    }

    const nextProductId = normalizeObjectId(productId) || String(review.product);
    const nextOrderId = normalizeObjectId(orderId) || String(review.orderId);
    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Số sao phải từ 1 đến 5." });
    }

    const trimmedComment = String(comment || "").trim();
    if (!trimmedComment) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung đánh giá." });
    }

    const eligibleOrder = await findEligibleOrderForProduct({
      userId: review.user,
      productId: nextProductId,
      orderId: nextOrderId,
    });

    if (!eligibleOrder) {
      return res.status(403).json({ message: "Bạn cần mua sản phẩm và nhận hàng thành công trước khi đánh giá" });
    }

    review.product = nextProductId;
    review.orderId = eligibleOrder._id;
    review.rating = numericRating;
    review.comment = trimmedComment;
    review.images = normalizeImages(images);
    review.isVerifiedPurchase = true;

    await review.save();

    const populatedReview = await populateReview(Review.findById(review._id));
    const summary = await getReviewSummaryByProductId(nextProductId);
    // update product aggregated fields
    await updateProductReviewStats(nextProductId);

    return res.json({
      message: "Đã cập nhật đánh giá.",
      review: populatedReview,
      summary,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({ message: error.message || "Không thể cập nhật đánh giá." });
  }
};