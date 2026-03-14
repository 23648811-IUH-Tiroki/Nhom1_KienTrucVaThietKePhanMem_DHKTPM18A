import Cart from '../models/Cart.js';

// Thêm sản phẩm vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
      const { user_id, product_id, quantity } = req.body;
      let cart = await Cart.findOne({ user_id });

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
              user_id,
              items: [{ product_id, quantity }],
          });
      }

      // Lưu giỏ hàng
      const savedCart = await cart.save();

      res.status(201).json(savedCart);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

// Lấy giỏ hàng theo user_id
export const getCartByUserId = async (req, res) => {
    try {
      const cart = await Cart.findOne({ user_id: req.params.user_id }).populate('items.product_id');

      // Nếu giỏ hàng tồn tại nhưng không có sản phẩm
      if (!cart) {
        console.log("Giỏ hàng trống");
        return res.status(200).json({ status: "empty", message: "Your cart is empty", items: [] });
      }
  
      res.status(200).json({ status: "success", data: cart });
    } catch (error) {
      console.error("Lỗi khi truy vấn giỏ hàng:", error);
      res.status(500).json({ status: "error", message: "Lỗi server, không thể lấy giỏ hàng.", error: error.message });
    }
  };

// Cập nhật giỏ hàng
export const updateCart = async (req, res) => {
    try {
        const { items } = req.body;
        const updatedCart = await Cart.findOneAndUpdate(
            {user_id: req.params.user_id},
            {items},
            {new: true}
        ).populate('items.product_id');
        if (!updatedCart) {
            return res.status(404).json({message: "Cart not found"});
        }
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItemQuantity = async (req, res) => {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;
  
    try {
      // Kiểm tra xem giỏ hàng của người dùng có tồn tại không
      const cart = await Cart.findOne({ user_id: userId });
  
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Giỏ hàng không tồn tại",
        });
      }
  
      // Tìm sản phẩm cần cập nhật trong giỏ hàng
      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === itemId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          status: "error",
          message: "Sản phẩm không tồn tại trong giỏ hàng",
        });
      }
  
      // Cập nhật số lượng sản phẩm
      cart.items[itemIndex].quantity = quantity;
  
      // Lưu giỏ hàng đã cập nhật
      await cart.save();
  
      // Trả về kết quả thành công
      res.status(200).json({
        status: "success",
        data: cart,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi cập nhật số lượng sản phẩm",
      });
    }
  };

// Xóa giỏ hàng
export const deleteCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndDelete({user_id: req.params.user_id});
        if (!cart) {
            return res.status(404).json({message: "Cart not found"});
        }
        res.status(200).json({message: "Cart deleted"});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

// Xóa sản phẩm khỏi giỏ hàng
export const deleteProductFromCart = async (req, res) => {
    const { user_id, product_id } = req.params;
    try {
      // Tìm giỏ hàng của người dùng
      const cart = await Cart.findOne({ user_id });
  
      if (!cart) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy giỏ hàng",
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === product_id
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({
          status: "error",
          message: "Sản phẩm không tồn tại trong giỏ hàng",
        });
      }
  
      // Xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(itemIndex, 1);
  
      // Lưu lại giỏ hàng
      await cart.save();
  
      // Populate thông tin sản phẩm (nếu cần)
      await cart.populate("items.product_id");
  
      // Trả về kết quả
      if (cart.items.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "Đã xóa sản phẩm. Giỏ hàng hiện đang trống.",
          data: cart,
        });
      }
  
      res.status(200).json({
        status: "success",
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
        data: cart,
      });
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      res.status(500).json({
        status: "error",
        message: "Đã xảy ra lỗi khi xóa sản phẩm",
        error: error.message,
      });
    }
  };
// Xóa tất cả sản phẩm khỏi giỏ hàng
export const deleteAllProductsFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            {user_id: req.params.user_id},
            {items: []},
            {new: true}
        ).populate('items.product_id');
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

// đếm số lượng sản phẩm trong giỏ hàng
export const countCartItems = async (req, res) => {
    try {
        const cart = await Cart.findOne({user_id: req.params.user_id});
        if (!cart) {
            return res.status(404).json({message: "Cart not found"});
        }
        const count = cart.items.reduce((total, item) => total + item.quantity, 0);
        res.status(200).json(count);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
}