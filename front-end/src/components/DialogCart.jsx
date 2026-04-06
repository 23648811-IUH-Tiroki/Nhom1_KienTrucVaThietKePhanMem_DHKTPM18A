import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import cart1 from "../assets/images/cart1.png";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const DialogCart = ({ cartItems = [], idUser, onUpdateCart }) => {
  const navigate = useNavigate();
  const { removeFromCart } = useCart();

  // Xử lý xóa sản phẩm
  const removeItem = async (itemId) => {
    if (!idUser) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này.");
      return;
    }

    if (!itemId) {
      alert("Không tìm thấy sản phẩm để xóa.");
      return;
    }

    const removeResult = await removeFromCart(idUser, itemId);
    if (!removeResult.success) {
      toast.error(removeResult.message);
    }
  };

  // Tính tổng tiền (useMemo để tối ưu hiệu suất)
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (item.product_id?.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className="absolute right-0 w-80 bg-white shadow-2xl rounded-xl p-5 border border-gray-300 z-50 cart-dialog-animation">
      {cartItems.length > 0 ? (
        <>
          {/* Danh sách sản phẩm */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {cartItems.map((item, index) => (
              <div
                key={item.product_id?._id || index}
                className="flex items-center gap-4 border-b py-3 border-gray-200 hover:bg-gray-50 rounded-lg px-2"
              >
                <img
                  src={item.product_id?.images[0] || cart1}
                  alt={item.product_id?.name || "Sản phẩm"}
                  className="w-16 h-16 rounded-md object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">
                    {item.product_id?.name || "Sản phẩm không xác định"}
                  </p>
                  <p className="text-brown font-semibold">
                    {(item.product_id?.price || 0).toLocaleString()}đ
                    <span className="text-gray-500 text-xs ml-1">
                      {" "}
                      x {item.quantity}
                    </span>
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                  onClick={() => removeItem(item._id)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="mt-3 flex justify-between items-center font-bold text-gray-900">
            <span>Tổng tiền:</span>
            <span className="text-brown text-lg">
              {totalPrice.toLocaleString()}đ
            </span>
          </div>

          {/* Nút Thanh Toán */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              className="w-full bg-brown text-white py-2 rounded-md shadow-md hover:bg-opacity-80 cursor-pointer"
              onClick={() => navigate("/checkout")}
            >
              Tiến hành thanh toán
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 py-6">Giỏ hàng trống!</p>
      )}
    </div>
  );
};

export default DialogCart;
