import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { createReview, updateReview } from "../../stores/reviewSlice";

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ReviewForm = ({ product, orderId, existingReview = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitting } = useSelector((state) => state.reviews);
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [images, setImages] = useState(existingReview?.images || []);
  const [error, setError] = useState("");

  useEffect(() => {
    setRating(existingReview?.rating || 5);
    setComment(existingReview?.comment || "");
    setImages(existingReview?.images || []);
  }, [existingReview]);

  const stars = useMemo(() => Array.from({ length: 5 }, (_, index) => index + 1), []);

  const handleImagesChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    if (images.length + selectedFiles.length > 5) {
      setError("Bạn chỉ có thể upload tối đa 5 ảnh.");
      return;
    }

    const converted = await Promise.all(selectedFiles.map((file) => toDataUrl(file)));
    setImages((prev) => [...prev, ...converted]);
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!product?._id) {
      setError("Không tìm thấy sản phẩm để đánh giá.");
      return;
    }

    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      const payload = {
        productId: product._id,
        orderId,
        rating,
        comment: comment.trim(),
        images,
      };

      if (existingReview?._id) {
        await dispatch(updateReview({ reviewId: existingReview._id, payload })).unwrap();
        toast.success("Đã cập nhật đánh giá.");
      } else {
        await dispatch(createReview(payload)).unwrap();
        toast.success("Đã gửi đánh giá thành công.");
      }

      onSuccess?.();
    } catch (reviewError) {
      const message = reviewError?.message || "Không thể gửi đánh giá.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{product?.name || "Đánh giá sản phẩm"}</h2>
        <p className="text-sm text-slate-500">Chia sẻ cảm nhận của bạn sau khi nhận hàng.</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Chọn số sao</p>
        <div className="flex items-center gap-1">
          {stars.map((star) => {
            const active = star <= rating;
            const Icon = active ? FaStar : FaRegStar;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition hover:scale-110"
              >
                <Icon className={`${active ? "text-amber-500" : "text-slate-300"} text-2xl`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comment" className="text-sm font-medium text-slate-700">
          Bình luận
        </label>
        <textarea
          id="review-comment"
          rows="5"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Viết đánh giá của bạn..."
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="review-images" className="text-sm font-medium text-slate-700">
          Ảnh review
        </label>
        <label
          htmlFor="review-images"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500 transition hover:border-amber-400 hover:bg-amber-50"
        >
          <FiImage className="text-lg" />
          Upload nhiều ảnh review
        </label>
        <input id="review-images" type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${index}-${image.slice(0, 16)}`} className="relative">
                <img src={image} alt={`Ảnh review ${index + 1}`} className="h-20 w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Đang gửi..." : existingReview?._id ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Hủy
          </button>
        )}
        {!localStorage.getItem("accessToken") && (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full border border-amber-200 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;