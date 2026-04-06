import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";


const initialState = {
  cartItems: localStorage.getItem("cartItems")
    ? JSON.parse(localStorage.getItem("cartItems"))
    : [],
  cartTotalQuantity: 0,
  cartTotalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const existingIndex = state.cartItems.findIndex(
        (item) => item._id === action.payload._id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex] = {
          ...state.cartItems[existingIndex],
          cartQuantity: state.cartItems[existingIndex].cartQuantity + 1,
        };
        toast.info("Bạn đã tăng sản phẩm", {
          position: "bottom-left",
        });
      } else {
        let tempProductItem = { ...action.payload, cartQuantity: 1 };
        state.cartItems.push(tempProductItem);
        toast.success("Thêm vào giỏ hàng thàng công", {
          position: "bottom-left",
        });
      }
      
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      state.cartTotalQuantity = state.cartItems.reduce((total, item) => total + item.cartQuantity, 0);
    },
    decreaseCart(state, action) {
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (state.cartItems[itemIndex].cartQuantity > 1) {
        state.cartItems[itemIndex].cartQuantity -= 1;

        toast.info("Giảm 1 sản phẩm", {
          position: "bottom-left",
        });
      } else if (state.cartItems[itemIndex].cartQuantity === 1) {
        const nextCartItems = state.cartItems.filter(
          (item) => item.id !== action.payload.id
        );

        state.cartItems = nextCartItems;

        toast.error("Sản phẩm đã được xóa khỏi giỏ hàng", {
          position: "bottom-left",
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeFromCart(state, action) {
      state.cartItems.map((cartItem) => {
        if (cartItem.id === action.payload.id) {
          const nextCartItems = state.cartItems.filter(
            (item) => item.id !== cartItem.id
          );

          state.cartItems = nextCartItems;

          toast.error("Product removed from cart", {
            position: "bottom-left",
          });
        }
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        return state;
      });
    },
    getTotals(state, action) {
      let { total, quantity } = state.cartItems.reduce(
        (cartTotal, cartItem) => {
          const { price, cartQuantity } = cartItem;
          const itemTotal = price * cartQuantity;

          cartTotal.total += itemTotal;
          cartTotal.quantity += cartQuantity;

          return cartTotal;
        },
        {
          total: 0,
          quantity: 0,
        }
      );
      total = parseFloat(total.toFixed(2));
      state.cartTotalQuantity = quantity;
      state.cartTotalAmount = total;
    },
    deleteCardAll(state, action) {
      state.cartItems = [];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      toast.error("Cart cleared", { position: "bottom-left" });
    },
  },
});

export const { addToCart, decreaseCart, removeFromCart, getTotals, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;



// import { createSlice } from "@reduxjs/toolkit";
// import axiosInstance from "../utils/axiosInstance";

// const initialState = {
//   cartItems: [],
//   cartTotalQuantity: 0,
// };

// export const syncCartToBackend = async (cartItems, userId) => {
//   if (!userId) {
//     console.error("Thiếu thông tin người dùng.");
//     return;
//   }

//   try {
//     const response = await axiosInstance.put(`/api/carts/${userId}`, {
//       items: cartItems,
//     });

//     if (response.status === 200) {
//       console.log("Giỏ hàng đã được đồng bộ thành công.");
//     } else {
//       console.error("Đồng bộ giỏ hàng thất bại:", response.data?.message || "Lỗi không xác định");
//     }
//   } catch (error) {
//     console.error("Lỗi khi đồng bộ giỏ hàng:", error.response?.data?.message || error.message);
//   }
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCart(state, action) {
//       state.cartItems = action.payload;
//       state.cartTotalQuantity = action.payload.reduce(
//         (total, item) => total + item.quantity,
//         0
//       );
//     },
//     addToCart(state, action) {
//       const existingIndex = state.cartItems.findIndex(
//         (item) => item.product_id === action.payload.product_id
//       );

//       if (existingIndex >= 0) {
//         state.cartItems[existingIndex].quantity += action.payload.quantity;
//       } else {
//         state.cartItems.push(action.payload);
//       }

//       state.cartTotalQuantity = state.cartItems.reduce(
//         (total, item) => total + item.quantity,
//         0
//       );

//       // Đồng bộ với Backend
//       syncCartToBackend(state.cartItems, action.payload.userId);
//     },
//     removeFromCart(state, action) {
//       const { product_id, idUser } = action.payload;
//       console.log(action.payload)
//       console.log(product_id, idUser)
//       if (!idUser) {
//         console.error("Vui lòng đăng nhập để thực hiện thao tác này.");
//         return;
//       }

//       if (!product_id) {
//         console.error("Không tìm thấy sản phẩm để xóa.");
//         return;
//       }

//       const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?");
//       if (!confirmDelete) return;

//       const updatedCart = state.cartItems.filter((item) => item.product_id !== product_id);

//       if (updatedCart.length === state.cartItems.length) {
//         console.error("Sản phẩm không tồn tại trong giỏ hàng.");
//         return;
//       }

//       state.cartItems = updatedCart;

//       state.cartTotalQuantity = state.cartItems.reduce(
//         (total, item) => total + item.quantity,
//         0
//       );

//       console.log("Sản phẩm đã được xóa khỏi giỏ hàng.");

//       // Đồng bộ với Backend
//       syncCartToBackend(state.cartItems, userId);
//     },
//     clearCart(state, action) {
//       state.cartItems = [];
//       state.cartTotalQuantity = 0;

//       // Đồng bộ với Backend
//       syncCartToBackend(state.cartItems, action.payload.userId);
//     },
//   },
// });

// export const { setCart, addToCart, removeFromCart, clearCart } =
//   cartSlice.actions;
// export default cartSlice.reducer;



// import { createSlice } from "@reduxjs/toolkit";
// import { addToCartApi, deleteProductFromCartApi, deleteAllProductsFromCartApi, updateCartApi, getCartByUserIdApi } from "../api/cartApi";
// import { toast } from "react-toastify";

// const initialState = {
//   cartItems: [],
//   cartTotalQuantity: 0,
//   cartTotalAmount: 0,
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     setCart(state, action) {
//       state.cartItems = action.payload;
//       state.cartTotalQuantity = action.payload.reduce((sum, item) => sum + item.quantity, 0);
//     },
//     clearCartState(state) {
//       state.cartItems = [];
//       state.cartTotalQuantity = 0;
//     }
//   },
// });

// export const { setCart, clearCartState } = cartSlice.actions;

// // Thêm sản phẩm vào giỏ hàng
// export const addToCart = (userId, product, quantity) => async (dispatch) => {
//   try {
   
    
//     // Kiểm tra dữ liệu đầu vào
//     if (!userId) {
//       console.error("Thiếu thông tin userId");
//       toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
//       return;
//     }

//     if (!product?._id) {
//       console.error("Thiếu thông tin product_id");
//       toast.error("Sản phẩm không hợp lệ.");
//       return;
//     }

//     if (quantity < 1) {
//       console.error("Số lượng không hợp lệ");
//       toast.error("Số lượng sản phẩm phải lớn hơn 0.");
//       return;
//     }

//     // Gọi API để thêm sản phẩm
//     await addToCartApi(userId, product._id, quantity);

//     // Gọi API để lấy lại giỏ hàng mới nhất
//     const updatedCart = await getCartByUserIdApi(userId);

//     // Dispatch dữ liệu vào Redux store
//     dispatch(setCart(updatedCart.data.items));
//     toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
//   } catch (error) {
//     console.error("Lỗi khi thêm sản phẩm:", error);

//     // Kiểm tra lỗi từ API
//     const errorMessage =
//       error?.response?.data?.error ||
//       error?.response?.data?.message ||
//       error.message ||
//       "Đã xảy ra lỗi khi thêm sản phẩm.";
//     toast.error(errorMessage);
//   }
// };

// // Xóa sản phẩm khỏi giỏ hàng
// export const removeFromCart = (userId, productId) => async (dispatch) => {
//   try {
//     await deleteProductFromCartApi(userId, productId);
//     const updatedCart = await getCartByUserId(userId);
//     dispatch(setCart(updatedCart.data.items));
//     toast.success("Sản phẩm đã được xóa!");
//   } catch (error) {
//     console.error("Lỗi khi xóa sản phẩm:", error);
//     toast.error(error.message || "Lỗi khi xóa sản phẩm.");
//   }
// };

// // Xóa toàn bộ sản phẩm trong giỏ hàng
// export const clearCart = (userId) => async (dispatch) => {
//   try {
//     await deleteAllProductsFromCartApi(userId);
//     dispatch(clearCartState());
//     toast.success("Giỏ hàng đã được xóa sạch!");
//   } catch (error) {
//     console.error("Lỗi khi xóa giỏ hàng:", error);
//     toast.error(error.message || "Lỗi khi xóa giỏ hàng.");
//   }
// };

// export default cartSlice.reducer;

