import { useState } from "react";
import { IoMdCart } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DialogProduct from "./DialogProduct";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useDispatch } from "react-redux";

function Product({ product }) {
  const [open, setOpen] = useState(false);
  const [openQuantityPopup, setOpenQuantityPopup] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // const handleAddToCart = async (product) => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   const userId = user?._id;
  //   if (!userId) {
  //     alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
  //     return;
  //   }

  //   try {
  //     const response = await axiosInstance.post("/api/carts/add", {
  //       user_id: userId,
  //       product_id: product._id,
  //       quantity: 1,
  //     });

  //     if (response.status === 201) {
  //       toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
  //       onCartUpdate();
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi thêm vào giỏ hàng:", error);
  //     alert(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
  //   }
  // };



  const user = JSON.parse(localStorage.getItem("user"));
  const handleAddToCart = async () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }

    const result = await addToCart(user._id, product._id, 1);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleBuyNow = () => {
    setOpenQuantityPopup(true);
  };

  const handleConfirmBuyNow = () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }

    addToCart(user._id, product._id, quantity);

    setOpenQuantityPopup(false);
    navigate("/checkout");
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div>
      <div
        className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer block"
      >
        <div className="relative group hover:cursor-pointer">
          <Link to={`/product/${product.slug}`}>
            <img
              className="hover:opacity-70 w-screen"
              src={product.images[0]}
              alt={product.name}
            />
          </Link>
          <div className="flex gap-3 absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setOpen(true)}
              className="bg-amber-50 p-2 rounded-[5px] group hover:bg-gray-400"
            >
              <MdOutlineRemoveRedEye className="hover:text-white" size={25} />
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-amber-50 p-2 rounded-[5px] group hover:bg-gray-400"
            >
              <IoMdCart className="hover:text-white" size={25} />
            </button>
          </div>
        </div>
        <div className="py-3 px-4 flex flex-col gap-1 justify-between h-[170px]">
          <Link
            to={"/product/2"}
            className="line-clamp-2 hover:text-[#c49a6c] hover:cursor-pointer"
          >
            {product.name}
          </Link>
          <div>
            <span className="text-1xl text-[#c49a6c] text-start">
              {product.price.toLocaleString("vi-VN") + "₫"}
            </span>
            <button
              text-xl
              font-bold
              onClick={handleBuyNow}
              style={{}}
              className="mt-3 mb-2 bg-[#e17100] text-white border-2 border-[#e17100] duration-200 transition-colors hover:bg-white text-brown-hover w-full py-2 rounded-[10px] font-medium cursor-pointer"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <DialogProduct open={open} product={product} setOpen={setOpen} />

      {openQuantityPopup && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="mb-4">
              <img
                src={product.images[0]}
                className="w-full h-48 object-contain mb-2 gap-1 border-1 border-[#e17100] rounded-[5px]"
                alt={product.name}
              />
              <h2 className="text-lg font-semibold text-[#e17100] line-clamp-2">
                {product.name}
              </h2>
              <p className="text-[#c49a6c] font-medium">
                {product.price.toLocaleString("vi-VN") + "₫"}
              </p>
            </div>
            <div className="flex  justify-between mb-4">
              <h5 className="text-l font-semibold pt-2">Chọn số lượng</h5>
              <div>
                <button
                  onClick={handleDecreaseQuantity}
                  className="cursor-pointer size-10 text-lg font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                {/* <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center border-y border-gray-300 py-1"
                min="1"
              /> */}
                <span className="px-6 text-lg font-medium">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="cursor-pointer size-10 text-lg font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition rounded-full"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setOpenQuantityPopup(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBuyNow}
                className="bg-[#e17100] text-white px-4 py-2 rounded-md cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;
