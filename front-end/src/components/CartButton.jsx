import React, { useState, useCallback, useEffect, useMemo } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DialogCart from "./DialogCart";
import { useCart } from "../context/CartContext";

const CartButton = ({ idUser }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { cartItems, fetchCart } = useCart();
  const navigate = useNavigate();

  // Xử lý hover
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Xử lý khi click vào giỏ hàng
  const handleNavigate = useCallback(() => {
    if (!idUser) {
      navigate("/login");
    } else {
      navigate("/cart");
    }
  }, [idUser, navigate]);

  // Gọi API lấy giỏ hàng
  const fetchCartData = useCallback(async () => {
    if (!idUser) {
      setError("Vui lòng đăng nhập để xem giỏ hàng.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await fetchCart(idUser); // Sử dụng hàm fetchCart từ context
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn("Giỏ hàng trống hoặc không tồn tại cho user này.");
        setError("Giỏ hàng trống.");
      } else {
        console.error("Lỗi khi gọi API:", err);
        setError("Đã xảy ra lỗi khi tải giỏ hàng. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [idUser, fetchCart]);

  // Gọi API khi idUser thay đổi
  useEffect(() => {
    fetchCartData();
  }, [idUser, fetchCartData]);

  // Tính tổng số lượng sản phẩm
  const cartTotalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  return (
    <div
      className="relative mx-5 mt-1 cart-dialog"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Nút giỏ hàng */}
      <button
        className="text-brown cursor-pointer focus:outline-none relative"
        onClick={handleNavigate}
      >
        <FaShoppingCart className="text-2xl" />
        {cartTotalQuantity > 0 && (
          <span className="absolute -top-1 -right-2 bg-green-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {cartTotalQuantity}
          </span>
        )}
      </button>

      {/* Hiển thị DialogCart */}
      {isHovered && !loading && cartItems.length > 0 && (
        <DialogCart
          cartItems={cartItems}
          idUser={idUser}
          onUpdateCart={fetchCartData}
        />
      )}

      {/* Hiển thị loading */}
      {isHovered && loading && (
        <div className="absolute right-0 w-80 p-4 bg-white shadow-md rounded-lg">
          <p className="text-center text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      )}

      {/* Hiển thị giỏ hàng trống hoặc lỗi */}
      {isHovered && !loading && cartItems.length === 0 && (
        <div className="absolute right-0 w-80 p-4 bg-white shadow-md rounded-lg">
          <p className="text-center text-gray-500">
            {error || "Giỏ hàng trống"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CartButton;