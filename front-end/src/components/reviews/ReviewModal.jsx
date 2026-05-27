import Modal from "../Modal";
import ReviewForm from "./ReviewForm";

const ReviewModal = ({ isOpen, onClose, product, orderId, existingReview, onSuccess }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingReview?._id ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"} size="xl">
      <div className="px-1 py-4">
        <ReviewForm
          product={product}
          orderId={orderId}
          existingReview={existingReview}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
};

export default ReviewModal;