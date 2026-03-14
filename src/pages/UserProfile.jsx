import { useEffect, useState } from "react";
import {
  FaUser,
  FaShoppingBag,
  FaHistory,
  FaEdit,
  FaSignOutAlt,
  FaTrash,
  FaEye,
  FaFileDownload,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingOverlay from "../components/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import ScrollToTopButton from "../components/ScrollToTopButton";
import Modal from "../components/Modal";
import { generateInvoice } from "../utils/GenerateInvoice";
import { FaCartPlus } from "react-icons/fa6";
import axiosInstance from "../utils/axiosInstance";

const UserProfile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    avatar: "",
    gender: "",
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalSpent: 0,
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [processingOrders, setProcessingOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [canceledOrders, setCanceledOrders] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const convertBase64ToImage = (base64) => {
    return `data:image/jpeg;base64,${base64}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          navigate("/login");
          return;
        }

        const res = await axiosInstance.get(`/api/users/${user._id}`);

        const userData = res.data;
        userData.avatar = convertBase64ToImage(userData.avatar);
        setUser(userData);
        setLoggedIn(true);

        fetchUserOrders(user._id);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const fetchUserOrders = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/orders?user_id=${userId}`);
      const userOrders = response.data;

      const pendingOrders = userOrders.filter(
        (order) => order.status === "Chờ xử lý"
      );
      const processingOrders = userOrders.filter(
        (order) => order.status === "Đang xử lý"
      );
      const shippingOrders = userOrders.filter(
        (order) => order.status === "Đang giao hàng"
      );
      const deliveredOrders = userOrders.filter(
        (order) => order.status === "Đã giao hàng"
      );
      const completedOrders = userOrders.filter(
        (order) => order.status === "Hoàn tất"
      );
      const canceledOrders = userOrders.filter(
        (order) => order.status === "Đã hủy"
      );

      const totalSpent = userOrders.reduce(
        (sum, order) => sum + order.total_price,
        0
      );

      setOrderStats({
        totalOrders: userOrders.length,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        shippingOrders: shippingOrders.length,
        deliveredOrders: deliveredOrders.length,
        completedOrders: completedOrders.length,
        canceledOrders: canceledOrders.length,
        totalSpent: totalSpent,
      });

      setPendingOrders(pendingOrders);
      setProcessingOrders(processingOrders);
      setShippingOrders(shippingOrders);
      setDeliveredOrders(deliveredOrders);
      setCompletedOrders(completedOrders);
      setCanceledOrders(canceledOrders);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders: " + err.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData._id) {
        await axiosInstance.post("/api/users/logout", { userId: userData._id });
        toast.success("Đăng xuất thành công!");
      }

      localStorage.removeItem("user");
      setTimeout(() => {
        navigate("/");
        setLoggedIn(false);
        setIsLoggingOut(false);
      }, 22000);
    } catch (err) {
      console.error("Logout Error:", err.response?.data || err.message);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại!");
      setIsLoggingOut(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          const avatarBinary = reader.result;

          const updateUser = {
            ...user,
            avatar: avatarBinary.split(",")[1],
          };

          const res = await axiosInstance.put(
            `/api/users/${user._id}`,
            updateUser,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const updatedUser = res.data;
          updatedUser.avatar = convertBase64ToImage(updatedUser.avatar);
          setUser(updatedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, avatar: updatedUser.avatar })
          );

          toast.success("Cập nhật ảnh đại diện thành công!");
          setSelectedFile(null);

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (err) {
          console.error("Lỗi khi cập nhật avatar:", err);
          toast.error("Cập nhật ảnh đại diện thất bại!");
        }
      };

      reader.onerror = () => {
        toast.error("Đọc file thất bại!");
      };

      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleUpdateProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const res = await axiosInstance.put(
        `/api/users/${storedUser._id}`,
        {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          birthDate: user.birthDate,
          gender: user.gender,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = res.data;

      if (user.avatar && user.avatar.startsWith("data:image")) {
        updatedUser.avatar = user.avatar;
      } else {
        updatedUser.avatar = convertBase64ToImage(updatedUser.avatar);
      }

      setUser(updatedUser);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          birthDate: updatedUser.birthDate,
          gender: updatedUser.gender,
        })
      );

      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn hủy đơn hàng này?"
      );
      if (!confirmed) return;

      const response = await axiosInstance.put(`/api/orders/${orderId}`, {
        status: "Đã hủy",
      });

      if (response.status === 200) {
        toast.success("Đã hủy đơn hàng thành công");

        const user = JSON.parse(localStorage.getItem("user"));
        fetchUserOrders(user._id);
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại sau!");
    }
  };

  const hanldeGenerateInvoice = (order) => {
    generateInvoice(order, formatDisplayDate);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "text-yellow-500";
      case "Đang xử lý":
        return "text-blue-500";
      case "Đang giao hàng":
        return "text-purple-500";
      case "Đã giao hàng":
        return "text-indigo-500";
      case "Hoàn tất":
        return "text-green-500";
      case "Đã hủy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) return <LoadingOverlay isVisible={true} />;
  if (error)
    return (
      <div className="container mx-auto p-4 text-red-500">Lỗi: {error}</div>
    );

  return (
    <>
      <Header />
      <LoadingOverlay isVisible={isLoggingOut} />
      <div className="container mx-auto p-4 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6">
            <div className="flex flex-col items-center">
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="mt-2 bg-gray-100 p-1 rounded-full cursor-pointer flex justify-center items-center gap-2 text-sm hover:text-blue-500">
                <FaEdit className="text-gray-500 cursor-pointer hover:text-blue-500" />
                Cập nhật ảnh
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                {selectedFile && (
                  <button
                    className="w-10 h-6 bg-blue-500 text-white rounded-sm hover:bg-blue-600 cursor-pointer"
                    onClick={() => handleAvatarChange(selectedFile)}
                  >
                    Lưu
                  </button>
                )}
              </label>
              <h2 className="text-xl font-bold mt-2">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <ul className="mt-6 space-y-2">
              <li>
                <a
                  href="#thong-tin-ca-nhan"
                  onClick={() => handleTabChange("profile")}
                  className={`text-brown-hover cursor-pointer w-full flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg ${
                    activeTab === "profile" ? "bg-blue-50 text-blue-500" : ""
                  }`}
                >
                  <FaUser className="mr-2" />
                  Thông tin cá nhân
                </a>
              </li>
              <li>
                <a
                  href="#don-hang-cua-ban"
                  onClick={() => handleTabChange("orders")}
                  className={`text-brown-hover cursor-pointer w-full flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg ${
                    activeTab === "orders" ? "bg-blue-50 text-blue-500" : ""
                  }`}
                >
                  <FaShoppingBag className="mr-2" />
                  Đơn hàng của bạn
                </a>
              </li>
              <li>
                <a
                  href="#lich-su-mua-hang"
                  onClick={() => handleTabChange("history")}
                  className={`text-brown-hover cursor-pointer w-full flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg ${
                    activeTab === "history" ? "bg-blue-50 text-blue-500" : ""
                  }`}
                >
                  <FaHistory className="mr-2" />
                  Lịch sử mua hàng
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-brown-hover cursor-pointer w-full flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FaSignOutAlt className="mr-2" />
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 bg-white shadow-md rounded-lg p-6">
            {activeTab === "profile" && (
              <div>
                <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <label className="w-32 font-medium">Họ và tên:</label>
                    <input
                      type="text"
                      value={user.fullName}
                      onChange={(e) =>
                        setUser({ ...user, fullName: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center">
                    <label className="w-32 font-medium">Ngày sinh:</label>
                    <input
                      type="date"
                      value={formatDate(user.birthDate)}
                      onChange={(e) =>
                        setUser({ ...user, birthDate: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center">
                    <label className="w-32 font-medium">Giới tính:</label>
                    <select
                      value={
                        user.gender === true
                          ? "male"
                          : user.gender === false
                          ? "female"
                          : ""
                      }
                      onChange={(e) =>
                        setUser({
                          ...user,
                          gender: e.target.value === "male" ? true : false,
                        })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>

                  <div className="flex items-center">
                    <label className="w-32 font-medium">Email:</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center">
                    <label className="w-32 font-medium">Số điện thoại:</label>
                    <input
                      type="text"
                      value={user.phone}
                      onChange={(e) =>
                        setUser({ ...user, phone: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>
                  <div className="flex items-center">
                    <label className="w-32 font-medium">Địa chỉ:</label>
                    <input
                      type="text"
                      value={user.address}
                      onChange={(e) =>
                        setUser({ ...user, address: e.target.value })
                      }
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <FaEdit className="ml-2 text-gray-500 cursor-pointer" />
                  </div>
                  <button
                    onClick={handleUpdateProfile}
                    className="cursor-pointer bg-brown text-white py-2 px-4 rounded-lg bg-brown-hover"
                  >
                    Cập nhật thông tin
                  </button>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Thống kê đơn hàng</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
                      <div className="text-blue-500 text-lg font-bold">
                        {orderStats.totalOrders}
                      </div>
                      <div className="text-gray-600">Tổng số đơn hàng</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-100">
                      <div className="text-yellow-500 text-lg font-bold">
                        {orderStats.pendingOrders}
                      </div>
                      <div className="text-gray-600">Đơn hàng đang xử lý</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
                      <div className="text-green-500 text-lg font-bold">
                        {orderStats.completedOrders}
                      </div>
                      <div className="text-gray-600">
                        Đơn hàng đã hoàn thành
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
                      <div className="text-purple-500 text-lg font-bold">
                        {orderStats.totalSpent.toLocaleString()} VNĐ
                      </div>
                      <div className="text-gray-600">Tổng chi tiêu</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "orders" && (
              <div id="#don-hang-cua-ban">
                <h1 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h1>
                {pendingOrders.length === 0 &&
                processingOrders.length === 0 &&
                shippingOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bạn chưa có đơn hàng nào đang xử lý.</p>
                    <Link
                      to="/"
                      className="mt-4 inline-block bg-[#e17100] text-white py-2 px-4 rounded-lg hover:bg-[#d06a03]"
                    >
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Chờ xử lý</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleCancelOrder(order._id)
                                        }
                                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                        title="Hủy đơn hàng"
                                      >
                                        <FaTrash />
                                      </button>
                                      <button
                                        onClick={() =>
                                          hanldeGenerateInvoice(order)
                                        }
                                        className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        title="Tải hóa đơn"
                                      >
                                        <FaFileDownload />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {processingOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Đang xử lý</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {processingOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          hanldeGenerateInvoice(order)
                                        }
                                        className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        title="Tải hóa đơn"
                                      >
                                        <FaFileDownload />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {shippingOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">
                          Đang giao hàng
                        </h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {shippingOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          hanldeGenerateInvoice(order)
                                        }
                                        className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        title="Tải hóa đơn"
                                      >
                                        <FaFileDownload />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "history" && (
              <div id="#lich-su-mua-hang">
                <h1 className="text-2xl font-bold mb-4">Lịch sử mua hàng</h1>
                {deliveredOrders.length === 0 &&
                completedOrders.length === 0 &&
                canceledOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Bạn chưa có đơn hàng nào đã hoàn thành.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {deliveredOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Đã giao hàng</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày hoàn thành
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {deliveredOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.updatedAt)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          hanldeGenerateInvoice(order)
                                        }
                                        className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        title="Tải hóa đơn"
                                      >
                                        <FaFileDownload />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {completedOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Hoàn tất</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày hoàn thành
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {completedOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.updatedAt)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          hanldeGenerateInvoice(order)
                                        }
                                        className="p-1 text-green-500 hover:text-green-700 cursor-pointer"
                                        title="Tải hóa đơn"
                                      >
                                        <FaFileDownload />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {canceledOrders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold mb-4">Đã hủy</h2>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="py-2 px-4 border-b text-left">
                                  Mã đơn hàng
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày đặt
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Ngày hủy
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Tổng tiền
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Trạng thái
                                </th>
                                <th className="py-2 px-4 border-b text-left">
                                  Thao tác
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {canceledOrders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="py-2 px-4 border-b">
                                    {order._id
                                      .substring(order._id.length - 6)
                                      .toUpperCase()}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.order_date)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {formatDisplayDate(order.updatedAt)}
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    {order.total_price.toLocaleString()} VNĐ
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm ${getStatusClass(
                                        order.status
                                      )}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="py-2 px-4 border-b">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleViewOrder(order)}
                                        className="p-1 text-blue-500 hover:text-blue-700 cursor-pointer"
                                        title="Xem chi tiết"
                                      >
                                        <FaEye />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {showOrderModal && selectedOrder && (
              <Modal
                isOpen={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                size="lg"
              >
                <div className="p-6">
                  <h2 className="flex gap-5 justify-center text-2xl font-bold mb-6 text-gray-800 text-center border-b pb-4">
                    <FaCartPlus className="w-10 h-10" />
                    Chi tiết đơn hàng
                  </h2>
                  <div className="space-y-6 text-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Mã đơn hàng:
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedOrder._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Ngày đặt:
                      </p>
                      <p className="text-lg">
                        {formatDisplayDate(selectedOrder.order_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Trạng thái:
                      </p>
                      <p
                        className={`text-lg font-semibold ${getStatusClass(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Sản phẩm:
                      </p>
                      <ul className="list-none divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <li
                            key={index}
                            className="py-3 flex justify-between items-center"
                          >
                            <span className="font-medium text-gray-800">
                              {item.product_id.name}
                            </span>
                            <span className="text-sm text-gray-700">
                              {item.quantity} x{" "}
                              {item.product_id.price.toLocaleString()} VNĐ
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xl font-medium text-gray-500">
                        Tổng tiền:
                      </p>
                      <p className="text-xl font-bold text-brown">
                        {selectedOrder.total_price.toLocaleString()} VNĐ
                      </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setShowOrderModal(false)}
                        className="bg-gradient-to-r from-[#e17100] to-[#e17100] text-white py-3 px-6 rounded-lg hover:from-[#e17100] hover:to-[#b75e05] shadow-md transition-transform transform hover:scale-105 cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
      <ScrollToTopButton />
    </>
  );
};

export default UserProfile;
