import { useState, useEffect, useCallback } from "react";
import {
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import Sidebar from "../components/Sidebar";
import TopNavigation from "../components/TopNavigation";
import OrderStats from "../components/OrderStats";
import OrderFilters from "../components/OrderFilters";
import OrdersTable from "../components/OrdersTable";
import OrderDetailsModal from "../components/OrderDetailsModal";
import Pagination from "../components/Pagination";
import { toast } from "react-toastify";

const OrderManagement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageOrderValue: 0,
  });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem("user"));
      if (!userLocal || !userLocal._id)
        throw new Error("No user found in localStorage");
      const response = await axiosInstance.get(`api/users/${userLocal._id}`);
      setCurrentUser(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch current user:",
        err.response?.data || err.message
      );
      setCurrentUser({
        fullName: "Admin User",
        email: "admin@example.com",
        avatar: "",
      });
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersResponse, statsResponse] = await Promise.all([
          axiosInstance.get("/api/orders"),
          axiosInstance.get("/api/orders/stats"),
        ]);

        setOrders(ordersResponse.data);
        setFilteredOrders(ordersResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.user_id &&
            order.user_id.fullName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orders]);

  // phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // cập nhật trạng thái
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/api/orders/${orderId}`, {
        status: newStatus,
        updatedAt: Date.now(),
      });

      setOrders(
        orders.map((order) => (order._id === orderId ? response.data : order))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // xóa đơn hàng
  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axiosInstance.delete(`/api/orders/${orderId}`);
        setOrders(orders.filter((order) => order._id !== orderId));
        toast.success("Order deleted successfully");
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("Failed to delete order");
      }
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return {
          icon: <FaClock className="text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "Đang xử lý":
        return {
          icon: <FaBoxOpen className="text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
        };
      case "Đang giao hàng":
        return {
          icon: <FaShippingFast className="text-purple-500" />,
          color: "bg-purple-100 text-purple-800",
        };
      case "Đã giao hàng":
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          color: "bg-green-100 text-green-800",
        };
      case "Đã hủy":
        return {
          icon: <FaTimesCircle className="text-red-500" />,
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: <FaBoxOpen className="text-gray-500" />,
          color: "bg-gray-100 text-gray-600",
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
      />
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation
          setMobileSidebarOpen={setMobileSidebarOpen}
          currentUser={currentUser}
        />
        <main className="container mx-auto px-4 py-8 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Quản lý đơn hàng
          </h1>

          <OrderStats stats={stats} />

          <OrderFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <OrdersTable
            orders={currentOrders}
            formatDate={formatDate}
            getStatusInfo={getStatusInfo}
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
            viewOrderDetails={viewOrderDetails}
          />

          {filteredOrders.length > ordersPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirstOrder={indexOfFirstOrder}
              indexOfLastOrder={indexOfLastOrder}
              filteredOrders={filteredOrders}
              paginate={paginate}
            />
          )}

          {showModal && selectedOrder && (
            <OrderDetailsModal
              selectedOrder={selectedOrder}
              formatDate={formatDate}
              getStatusInfo={getStatusInfo}
              setShowModal={setShowModal}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderManagement;
