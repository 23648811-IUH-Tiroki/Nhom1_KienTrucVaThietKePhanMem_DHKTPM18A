import React, { useState, useEffect } from "react";
import MainLayout from "../layout/mainLayout";
import Breadcrumb from "../components/Breadcrumb";
import { ToastContainer, toast } from "react-toastify";
import "./page.scss";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axiosInstance from "../utils/axiosInstance";
import boxCard from "../assets/images/box-card.png";
import bankCard from "../assets/images/bank-card.png";
import { CheckCheck, ChevronDown } from "lucide-react";
import { BsBox2 } from "react-icons/bs";

const CheckOut = () => {
  const [deliveryOption, setDeliveryOption] = useState("delivery");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product_id?.price || 0) * item.quantity,
    0
  );
  const calculateTotal = () => {
    return deliveryOption === "pickup" ? subtotal : subtotal + shippingCost;
  };
  const links = [
    { label: "Trang chủ", link: "/" },
    { label: "Giỏ hàng", link: "/cart" },
    { label: "Thanh toán" },
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    couponCode: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
      setFormData((prevState) => ({
        ...prevState,
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      }));
    } else {
      toast.error("Vui lòng đăng nhập để đặt hàng.");
      navigate("/login");
    }
  }, [navigate]);

  const shippingRates = {
    "Miền Nam": 10000,
    "Miền Tây": 20000,
    "Miền Trung": 30000,
    "Miền Bắc": 40000,
  };

  const regions = {
    "Miền Bắc": [
      "Hà Nội",
      "Hải Phòng",
      "Quảng Ninh",
      "Bắc Giang",
      "Bắc Ninh",
      "Thái Nguyên",
      "Lạng Sơn",
      "Cao Bằng",
      "Hà Giang",
      "Lào Cai",
      "Yên Bái",
      "Phú Thọ",
      "Tuyên Quang",
      "Bắc Kạn",
      "Điện Biên",
      "Sơn La",
      "Hòa Bình",
    ],
    "Miền Trung": [
      "Đà Nẵng",
      "Huế",
      "Quảng Nam",
      "Quảng Ngãi",
      "Bình Định",
      "Phú Yên",
      "Khánh Hòa",
      "Ninh Thuận",
      "Bình Thuận",
    ],
    "Miền Nam": ["Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Bà Rịa - Vũng Tàu"],
    "Miền Tây": [
      "Cần Thơ",
      "An Giang",
      "Đồng Tháp",
      "Tiền Giang",
      "Vĩnh Long",
      "Bến Tre",
      "Hậu Giang",
      "Kiên Giang",
      "Trà Vinh",
      "Sóc Trăng",
      "Bạc Liêu",
      "Cà Mau",
      "Long An",
    ],
  };

  const updateShippingCost = (province) => {
    setSelectedProvince(province);
    let cost = 0;
    for (let region in regions) {
      if (regions[region].includes(province)) {
        cost = shippingRates[region];
        break;
      }
    }
    setShippingCost(cost);
  };
  const validateForm = () => {
    const newErrors = {};

    if (deliveryOption === "delivery") {
      if (!formData.address.trim()) {
        newErrors.address = "Vui lòng nhập địa chỉ giao hàng.";
      }

      if (!selectedProvince) {
        newErrors.province = "Vui lòng chọn tỉnh/thành phố.";
      }
    } else {
      if (!formData.province) {
        newErrors.province = "Vui lòng chọn chi nhánh nhận hàng.";
      }
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    if (cartItems.length === 0) {
      newErrors.cart = "Giỏ hàng của bạn đang trống.";
      toast.error(
        "Giỏ hàng của bạn đang trống, vui lòng thêm sản phẩm trước khi đặt hàng."
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDeliveryOptionChange = (option) => {
    setDeliveryOption(option);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (!user) {
        toast.error("Vui lòng đăng nhập để đặt hàng.");
        navigate("/login");
        return;
      }

      const orderData = {
        user_id: user._id,
        items: cartItems.map((item) => ({
          product_id: item.product_id?._id || item.product_id,
          quantity: item.quantity,
        })),
        total_price: calculateTotal(),
        status: "Chờ xử lý",
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        province: formData.province || selectedProvince,
        deliveryOption: deliveryOption,
        paymentMethod: selectedMethod,
        shippingCost: deliveryOption === "pickup" ? 0 : shippingCost,
      };

      try {
        // show loading toast
        const loadingToastId = toast.loading("Đang xử lý đơn hàng...");

        // call API đặt hàng
        const response = await axiosInstance.post("/api/orders", orderData);

        // update toast thành công
        toast.update(loadingToastId, {
          render: "Đặt hàng thành công!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });

        // clear all cart
        if (user._id) {
          await clearCart(user._id);
        }

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          province: "",
          district: "",
          couponCode: "",
        });
        setSelectedProvince("");
        setShippingCost(0);
        setDeliveryOption("delivery");
        setSelectedMethod("cod");
        setErrors({});

        setTimeout(() => {
          navigate("/userProfile#don-hang-cua-ban");
        }, 1000);
      } catch (error) {
        console.error("Error submitting order:", error);
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng."
        );
      }
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi đặt hàng.");
    }
  };

  const storeLocations = [
    {
      id: 1,
      name: "Trang: 12 Nguyễn Văn Bảo, Quận Gò Vấp, Hồ Chí Minh",
    },
  ];

  const handlePaymentSelection = (method) => {
    setSelectedMethod(method);
  };

  return (
    <MainLayout>
      <ToastContainer />
      <Breadcrumb items={links} />
      <div className="max-w-6xl mx-auto px-4 py-8 checkout-page">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pet Station</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left checkout */}
          <div className="md:w-3/5">
            <div className="mb-5">
              <p className="text-gray-600 text-xl">Thông tin giao hàng</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border border-gray-200 rounded-lg p-6"
            >
              <div className="mb-4">
                <input
                  type="text"
                  name="fullName"
                  className="w-full border rounded p-3 focus:outline-none  bg-gray-100 opacity-70  cursor-not-allowed"
                  value={formData.fullName}
                  readOnly
                />
                <p className="text-red-500 text-xs italic">{errors.fullName}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border rounded p-3 focus:outline-none  bg-gray-100 opacity-70  cursor-not-allowed"
                    value={formData.email}
                    readOnly
                  />
                  <p className="text-red-500 text-xs italic">{errors.email}</p>
                </div>
                <div className="flex-1">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    className="w-full border rounded p-3 focus:outline-none  bg-gray-100 opacity-70  cursor-not-allowed"
                    value={formData.phone}
                    readOnly
                  />
                  <p className="text-red-500 text-xs italic">{errors.phone}</p>
                </div>
              </div>

              <div className="mb-4">
                <div
                  className={`border ${
                    deliveryOption === "delivery"
                      ? "border-blue-0"
                      : "border-gray-300"
                  } rounded p-3 mb-3 cursor-pointer`}
                  onClick={() => handleDeliveryOptionChange("delivery")}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-6 h-6 border-2 ${
                        deliveryOption === "delivery"
                          ? "border-blue-0"
                          : "border-gray-300"
                      } rounded-full mr-2`}
                    >
                      <div
                        className={`w-3 h-3 ${
                          deliveryOption === "delivery"
                            ? "bg-blue-0"
                            : "bg-transparent"
                        } rounded-full`}
                      ></div>
                    </div>
                    <span className="text-gray-700">Giao tận nơi</span>
                  </div>
                </div>

                <div
                  className={`border ${
                    deliveryOption === "pickup"
                      ? "border-blue-0"
                      : "border-gray-300"
                  } rounded p-3 cursor-pointer`}
                  onClick={() => handleDeliveryOptionChange("pickup")}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-6 h-6 border-2 ${
                        deliveryOption === "pickup"
                          ? "border-blue-0"
                          : "border-gray-300"
                      } rounded-full mr-2`}
                    >
                      <div
                        className={`w-3 h-3 ${
                          deliveryOption === "pickup"
                            ? "bg-blue-0"
                            : "bg-transparent"
                        } rounded-full`}
                      ></div>
                    </div>
                    <span className="text-gray-700">Nhận tại cửa hàng</span>
                  </div>
                </div>
              </div>

              {deliveryOption === "delivery" ? (
                <div className="mb-6">
                  <div className="mb-4">
                    <input
                      type="text"
                      name="address"
                      placeholder="Địa chỉ"
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.address}
                      onChange={handleInputChange}
                      required={deliveryOption === "delivery"}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors.address}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          className="w-full border border-gray-300 rounded p-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={selectedProvince}
                          onChange={(e) => updateShippingCost(e.target.value)}
                        >
                          <option value="">Chọn tỉnh / thành</option>
                          {Object.values(regions)
                            .flat()
                            .map((province) => (
                              <option key={province} value={province}>
                                {province}
                              </option>
                            ))}
                        </select>
                        <p className="text-red-500 text-xs italic">
                          {errors.province}
                        </p>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <ChevronDown />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-5">
                      Phương thức vận chuyển
                    </h3>
                    {selectedProvince && (
                      <div className="flex justify-between shipping-cost border-1 rounded p-3 ">
                        <span>Phí vận chuyển: </span>
                        <strong>{shippingCost.toLocaleString("vi-VN")}đ</strong>
                      </div>
                    )}

                    {!selectedProvince && (
                      <div className="flex items-center justify-center border border-gray-200 rounded p-8">
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">
                            <BsBox2 size={90} className="text-gray-500" />
                          </div>
                          <p className="text-gray-600">
                            Vui lòng chọn tỉnh / thành để có danh sách phương
                            thức vận chuyển.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="mb-4">
                    <div className="relative">
                      <select
                        name="province"
                        className="w-full border border-gray-300 rounded p-3 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={formData.province}
                        onChange={handleInputChange}
                        required={deliveryOption === "pickup"}
                      >
                        <option value="" disabled>
                          Chọn tỉnh / thành
                        </option>
                        <option value="hcm">TP Hồ Chí Minh</option>
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Chi nhánh còn hàng
                    </h3>
                    <div className="border border-gray-200 rounded p-4">
                      {storeLocations.map((store) => (
                        <div key={store.id} className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-0 rounded-full mr-2 text-white">
                            <CheckCheck size={16} color="white" />
                          </div>
                          <span className="text-gray-700">{store.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
            <h2 className="text-lg font-semibold mt-8 mb-4">
              Phương thức thanh toán
            </h2>

            <div
              className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer ${
                selectedMethod === "cod"
                  ? "border-blue-0 bg-blue-100"
                  : "border-gray-300"
              }`}
              onClick={() => handlePaymentSelection("cod")}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={selectedMethod === "cod"}
                onChange={() => handlePaymentSelection("cod")}
              />
              <img src={boxCard} alt="COD" width="30" />
              <span>Thanh toán khi giao hàng (COD)</span>
            </div>

            <div
              className={`border p-4 rounded-lg flex items-center space-x-3 cursor-pointer mt-3 ${
                selectedMethod === "bank"
                  ? "border-blue-0 bg-blue-100"
                  : "border-gray-300"
              }`}
              onClick={() => handlePaymentSelection("bank")}
            >
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={selectedMethod === "bank"}
                onChange={() => handlePaymentSelection("bank")}
              />
              <img src={bankCard} alt="Bank" width="30" />
              <span>Chuyển khoản qua ngân hàng</span>
            </div>
          </div>
          {/* Right Checkout */}
          <div className="md:w-2/5 bg-gray-50 rounded-lg p-6">
            {/* Product list */}

            <div className="border-b border-gray-200 pb-6 mb-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-start mb-4">
                  <div className="relative mr-4">
                    <div className="bg-gray-200 rounded w-16 h-16 flex items-center justify-center relative">
                      <img
                        src={item.product_id?.images?.[0]}
                        alt={item.product_id?.name}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm">{item.product_id?.name}</h3>
                    <p className="text-gray-500 text-xs">SL: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {(
                        (item.product_id?.price || 0) * item.quantity
                      ).toLocaleString()}
                      ₫
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tạm tính</span>
                <span>{subtotal.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển </span>
                <strong>
                  {deliveryOption === "pickup"
                    ? "0đ"
                    : `${shippingCost.toLocaleString()}đ`}
                </strong>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg pt-4 border-t border-gray-200">
                <span>Tổng cộng</span>
                <div className="text-right">
                  <span className="text-gray-500 text-sm mr-1">VND</span>
                  <span>{calculateTotal().toLocaleString()}đ</span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-0 text-white py-3 px-4 rounded text-center hover:bg-blue-600 transition"
              onClick={handleSubmit}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckOut;
