import React, { createContext, useState, useContext, useCallback } from "react";
import { toast } from "react-toastify";
import {
  addCartItem as addCartItemRequest,
  clearCart as clearCartRequest,
  fetchCart as fetchCartRequest,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
} from "../services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeCartItems = (cartResponse) => {
    if (cartResponse?.data?.data?.items) {
      return cartResponse.data.data.items;
    }

    if (Array.isArray(cartResponse?.data?.items)) {
      return cartResponse.data.items;
    }

    if (Array.isArray(cartResponse?.data)) {
      return cartResponse.data;
    }

    return [];
  };

  // Hàm lấy dữ liệu giỏ hàng
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchCartRequest();
      setCartItems(normalizeCartItems(response));
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback(async (userId, productId, quantity) => {
    if (!productId || !quantity) {
      return { success: false, message: "Thiếu thông tin sản phẩm" };
    }

    setIsLoading(true);
    try {
      const addResponse = await addCartItemRequest(productId, quantity);

      if (addResponse?.status === 201) {
        // toast.success("Đã thêm sản phẩm vào giỏ hàng", {
        //   toastId: "cart-add-success-toast",
        // });
        fetchCart().catch((error) => {
          console.error("Lỗi khi đồng bộ giỏ hàng:", error);
        });
        return { success: true, message: "Đã thêm sản phẩm vào giỏ hàng" };
      } else {
        return { success: false, message: "Không thể thêm sản phẩm vào giỏ hàng" };
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
    if (!itemId) return;
    setIsLoading(true);
    try {
      const response = await removeCartItemRequest(itemId);
      if (response?.status === 200) {
        await fetchCart();
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
    if (!itemId || quantity < 1) return;

    setIsLoading(true);
    try {
      const response = await updateCartItemRequest(itemId, quantity);
      if (response?.status === 200) {
        await fetchCart();
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
    setIsLoading(true);
    try {
      const response = await clearCartRequest();
      if (response?.status === 200) {
        setCartItems([]);
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