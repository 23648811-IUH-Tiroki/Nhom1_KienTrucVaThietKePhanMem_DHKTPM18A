import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Boxes,
  Receipt,
  Users,
  TrendingUp,
  Settings,
  User,
  Lock,
  LogOut,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "react-toastify";
import { signOut } from "../services/authService";
import { fetchUserById as fetchUserByIdRequest } from "../services/userService";
import { fetchNotifications } from "../services/dashboardService";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("adminSidebarCollapsed") === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Fetch current user details
  const fetchCurrentUser = useCallback(async () => {
    try {
      const userLocal = JSON.parse(localStorage.getItem("user"));
      if (!userLocal || !userLocal._id) {
        navigate("/login");
        return;
      }
      const response = await fetchUserByIdRequest(userLocal._id);
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch admin user profile:", err.message);
      // fallback to local storage values if API fails
      const userLocal = JSON.parse(localStorage.getItem("user"));
      if (userLocal) {
        setCurrentUser({
          fullName: userLocal.fullName || "Admin User",
          email: userLocal.email || "admin@petstation.com",
          avatar: userLocal.avatar || "",
          role: userLocal.role || "admin"
        });
      }
    }
  }, [navigate]);

  // Fetch alerts & notifications
  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchNotifications({ limit: 5 });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    loadNotifications();

    // Poll notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchCurrentUser, loadNotifications]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync dark theme class on document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      document.documentElement.classList.add("dark");
    } else {
      document.body.classList.remove("dark-theme");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("adminSidebarCollapsed", next);
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Đăng xuất quản trị viên thành công!");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout Error:", err);
      // still clear and navigate on failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      toast.success("Đăng xuất thành công!");
      navigate("/");
    }
  };

  const convertBase64ToImage = (base64) => {
    if (!base64) return "/avatar.png";
    if (base64.startsWith("data:image")) return base64;
    return `data:image/jpeg;base64,${base64}`;
  };

  // Menu items config
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/products", label: "Sản phẩm", icon: ShoppingBag },
    { path: "/admin/categories", label: "Danh mục", icon: Layers },
    { path: "/admin/inventory", label: "Kho hàng", icon: Boxes },
    { path: "/admin/orders", label: "Đơn hàng", icon: Receipt },
    { path: "/admin/users", label: "Người dùng", icon: Users },
    { path: "/admin/reports", label: "Báo cáo", icon: TrendingUp },
    { path: "/admin/settings", label: "Cài đặt", icon: Settings },
  ];

  // Dynamic Breadcrumb computation
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter(x => x);
    const breadcrumbs = [];
    
    // Breadcrumbs translation helper
    const translations = {
      admin: "Admin",
      dashboard: "Dashboard",
      products: "Sản phẩm",
      new: "Thêm mới",
      edit: "Chỉnh sửa",
      categories: "Danh mục",
      orders: "Đơn hàng",
      users: "Người dùng",
      inventory: "Kho hàng",
      reports: "Báo cáo",
      settings: "Cài đặt",
      profile: "Thông tin cá nhân"
    };

    let currentPath = "";
    pathnames.forEach((name, index) => {
      // Skip the 'admin' keyword since we always prefix with Dashboard
      if (name === "admin") return;
      
      currentPath += `/admin/${name}`;
      
      let label = translations[name] || name;
      
      // If it looks like an ID, display a generic label
      if (name.length === 24 && /^[0-9a-fA-F]+$/.test(name)) {
        label = "Chi tiết";
      }

      breadcrumbs.push({
        label,
        path: index === pathnames.length - 1 ? null : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect based on query type or generic product search
      navigate(`/admin/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden md:flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          {!sidebarCollapsed ? (
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400 truncate">
              <span>🐾 Pet Station Admin</span>
            </Link>
          ) : (
            <div className="w-full flex justify-center text-xl">
              <span title="Pet Station Admin">🐾</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto admin-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all-200 group ${
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={18} className={`shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200"}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Theme & User Info */}
        {!sidebarCollapsed && currentUser && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={convertBase64ToImage(currentUser.avatar)} 
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(prev => !prev)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun size={14} className="text-amber-500" />
                  <span>Chế độ sáng</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-slate-600" />
                  <span>Chế độ tối</span>
                </>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Sidebar - Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-xs bg-white dark:bg-[#1e293b] h-full flex flex-col p-4 shadow-xl z-10 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">🐾 Pet Station Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <ChevronLeft size={18} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {currentUser && (
              <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={convertBase64ToImage(currentUser.avatar)} 
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsDarkMode(prev => !prev)}
                    className="flex-1 flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
                  >
                    <LogOut size={16} className="mr-1" />
                    Thoát
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#1e293b] border-b border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-40">
          
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 md:hidden rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Global Search */}
            <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center relative">
              <Search size={16} className="absolute left-3 text-slate-400" />
              <input 
                type="text"
                placeholder="Tìm kiếm hệ thống..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 h-9 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode toggle - Quick desktop access */}
            <button 
              onClick={() => setIsDarkMode(prev => !prev)}
              className="hidden md:flex p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              title="Chuyển đổi giao diện"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Public website quick link */}
            <Link 
              to="/" 
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <Home size={14} />
              <span>Xem Cửa hàng</span>
            </Link>

            {/* Notifications Panel */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e293b] rounded-2xl shadow-admin-card border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Thông báo mới nhất</span>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                      {notifications.length} cảnh báo
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto admin-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Không có thông báo mới nào
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100/50 dark:border-slate-800/50 flex gap-3 text-xs">
                          <div className="mt-0.5">
                            {n.type === "stock" && <AlertTriangle size={15} className="text-rose-500" />}
                            {n.type === "order" && <CheckCircle size={15} className="text-emerald-500" />}
                            {!["stock", "order"].includes(n.type) && <Info size={15} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-300">{n.message}</p>
                            <span className="text-[10px] text-slate-400">{new Date(n.date).toLocaleTimeString("vi-VN", {hour: "2-digit", minute:"2-digit"})} - {new Date(n.date).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown */}
            {currentUser && (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <img 
                    src={convertBase64ToImage(currentUser.avatar)} 
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/10"
                  />
                  <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] rounded-2xl shadow-admin-card border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <Link 
                        to="/admin/profile?tab=profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <User size={14} className="text-slate-400" />
                        <span>Thông tin cá nhân</span>
                      </Link>
                      <Link 
                        to="/admin/profile?tab=password"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <Lock size={14} className="text-slate-400" />
                        <span>Đổi mật khẩu</span>
                      </Link>
                      <Link 
                        to="/admin/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                      >
                        <Settings size={14} className="text-slate-400" />
                        <span>Cài đặt</span>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 p-1">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                      >
                        <LogOut size={14} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </header>

        {/* Dynamic Breadcrumbs & Action Area */}
        <div className="px-6 py-4 bg-white dark:bg-[#1e293b]/50 border-b border-slate-100 dark:border-slate-800 flex items-center">
          <nav className="flex text-xs font-medium text-slate-500 dark:text-slate-400">
            <ol className="inline-flex items-center space-x-1.5">
              <li className="inline-flex items-center">
                <Link to="/admin/dashboard" className="hover:text-blue-600 transition flex items-center gap-1">
                  <span>Dashboard</span>
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-blue-600 transition truncate max-w-[120px] sm:max-w-[200px]">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px] sm:max-w-[200px]">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Outlet for Sub Route rendering */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] dark:bg-[#0f172a] admin-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
