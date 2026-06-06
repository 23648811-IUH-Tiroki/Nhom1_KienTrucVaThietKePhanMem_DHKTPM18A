import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  Receipt,
  Download,
  Upload,
  ArrowRight,
  Package,
  ShoppingCart,
  Bell,
  RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchNotifications,
  fetchRevenueByDay,
  fetchRevenueByCategory,
  importOrders as importOrdersRequest
} from "../../services/dashboardService";
import { fetchUsersPaginated as fetchUsersPaginatedRequest } from "../../services/userService";
import { fetchProducts as fetchProductsRequest } from "../../services/productService";
import { fetchOrders as fetchOrdersRequest } from "../../services/orderService";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#ec4899"];

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    activeUsers: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState({ categories: [], data: [] });
  const [revenueByCategory, setRevenueByCategory] = useState({ labels: [], data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("7days");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { timeFilter };

      const [
        statsResponse,
        ordersResponse,
        notificationsResponse,
        revenueByDayResponse,
        revenueByCategoryResponse,
        usersResponse,
        productsResponse
      ] = await Promise.all([
        fetchDashboardStats(params),
        fetchRecentOrders({ limit: 5 }),
        fetchNotifications(params),
        fetchRevenueByDay(params),
        fetchRevenueByCategory(params),
        fetchUsersPaginatedRequest({ page: 1, limit: 1 }),
        fetchProductsRequest()
      ]);

      const totalOrders = await fetchOrdersRequest().then((res) => res.data.length);
      const activeUsers = usersResponse.data.users.filter(
        (user) => user.status === "Active"
      ).length;
      const lowStockProducts = productsResponse.data.filter(
        (product) => product.stock <= 10
      ).length;

      setStats({
        ...statsResponse.data,
        totalOrders,
        activeUsers,
        lowStockProducts
      });
      setRecentOrders(ordersResponse.data);
      setNotifications(notificationsResponse.data);
      setRevenueByDay(revenueByDayResponse.data);
      setRevenueByCategory(revenueByCategoryResponse.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err.message);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success("Dữ liệu đã được cập nhật!");
  };

  // CSV Export
  const handleExportStats = () => {
    const csvContent = [
      ["Chi so", "Gia tri"],
      ["Tong doanh thu", stats.totalRevenue],
      ["Doanh thu thang", stats.monthlyRevenue],
      ["Doanh thu tuan", stats.weeklyRevenue],
      ["Gia tri don hang trung binh", stats.averageOrderValue],
      ["Tong so don hang", stats.totalOrders],
      ["Nguoi dung hoat dong", stats.activeUsers],
      ["San pham sap het hang", stats.lowStockProducts]
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_stats_${timeFilter}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất báo cáo thành công");
  };

  // CSV Import
  const handleImportOrders = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await importOrdersRequest(formData);
      toast.success("Nhập đơn hàng từ CSV thành công!");
      fetchDashboardData();
    } catch (err) {
      toast.error("Nhập đơn hàng thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  // Formatter utilities
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0
    }).format(value);
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

  // Get order status style
  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      processing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
      shipping: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
        {status}
      </span>
    );
  };

  // Recharts AreaChart Data Adapter
  const getAreaChartData = () => {
    if (!revenueByDay.categories || !revenueByDay.data) return [];
    return revenueByDay.categories.map((cat, idx) => ({
      name: cat,
      "Doanh thu": revenueByDay.data[idx] || 0
    }));
  };

  const areaChartData = getAreaChartData();

  // Recharts DonutChart Data Adapter
  const getPieChartData = () => {
    if (!revenueByCategory.labels || !revenueByCategory.data) return [];
    return revenueByCategory.labels.map((label, idx) => ({
      name: label,
      value: revenueByCategory.data[idx] || 0
    })).filter(item => item.value > 0);
  };

  const pieChartData = getPieChartData();

  // Skeleton Loaders
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse" />
          <div className="h-[400px] bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tổng quan Dashboard</h1>
          <p className="text-xs text-slate-500">Giám sát và phân tích tình hình kinh doanh thời gian thực</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Tabs */}
          <div className="flex items-center bg-white dark:bg-[#1e293b] p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
            {[
              { key: "7days", label: "7 Ngày" },
              { key: "30days", label: "30 Ngày" },
              { key: "90days", label: "90 Ngày" },
              { key: "all", label: "Tất cả" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimeFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  timeFilter === tab.key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          {/* Import/Export CSV actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExportStats}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Xuất Báo cáo</span>
            </button>
            <label className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer">
              <Upload size={14} />
              <span>Nhập Đơn hàng</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportOrders}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Tổng Doanh Thu",
            value: formatCurrency(stats.totalRevenue),
            desc: "Tổng doanh thu tích lũy",
            icon: DollarSign,
            color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
          },
          {
            label: "Doanh Thu Tháng",
            value: formatCurrency(stats.monthlyRevenue),
            desc: "Tổng doanh thu tháng này",
            icon: TrendingUp,
            color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
          },
          {
            label: "Đơn Hàng Thành Công",
            value: stats.totalOrders,
            desc: "Số lượng đơn hàng thực tế",
            icon: ShoppingBag,
            color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
          },
          {
            label: "Khách Hàng Hoạt Động",
            value: stats.activeUsers,
            desc: "Khách có hoạt động gần đây",
            icon: Users,
            color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20"
          },
          {
            label: "Sản phẩm sắp hết hàng",
            value: stats.lowStockProducts,
            desc: "Tồn kho dưới 10 đơn vị",
            icon: AlertTriangle,
            color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
          },
          {
            label: "Giá trị Đơn trung bình",
            value: formatCurrency(stats.averageOrderValue),
            desc: "Doanh thu trung bình mỗi đơn",
            icon: Receipt,
            color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
          }
        ].map((card, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between shadow-xs hover:shadow-admin-soft transition-all duration-300 group hover:-translate-y-0.5"
          >
            <div className="space-y-1.5 min-w-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{card.label}</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{card.value}</h3>
              <p className="text-[10px] text-slate-400 truncate">{card.desc}</p>
            </div>
            <div className={`p-3 rounded-2xl ${card.color} transition-transform group-hover:scale-110`}>
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xu hướng Doanh thu</h3>
              <p className="text-[10px] text-slate-400">Doanh số theo thời gian thực</p>
            </div>
          </div>
          <div className="h-80 w-full text-xs font-medium">
            {areaChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">Không có dữ liệu trong khoảng thời gian này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderRadius: "12px", 
                      border: "none", 
                      color: "#fff", 
                      fontSize: "11px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                    }}
                    formatter={(val) => [formatCurrency(val), "Doanh thu"]}
                  />
                  <Area type="monotone" dataKey="Doanh thu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue by Category Pie Chart */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tỷ lệ theo Danh mục</h3>
            <p className="text-[10px] text-slate-400">Doanh thu phân bổ theo các chủng loại</p>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center text-xs">
            {pieChartData.length === 0 ? (
              <span className="text-slate-400">Chưa có dữ liệu danh mục</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderRadius: "12px", 
                      border: "none", 
                      color: "#fff", 
                      fontSize: "11px"
                    }}
                    formatter={(val) => [formatCurrency(val), "Doanh thu"]}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", color: "#64748b", pt: 10 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Layout: Recent Orders + Alert Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Đơn hàng mới nhận</h3>
              <p className="text-[10px] text-slate-400">Danh sách các giao dịch phát sinh gần đây</p>
            </div>
            <button 
              onClick={() => navigate("/admin/orders")} 
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Tất cả đơn hàng</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold h-9">
                  <th className="pb-2">Mã đơn</th>
                  <th className="pb-2">Khách hàng</th>
                  <th className="pb-2">Tổng tiền</th>
                  <th className="pb-2">Trạng thái</th>
                  <th className="pb-2">Ngày đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-slate-400">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="h-12 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="font-semibold text-slate-900 dark:text-white">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="font-medium">{order.customer || "Khách vãng lai"}</td>
                      <td className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(order.total)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-slate-500">{formatDate(order.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications and Alerts Feed */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cảnh báo hệ thống</h3>
            <p className="text-[10px] text-slate-400">Thông báo tự động về trạng thái kho và giao dịch</p>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto admin-scrollbar pr-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Không có cảnh báo mới</div>
            ) : (
              notifications.map((notif, index) => {
                const getIcon = () => {
                  switch (notif.type) {
                    case "stock":
                      return <Package size={14} className="text-rose-500" />;
                    case "order":
                      return <ShoppingCart size={14} className="text-blue-500" />;
                    case "user":
                      return <Users size={14} className="text-emerald-500" />;
                    default:
                      return <Bell size={14} className="text-slate-500" />;
                  }
                };
                
                return (
                  <div key={index} className="flex gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 text-xs">
                    <div className="mt-0.5 shrink-0">
                      <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                        {getIcon()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{formatDate(notif.date)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
