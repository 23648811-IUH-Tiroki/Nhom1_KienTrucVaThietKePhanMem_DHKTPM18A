import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, 
  Eye, 
  Trash2, 
  Download, 
  Clock, 
  Box, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  X,
  FileText,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  CircleDot
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchOrders as fetchOrdersRequest,
  updateOrder as updateOrderRequest,
  deleteOrder as deleteOrderRequest,
  fetchOrderStats as fetchOrderStatsRequest
} from "../../services/orderService";
import { generateInvoice } from "../../utils/generateInvoice";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageOrderValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Drawer details state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const dropdownRef = useRef(null);
  const drawerRef = useRef(null);

  const normalizeStatus = (status) => {
    if (!status) return "pending";
    const normalized = String(status).trim();
    switch (normalized) {
      case "waiting_payment":
      case "Chờ thanh toán":
      case "PENDING_PAYMENT":
      case "WAITING_PAYMENT":
        return "waiting_payment";
      case "pending":
      case "Chờ xử lý":
      case "Chờ xác nhận":
        return "pending";
      case "confirmed":
      case "Đang xử lý":
      case "Đã xác nhận":
        return "confirmed";
      case "shipping":
      case "Đang giao hàng":
      case "Đang giao":
        return "shipping";
      case "delivered":
      case "Đã giao hàng":
      case "Đã giao":
      case "Hoàn tất":
        return "delivered";
      case "cancelled":
      case "Đã hủy":
        return "cancelled";
      case "expired":
      case "Hết hạn":
      case "Đơn hết hạn":
        return "expired";
      default:
        return "pending";
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        fetchOrdersRequest(),
        fetchOrderStatsRequest()
      ]);

      const normalized = (ordersRes.data || []).map(order => ({
        ...order,
        statusNormalized: normalizeStatus(order.status)
      }));

      // Sort by order_date desc
      normalized.sort((a, b) => new Date(b.order_date || b.createdAt) - new Date(a.order_date || a.createdAt));

      setOrders(normalized);
      setFilteredOrders(normalized);
      setStats(statsRes.data || { totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, averageOrderValue: 0 });
    } catch (err) {
      console.error("Failed to fetch orders data:", err);
      toast.error("Không thể tải dữ liệu đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle outside dropdown & drawer clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest(".order-row-action")) {
        // Only close drawer if click was outside drawer
        // and did not click elements that trigger drawer
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter orders
  useEffect(() => {
    let result = [...orders];

    // Search query (matches Order ID or Customer Name)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(query) ||
        (o.user_id && o.user_id.fullName && o.user_id.fullName.toLowerCase().includes(query)) ||
        (o.shippingAddress && o.shippingAddress.fullName && o.shippingAddress.fullName.toLowerCase().includes(query))
      );
    }

    // Status Tab Filter
    if (statusFilter !== "all") {
      result = result.filter(o => o.statusNormalized === statusFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const response = await updateOrderRequest(orderId, {
        status: newStatus,
        updatedAt: Date.now()
      });

      const updated = {
        ...response.data,
        statusNormalized: normalizeStatus(response.data.status)
      };

      // Update lists
      setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      
      // If drawer is open, sync drawer details
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }

      toast.success(`Đã cập nhật trạng thái đơn hàng thành: ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setIsUpdatingStatus(false);
      setActiveDropdown(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa đơn hàng này khỏi hệ thống?")) return;
    try {
      await deleteOrderRequest(orderId);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) {
        setIsDrawerOpen(false);
      }
      toast.success("Đã xóa đơn hàng thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa đơn hàng này");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleDownloadInvoice = (order) => {
    try {
      const formatDateInv = (d) => new Date(d).toLocaleDateString("vi-VN");
      generateInvoice(order, formatDateInv);
      toast.success("Tải xuống hóa đơn thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi kết xuất hóa đơn");
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      waiting_payment: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900",
      pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
      shipping: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900",
      expired: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800"
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStatusLabel = (status) => {
    const map = {
      waiting_payment: "Chờ thanh toán",
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      expired: "Hết hạn"
    };
    return map[status] || status;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Timeline step builder
  const getTimelineSteps = (order) => {
    const dateStr = order.order_date || order.createdAt;
    const updateStr = order.updatedAt || dateStr;
    const status = order.statusNormalized;
    
    const steps = [
      {
        title: "Đặt hàng thành công",
        desc: "Khởi tạo đơn hàng từ giỏ hàng",
        date: dateStr,
        isCompleted: true
      },
      {
        title: "Xác nhận đơn hàng",
        desc: "Hệ thống xác thực và chuẩn bị đóng gói",
        date: ["confirmed", "shipping", "delivered"].includes(status) ? updateStr : null,
        isCompleted: ["confirmed", "shipping", "delivered"].includes(status),
        isActive: status === "pending"
      },
      {
        title: "Đang vận chuyển",
        desc: "Đơn hàng đã bàn giao cho shipper",
        date: ["shipping", "delivered"].includes(status) ? updateStr : null,
        isCompleted: ["shipping", "delivered"].includes(status),
        isActive: status === "confirmed"
      },
      {
        title: "Giao nhận hoàn tất",
        desc: "Khách hàng đã nhận hàng và kiểm duyệt",
        date: status === "delivered" ? updateStr : null,
        isCompleted: status === "delivered",
        isActive: status === "shipping"
      }
    ];

    if (status === "cancelled") {
      steps.push({
        title: "Hủy đơn hàng",
        desc: "Đơn hàng bị hủy do yêu cầu",
        date: updateStr,
        isCompleted: true,
        isError: true
      });
    } else if (status === "expired") {
      steps.push({
        title: "Thanh toán hết hạn",
        desc: "Hệ thống hủy đơn do quá hạn thanh toán",
        date: updateStr,
        isCompleted: true,
        isError: true
      });
    }

    return steps;
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Đơn hàng</h1>
          <p className="text-xs text-slate-500">Giám sát trạng thái đơn hàng, xử lý khiếu nại và kết xuất hóa đơn</p>
        </div>
      </div>

      {/* Mini Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Doanh số Đơn hàng", value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
          { label: "Doanh thu Tháng", value: formatCurrency(stats.monthlyRevenue), icon: Clock, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Doanh thu Tuần", value: formatCurrency(stats.weeklyRevenue), icon: Box, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" },
          { label: "Đơn giá trung bình", value: formatCurrency(stats.averageOrderValue), icon: ShoppingBag, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{card.label}</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${card.color}`}>
              <card.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto admin-scrollbar pb-2 sm:pb-0 gap-1 border-b border-slate-100 dark:border-slate-800">
          {[
            { key: "all", label: "Tất cả" },
            { key: "waiting_payment", label: "Chờ thanh toán" },
            { key: "pending", label: "Chờ xác nhận" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "shipping", label: "Đang giao" },
            { key: "delivered", label: "Đã giao" },
            { key: "cancelled", label: "Đã hủy" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 border-b-2 text-xs font-semibold shrink-0 cursor-pointer transition ${
                statusFilter === tab.key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm theo Mã đơn hàng, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
          />
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3">
            <RefreshCw size={24} className="text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-medium">Không tìm thấy đơn hàng nào khớp bộ lọc</div>
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-semibold h-11">
                  <th className="px-6 w-32">Mã đơn</th>
                  <th className="px-4">Khách hàng</th>
                  <th className="px-4">Số điện thoại</th>
                  <th className="px-4">Ngày đặt</th>
                  <th className="px-4">Giá trị đơn</th>
                  <th className="px-4">Trạng thái</th>
                  <th className="px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors h-14">
                    <td className="px-6 font-mono font-bold text-slate-900 dark:text-white">
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 font-semibold">
                      {o.shippingAddress?.fullName || o.user_id?.fullName || "Khách vãng lai"}
                    </td>
                    <td className="px-4 font-medium text-slate-500">{o.shippingAddress?.phone || o.user_id?.phone || "-"}</td>
                    <td className="px-4 text-slate-500">{formatDate(o.order_date || o.createdAt)}</td>
                    <td className="px-4 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(o.total_price)}</td>
                    <td className="px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(o.statusNormalized)}`}>
                        {getStatusLabel(o.statusNormalized)}
                      </span>
                    </td>
                    
                    <td className="px-6 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === o._id ? null : o._id);
                        }}
                        className="order-row-action p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeDropdown === o._id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-6 mt-1 w-48 bg-white dark:bg-[#1e293b] rounded-xl shadow-admin-card border border-slate-100 dark:border-slate-800 py-1.5 z-40 text-left animate-fade-in"
                        >
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsDrawerOpen(true);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Eye size={13} className="text-slate-400" />
                            <span>Xem chi tiết (Drawer)</span>
                          </button>
                          
                          <button
                            onClick={() => handleDownloadInvoice(o)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                          >
                            <FileText size={13} className="text-slate-400" />
                            <span>Tải xuống hóa đơn</span>
                          </button>

                          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                          
                          {/* Next logic status controls */}
                          {o.statusNormalized === "waiting_payment" && (
                            <button
                              onClick={() => updateOrderStatus(o._id, "pending")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer font-medium"
                            >
                              <CircleDot size={13} />
                              <span>Xác nhận thanh toán</span>
                            </button>
                          )}

                          {o.statusNormalized === "pending" && (
                            <button
                              onClick={() => updateOrderStatus(o._id, "confirmed")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer font-medium"
                            >
                              <Box size={13} />
                              <span>Xác nhận đóng gói</span>
                            </button>
                          )}

                          {o.statusNormalized === "confirmed" && (
                            <button
                              onClick={() => updateOrderStatus(o._id, "shipping")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer font-medium"
                            >
                              <Truck size={13} />
                              <span>Bàn giao vận chuyển</span>
                            </button>
                          )}

                          {o.statusNormalized === "shipping" && (
                            <button
                              onClick={() => updateOrderStatus(o._id, "delivered")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer font-medium"
                            >
                              <CheckCircle2 size={13} />
                              <span>Hoàn tất giao nhận</span>
                            </button>
                          )}

                          {/* Allow cancellation if not completed/delivered */}
                          {!["delivered", "cancelled", "expired"].includes(o.statusNormalized) && (
                            <button
                              onClick={() => updateOrderStatus(o._id, "cancelled")}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer font-medium"
                            >
                              <XCircle size={13} />
                              <span>Hủy đơn hàng</span>
                            </button>
                          )}

                          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                          <button
                            onClick={() => handleDeleteOrder(o._id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer font-medium"
                          >
                            <Trash2 size={13} />
                            <span>Xóa hồ sơ đơn</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-Drawer Details view (Right aligned) */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer container */}
          <div 
            ref={drawerRef}
            className="relative w-full max-w-lg bg-white dark:bg-[#1e293b] h-full shadow-2xl flex flex-col z-10 animate-fade-in text-slate-800 dark:text-slate-200 border-l border-slate-100 dark:border-slate-850"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Chi tiết đơn hàng</h2>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedOrder._id}</span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 admin-scrollbar text-xs">
              
              {/* Customer and Delivery info */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-500">Thông tin Nhận hàng</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Người nhận:</span>
                    <span className="font-semibold text-slate-850 dark:text-slate-100">
                      {selectedOrder.shippingAddress?.fullName || selectedOrder.user_id?.fullName || "Khách vãng lai"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <span className="font-semibold text-slate-850 dark:text-slate-100">
                      {selectedOrder.shippingAddress?.phone || selectedOrder.user_id?.phone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa chỉ giao:</span>
                    <span className="font-semibold text-right max-w-[200px] text-slate-850 dark:text-slate-100">
                      {selectedOrder.shippingAddress?.address || selectedOrder.user_id?.address || "Nhận tại quầy"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày đặt hàng:</span>
                    <span className="font-semibold">{formatDate(selectedOrder.order_date || selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Trạng thái hiện tại:</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(selectedOrder.statusNormalized)}`}>
                      {getStatusLabel(selectedOrder.statusNormalized)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-500">Sản phẩm đã mua</h4>
                
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx} className="py-3 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.product_id?.images?.[0] || "/placeholder.png"} 
                          alt={item.product_id?.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{item.product_id?.name}</p>
                          <span className="text-[10px] text-slate-500">{formatCurrency(item.product_id?.price || 0)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity} x</span>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(item.quantity * (item.product_id?.price || 0))}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center pt-3 border-t border-slate-150 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-blue-600 dark:text-blue-400 text-lg">{formatCurrency(selectedOrder.total_price)}</span>
                </div>
              </div>

              {/* Order Progress Timeline */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-500">Order Timeline</h4>
                
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-5 ml-2.5 space-y-5">
                  {getTimelineSteps(selectedOrder).map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Indicator dot */}
                      <span className={`absolute -left-[27px] top-0.5 rounded-full p-0.5 border ${
                        step.isError 
                          ? "bg-rose-500 border-rose-500 text-white" 
                          : step.isCompleted 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-white dark:bg-[#1e293b] border-slate-300 dark:border-slate-700 text-slate-300"
                      }`}>
                        {step.isCompleted ? <CheckCircle2 size={10} className="fill-current text-white" /> : <Clock size={10} />}
                      </span>

                      {/* Info */}
                      <div className="space-y-0.5">
                        <p className={`font-semibold text-xs ${step.isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{step.desc}</p>
                        {step.date && (
                          <span className="text-[9px] text-slate-400 font-mono block mt-1">{formatDate(step.date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
              <button
                onClick={() => handleDownloadInvoice(selectedOrder)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FileText size={14} />
                <span>In Hóa đơn</span>
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-500/10"
              >
                Hoàn tất
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
