import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaRegStar, FaStar, FaTrashAlt } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import {
  createReview,
  deleteReview,
  fetchReviewsByProductId,
} from "../stores/reviewSlice";

const DEFAULT_AVATAR = "/avatar.png";

const convertBase64ToImage = (value) => {
  if (!value) return DEFAULT_AVATAR;
  if (typeof value !== "string") return DEFAULT_AVATAR;
  if (value.startsWith("data:image")) return value;
  if (value.startsWith("/") || value.startsWith("http")) return value;
  return `data:image/jpeg;base64,${value}`;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatTimeAgo = (value) => {
  if (!value) return "Vừa xong";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const RatingStars = ({ rating = 0, interactive = false, onSelect }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => {
        const active = star <= Math.round(Number(rating || 0));

        const StarIcon = active ? FaStar : FaRegStar;

        if (!interactive) {
          return (
            <StarIcon
              key={star}
              className={`${active ? "text-amber-500" : "text-slate-300"} text-lg`}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onSelect?.(star)}
            className="transition hover:scale-110"
            aria-label={`Chọn ${star} sao`}
          >
            <StarIcon
              className={`${active ? "text-amber-500" : "text-slate-300"} text-xl`}
            />
          </button>
        );
      })}
    </div>
  );
};

const ProductReviewSection = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reviews, summary, loadReviews, submitting, deleting, error } = useSelector(
    (state) => state.reviews,
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [formError, setFormError] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const currentUserId = currentUser?._id || currentUser?.id;
  const isAdmin = currentUser?.role === "admin";
  const displayReviews = reviews.length ? reviews : product?.reviews || [];
  const displaySummary = summary.totalReviews ? summary : product?.reviewSummary || summary;

  useEffect(() => {
    if (product?._id) {
      dispatch(fetchReviewsByProductId(product._id));
    }
  }, [dispatch, product?._id]);

  const handleImageChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) {
      return;
    }

    setFormError("");

    if (images.length + selectedFiles.length > 5) {
      setFormError("Bạn chỉ có thể upload tối đa 5 ảnh cho mỗi đánh giá.");
      return;
    }

    const convertedImages = await Promise.all(
      selectedFiles.map((file) => fileToDataUrl(file)),
    );

    setImages((prev) => [...prev, ...convertedImages]);
    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (!product?._id) {
      setFormError("Không tìm thấy sản phẩm để đánh giá.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setFormError("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    if (!comment.trim()) {
      setFormError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      await dispatch(
        createReview({
          productId: product._id,
          rating,
          comment: comment.trim(),
          images,
        }),
      ).unwrap();

      setRating(5);
      setComment("");
      setImages([]);
    } catch (reviewError) {
      setFormError(reviewError?.message || "Không thể gửi đánh giá.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;

    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
      return;
    }

    try {
      await dispatch(deleteReview(reviewId)).unwrap();
    } catch (reviewError) {
      setFormError(reviewError?.message || "Không thể xóa đánh giá.");
    }
  };

  const ratingBreakdown = displaySummary.ratingBreakdown || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const maxRatingCount = Math.max(...Object.values(ratingBreakdown), 1);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-600">
                Đánh giá sản phẩm
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-900">
                Cảm nhận từ khách hàng
              </h3>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {Number(displaySummary.averageRating || 0).toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <RatingStars rating={displaySummary.averageRating || 0} />
                    <span className="text-xs text-slate-500">
                      {displaySummary.totalReviews || 0} đánh giá
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 md:p-6 lg:grid-cols-[0.95fr,1.05fr]">
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 md:p-5">
            <h4 className="text-base font-semibold text-slate-900">
              Thống kê theo từng mức sao
            </h4>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingBreakdown[star] || 0;
                const width = `${(count / maxRatingCount) * 100}%`;

                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <div className="flex w-16 items-center gap-1 text-slate-600">
                      <span>{star}</span>
                      <FaStar className="text-amber-400" />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tổng đánh giá</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {displaySummary.totalReviews || 0}
                  </p>
                </div>
                <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                  {displaySummary.averageRating
                    ? `${Number(displaySummary.averageRating).toFixed(1)} / 5`
                    : "Chưa có đánh giá"}
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    Viết đánh giá của bạn
                  </h4>
                  <p className="text-sm text-slate-500">
                    Chỉ khách hàng đã mua hàng mới có thể gửi đánh giá.
                  </p>
                </div>
                {!currentUserId && (
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Số sao</span>
                <RatingStars
                  rating={rating}
                  interactive
                  onSelect={(value) => setRating(value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="review-comment">
                  Bình luận
                </label>
                <textarea
                  id="review-comment"
                  rows="4"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="review-images">
                  Ảnh đánh giá
                </label>
                <label
                  htmlFor="review-images"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500 transition hover:border-amber-400 hover:bg-amber-50"
                >
                  <FiImage className="text-lg" />
                  Upload nhiều ảnh review
                </label>
                <input
                  id="review-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={`${index}-${image.slice(0, 12)}`} className="relative">
                        <img
                          src={image}
                          alt={`Ảnh review ${index + 1}`}
                          className="h-20 w-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black"
                          aria-label="Xóa ảnh"
                        >
                          <FaTrashAlt size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {(formError || error) && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !currentUserId}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {loadReviews && !displayReviews.length ? (
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 animate-pulse">
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="h-24 rounded-2xl bg-slate-200" />
                <div className="h-24 rounded-2xl bg-slate-200" />
              </div>
            ) : displayReviews.length ? (
              <div className="space-y-4">
                {displayReviews.map((review) => {
                  const reviewUser = review.user || {};
                  const reviewUserId = reviewUser?._id || reviewUser?.id || review.user;
                  const canDelete =
                    currentUserId && (reviewUserId?.toString?.() === currentUserId?.toString?.() || isAdmin);

                  return (
                    <article
                      key={review._id || review.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={convertBase64ToImage(reviewUser?.avatar)}
                            alt={reviewUser?.fullName || "User"}
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="font-semibold text-slate-900">
                                {reviewUser?.fullName || "Khách hàng"}
                              </h5>
                              {reviewUser?.role === "admin" && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {formatTimeAgo(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review._id || review.id)}
                            disabled={deleting}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Xóa
                          </button>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <RatingStars rating={review.rating} />
                        <span className="text-sm font-medium text-slate-700">
                          {review.rating}/5
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                        {review.comment}
                      </p>

                      {Array.isArray(review.images) && review.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                          {review.images.map((image, index) => (
                            <img
                              key={`${review._id || review.id}-${index}`}
                              src={image}
                              alt={`Review ${index + 1}`}
                              className="h-20 w-full rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductReviewSection;