import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Download,
  Calendar,
  Filter,
  BarChart2,
  PieChart as PieChartIcon
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  fetchDashboardStats,
  fetchRevenueByDay,
  fetchRevenueByCategory
} from "../../services/dashboardService";
import { fetchOrders as fetchOrdersRequest } from "../../services/orderService";

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#ec4899"];

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("30days");
  const [revenueByDay, setRevenueByDay] = useState({ categories: [], data: [] });
  const [revenueByCategory, setRevenueByCategory] = useState({ labels: [], data: [] });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { timeFilter };

      const [statsRes, revDayRes, revCatRes, ordersRes] = await Promise.all([
        fetchDashboardStats(params),
        fetchRevenueByDay(params),
        fetchRevenueByCategory(params),
        fetchOrdersRequest()
      ]);

      const totalOrders = ordersRes.data.length;

      setStats({
        totalRevenue: statsRes.data.totalRevenue || 0,
        averageOrderValue: statsRes.data.averageOrderValue || 0,
        totalOrders
      });
      setRevenueByDay(revDayRes.data);
      setRevenueByCategory(revCatRes.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Formatters
  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(val);

  const handleExportReport = () => {
    // Generate CSV
    let csv = "Loai,Chi tiet,Doanh thu\n";
    revenueByCategory.labels?.forEach((lbl, idx) => {
      csv += `Danh muc,${lbl},${revenueByCategory.data[idx]}\n`;
    });
    revenueByDay.categories?.forEach((cat, idx) => {
      csv += `Theo ngay,${cat},${revenueByDay.data[idx]}\n`;
    });
    csv += `Tong quan,Tong doanh thu,${stats.totalRevenue}\n`;

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report_${timeFilter}_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất báo cáo thành công!");
  };

  const areaChartData = revenueByDay.categories?.map((c, i) => ({
    name: c,
    DoanhThu: revenueByDay.data[i] || 0
  })) || [];

  const pieChartData = revenueByCategory.labels?.map((l, i) => ({
    name: l,
    value: revenueByCategory.data[i] || 0
  })).filter(x => x.value > 0) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Báo cáo & Phân tích</h1>
          <p className="text-xs text-slate-500">Phân tích chuyên sâu về doanh thu và hiệu suất kinh doanh</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="7days">7 Ngày qua</option>
            <option value="30days">30 Ngày qua</option>
            <option value="90days">90 Ngày qua</option>
            <option value="all">Toàn thời gian</option>
          </select>
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition"
          >
            <Download size={14} />
            <span>Xuất báo cáo (CSV)</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Tổng Doanh Thu", value: formatCurrency(stats.totalRevenue), icon: TrendingUp },
          { label: "Trung bình mỗi đơn", value: formatCurrency(stats.averageOrderValue), icon: BarChart2 },
          { label: "Tổng số đơn", value: stats.totalOrders, icon: Calendar }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
              <item.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Over Time Area Chart */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xu hướng Doanh thu</h3>
          </div>
          <div className="h-72 w-full text-xs">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
            ) : areaChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "11px" }}
                    formatter={(val) => [formatCurrency(val), "Doanh thu"]}
                  />
                  <Area type="monotone" dataKey="DoanhThu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue by Category Bar Chart */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Doanh thu theo Danh mục</h3>
          </div>
          <div className="h-72 w-full text-xs">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
            ) : pieChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000000 ? `${val/1000000}M` : val} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "#0f172a", color: "#fff", fontSize: "11px" }}
                    formatter={(val) => [formatCurrency(val), "Doanh thu"]}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
