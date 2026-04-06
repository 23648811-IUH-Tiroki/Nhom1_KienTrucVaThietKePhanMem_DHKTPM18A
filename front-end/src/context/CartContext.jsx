import React, { createContext, useState, useContext, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm lấy dữ liệu giỏ hàng
  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/carts/${userId}`);
      if (response?.data?.status === "success") {
        setCartItems(response?.data?.data?.items || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(async (userId, productId, quantity) => {
    if (!userId) {
      return { success: false, message: "Vui lòng đăng nhập để thêm vào giỏ hàng" };
    }

    setIsLoading(true);
    try {
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      const cartResponse = await axiosInstance.get(`/api/carts/${userId}`);
      const existingCartItem = cartResponse.data?.data?.items?.find(
        (item) => item.product_id === productId
      ) || cartResponse.data?.items?.find(
        (item) => item.product_id === productId
      );

      if (existingCartItem) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng
        const updatedQuantity = existingCartItem.quantity + quantity;
        const updateResponse = await axiosInstance.put(
          `/api/carts/${userId}/${existingCartItem._id}`,
          { quantity: updatedQuantity }
        );

        if (updateResponse?.status === 200) {
          await fetchCart(userId); // Cập nhật lại giỏ hàng
          return { success: true, message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng" };
        } else {
          return { success: false, message: "Không thể cập nhật giỏ hàng" };
        }
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm mới
        const addResponse = await axiosInstance.post(`/api/carts/add`, {
          user_id: userId,
          product_id: productId,
          quantity,
        });

        if (addResponse?.status === 201) {
          await fetchCart(userId); // Cập nhật lại giỏ hàng
          return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng" };
        } else {
          return { success: false, message: "Không thể thêm sản phẩm vào giỏ hàng" };
        }
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đã xảy ra lỗi khi thêm vào giỏ hàng",
      };
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback(async (userId, itemId) => {
    if (!userId || !itemId) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/carts/${userId}/${itemId}`);
      if (response?.status === 200) {
        await fetchCart(userId); // Cập nhật lại giỏ hàng
        return { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" };
      } else {
        return { success: false, message: "Không thể xóa sản phẩm khỏi giỏ hàng" };
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đã xảy ra lỗi khi xóa sản phẩm",
      };
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartItemQuantity = useCallback(async (userId, itemId, quantity) => {
    if (!userId || !itemId || quantity < 1) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/api/carts/${userId}/${itemId}`, {
        quantity,
      });
      if (response?.status === 200) {
        await fetchCart(userId); // Cập nhật lại giỏ hàng
        return { success: true, message: "Đã cập nhật số lượng sản phẩm" };
      } else {
        return { success: false, message: "Không thể cập nhật số lượng sản phẩm" };
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật số lượng",
      };
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(`/api/carts/${userId}`);
      if (response?.status === 200) {
        setCartItems([]); // Xóa toàn bộ giỏ hàng
        return { success: true, message: "Đã xóa toàn bộ giỏ hàng" };
      } else {
        return { success: false, message: "Không thể xóa toàn bộ giỏ hàng" };
      }
    } catch (error) {
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Đã xảy ra lỗi khi xóa toàn bộ giỏ hàng",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Giá trị cung cấp bởi CartContext
  const value = {
    cartItems,
    isLoading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook tùy chỉnh để sử dụng CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};