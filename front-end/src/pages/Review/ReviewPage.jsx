import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { fetchMyReviews, fetchPurchasedProducts, checkOrderReview } from "../../stores/reviewSlice";
import ReviewForm from "../../components/reviews/ReviewForm";

const ReviewPage = () => {
  const { productId, orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { purchasedProducts, myReviews, canReview, loadPurchasedProducts, loadMyReviews } = useSelector(
    (state) => state.reviews,
  );

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }

    dispatch(fetchPurchasedProducts());
    dispatch(fetchMyReviews());
    if (productId && orderId) {
      dispatch(checkOrderReview({ productId, orderId }));
    }
  }, [dispatch, navigate, orderId, productId]);

  const purchaseItem = useMemo(
    () => purchasedProducts.find((item) => String(item.product?._id || item.product) === String(productId) && String(item.orderId) === String(orderId)),
    [orderId, productId, purchasedProducts],
  );

  const existingReview = useMemo(
    () => myReviews.find((review) => String(review.product?._id || review.product) === String(productId)),
    [myReviews, productId],
  );

  const product = purchaseItem?.product;

  if (loadPurchasedProducts || loadMyReviews) {
    return (
      <MainLayout>
        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-8 w-48 rounded bg-slate-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm text-center text-slate-500">
            Không tìm thấy thông tin sản phẩm để đánh giá.
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
            <img
              src={product.images?.[0] || "/pet.png"}
              alt={product.name}
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Đánh giá sản phẩm</h1>
              <p className="text-sm text-slate-500">{product.name}</p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                {new Intl.NumberFormat("vi-VN").format(product.price || 0)}đ
              </p>
            </div>
          </div>

          {!canReview?.purchased && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {canReview?.message || "Bạn cần mua sản phẩm và nhận hàng thành công trước khi đánh giá"}
            </div>
          )}

          <div className="mt-6">
            <ReviewForm
              product={product}
              orderId={orderId}
              existingReview={existingReview}
              onSuccess={() => navigate("/my-reviews")}
            />
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ReviewPage;