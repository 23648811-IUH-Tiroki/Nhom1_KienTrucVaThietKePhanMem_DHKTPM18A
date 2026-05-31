import Cart from "../models/Cart.js";
import { createServiceError } from "../utils/serviceError.js";

// ============ Service Functions ============

/**
 * Validate user ID from request
 */
const validateUserId = (userId) => {
  if (!userId) {
    throw createServiceError("Không tìm thấy người dùng đã đăng nhập", 401);
  }
  return userId;
};

/**
 * Add product to cart
 */
export const addToCart = async (userId, cartData) => {
  validateUserId(userId);
  const { product_id, quantity } = cartData;

  let cart = await Cart.findOne({ user_id: userId });

  if (cart) {
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product_id, quantity });
    }
  } else {
    cart = new Cart({
      user_id: userId,
      items: [{ product_id, quantity }],
    });
  }

  const savedCart = await cart.save();
  return savedCart;
};

/**
 * Get cart by user ID
 */
export const getCartByUserId = async (userId) => {
  validateUserId(userId);

  const cart = await Cart.findOne({ user_id: userId }).populate(
    "items.product_id"
  );

  if (!cart) {
    return { status: "empty", message: "Your cart is empty", items: [] };
  }

  return { status: "success", data: cart };
};

/**
 * Update entire cart
 */
export const updateCart = async (userId, cartData) => {
  validateUserId(userId);
  const { items } = cartData;

  const updatedCart = await Cart.findOneAndUpdate(
    { user_id: userId },
    { items },
    { new: true }
  ).populate("items.product_id");

  if (!updatedCart) {
    throw new Error("Cart not found");
  }

  return updatedCart;
};

/**
 * Update quantity of cart item
 */
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  validateUserId(userId);

  const cart = await Cart.findOne({ user_id: userId });

  if (!cart) {
    throw new Error("Giỏ hàng không tồn tại");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  return cart;
};

/**
 * Delete entire cart
 */
export const deleteCart = async (userId) => {
  validateUserId(userId);

  const cart = await Cart.findOneAndDelete({ user_id: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  return { message: "Cart deleted" };
};

/**
 * Remove product from cart
 */
export const deleteProductFromCart = async (userId, productId) => {
  validateUserId(userId);

  const cart = await Cart.findOne({ user_id: userId });

  if (!cart) {
    throw new Error("Không tìm thấy giỏ hàng");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === productId
  );

  if (itemIndex === -1) {
    throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();
  await cart.populate("items.product_id");

  return {
    message:
      cart.items.length === 0
        ? "Đã xóa sản phẩm. Giỏ hàng hiện đang trống."
        : "Đã xóa sản phẩm khỏi giỏ hàng",
    data: cart,
  };
};

/**
 * Clear all products from cart
 */
export const deleteAllProductsFromCart = async (userId) => {
  validateUserId(userId);

  const cart = await Cart.findOneAndUpdate(
    { user_id: userId },
    { items: [] },
    { new: true }
  ).populate("items.product_id");

  return cart;
};

/**
 * Count items in cart
 */
export const countCartItems = async (userId) => {
  validateUserId(userId);

  const cart = await Cart.findOne({ user_id: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const count = cart.items.reduce((total, item) => total + item.quantity, 0);
  return count;
};
