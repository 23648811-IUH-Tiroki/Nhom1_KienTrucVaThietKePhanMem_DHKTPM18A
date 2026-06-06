import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  getUsers, 
  blockUser, 
  unblockUser, 
  updateUserRole 
} from "../../stores/userAdminSlice";
import { 
  Users, 
  UserPlus, 
  Download, 
  Search, 
  MoreHorizontal, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Trash2, 
  Pencil, 
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Shield
} from "lucide-react";
import { toast } from "react-toastify";
import { deleteUser as deleteUserRequest, fetchUserById as fetchUserByIdRequest } from "../../services/userService";

const UsersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, total, page, totalPages } = useSelector((s) => s.userAdmin || { users: [], loading: false, total: 0, page: 1, totalPages: 1 });
  
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Client stats calculation based on fetched lists
  const [activeCount, setActiveCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  const dropdownRef = useRef(null);

  const fetchList = useCallback((q = {}) => {
    dispatch(getUsers({ 
      page: currentPage, 
      limit: 10, 
      search: q.search ?? search, 
      role, 
      status: q.status ?? status 
    }));
  }, [currentPage, role, status, search, dispatch]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Sync click outside for dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute local counts from total if available
  useEffect(() => {
    if (users && users.length) {
      const active = users.filter(u => !u.isBlocked).length;
      const blocked = users.filter(u => u.isBlocked).length;
      setActiveCount(active);
      setBlockedCount(blocked);
    }
  }, [users]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchList({ search });
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn khóa tài khoản này?")) return;
    const res = await dispatch(blockUser(id));
    if (res.error) {
      toast.error(res.payload?.message || res.error.message);
    } else {
      toast.success("Đã khóa tài khoản thành công");
      fetchList();
    }
    setActiveDropdown(null);
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Mở khóa tài khoản này?")) return;
    const res = await dispatch(unblockUser(id));
    if (res.error) {
      toast.error(res.payload?.message || res.error.message);
    } else {
      toast.success("Đã mở khóa tài khoản thành công");
      fetchList();
    }
    setActiveDropdown(null);
  };

  const handleChangeRolePrompt = async (u) => {
    const newRole = prompt(`Nhập role mới cho ${u.fullName} (user/staff). Chỉ superadmin mới có thể gán admin:`, u.role);
    if (!newRole) return;
    const trimmed = newRole.trim().toLowerCase();
    if (!["user", "staff", "admin"].includes(trimmed)) {
      toast.error("Vai trò không hợp lệ! Vui lòng nhập user hoặc staff.");
      return;
    }
    const res = await dispatch(updateUserRole({ id: u._id, role: trimmed }));
    if (res.error) {
      toast.error(res.payload?.message || res.error.message);
    } else {
      toast.success(`Đã cập nhật vai trò thành công: ${trimmed}`);
      fetchList();
    }
    setActiveDropdown(null);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn XÓA VĨNH VIỄN tài khoản người dùng này?")) return;
    try {
      await deleteUserRequest(id);
      toast.success("Đã xóa tài khoản người dùng thành công");
      fetchList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể xóa người dùng này");
    } finally {
      setActiveDropdown(null);
    }
  };

  const handleExportCSV = () => {
    if (!users || users.length === 0) return;
    const csvContent = [
      ["Ho ten", "Email", "Phone", "Vai tro", "Trang thai"],
      ...users.map(u => [
        u.fullName.replace(/,/g, ""),
        u.email,
        u.phone || "-",
        u.role,
        u.isBlocked ? "Blocked" : "Active"
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users_list_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất danh sách người dùng thành công!");
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900",
      staff: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
      user: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800"
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${map[role] || map.user}`}>
        {role === "user" ? "Khách hàng" : role === "staff" ? "Nhân viên" : "Quản trị"}
      </span>
    );
  };

  const getStatusBadge = (isBlocked) => {
    return isBlocked ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900">
        Khóa
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900">
        Hoạt động
      </span>
    );
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Người dùng</h1>
          <p className="text-xs text-slate-500">Giám sát tài khoản khách hàng, nhân viên và phân quyền hệ thống</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          
          <button 
            onClick={() => navigate("/admin/users/new")}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <UserPlus size={14} />
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tổng người dùng", value: total || 0, icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" },
          { label: "Đang hoạt động (Trang này)", value: activeCount, icon: UserCheck, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Bị khóa (Trang này)", value: blockedCount, icon: UserX, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20" }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{card.label}</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${card.color}`}>
              <card.icon size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          
          {/* Search bar */}
          <div className="w-full sm:flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm theo tên hoặc địa chỉ email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
          </div>

          {/* Selector options */}
          <div className="w-full sm:w-auto flex gap-2">
            <select 
              value={role} 
              onChange={(e) => { setRole(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả Vai trò</option>
              <option value="user">Khách hàng</option>
              <option value="staff">Nhân viên</option>
              <option value="admin">Quản trị viên</option>
            </select>

            <select 
              value={status} 
              onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Đã khóa</option>
            </select>

            <button 
              type="submit" 
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shrink-0"
            >
              Tìm kiếm
            </button>
          </div>

        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3">
            <RefreshCw size={24} className="text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Đang tải danh sách tài khoản...</span>
          </div>
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-semibold h-11">
                  <th className="px-6 w-56">Người dùng</th>
                  <th className="px-4">Địa chỉ Email</th>
                  <th className="px-4">Điện thoại</th>
                  <th className="px-4">Vai trò</th>
                  <th className="px-4">Trạng thái</th>
                  <th className="px-4">Ngày tham gia</th>
                  <th className="px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy tài khoản người dùng nào khớp bộ lọc
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors h-14">
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar || "/avatar.png"} 
                            alt={u.fullName} 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                            onError={(e) => { e.target.src = "/avatar.png"; }}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate max-w-[120px]">{u.fullName}</span>
                            <span className="text-[9px] font-mono text-slate-400">ID: #{u._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px]" title={u.email}>{u.email}</td>
                      <td className="px-4 text-slate-500">{u.phone || "-"}</td>
                      <td className="px-4">{getRoleBadge(u.role)}</td>
                      <td className="px-4">{getStatusBadge(u.isBlocked)}</td>
                      <td className="px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                      
                      <td className="px-6 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === u._id ? null : u._id);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {activeDropdown === u._id && (
                          <div 
                            ref={dropdownRef}
                            className="absolute right-6 mt-1 w-44 bg-white dark:bg-[#1e293b] rounded-xl shadow-admin-card border border-slate-100 dark:border-slate-800 py-1.5 z-45 text-left animate-fade-in"
                          >
                            <button 
                              onClick={() => {
                                setActiveDropdown(null);
                                navigate(`/admin/users/${u._id}/edit`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Pencil size={13} className="text-slate-400" />
                              <span>Sửa tài khoản</span>
                            </button>

                            <button 
                              onClick={() => handleChangeRolePrompt(u)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Shield size={13} className="text-slate-400" />
                              <span>Thay đổi vai trò</span>
                            </button>

                            {u.isBlocked ? (
                              <button 
                                onClick={() => handleUnblock(u._id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer font-medium"
                              >
                                <Unlock size={13} />
                                <span>Mở khóa tài khoản</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleBlock(u._id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer font-medium"
                              >
                                <Lock size={13} />
                                <span>Khóa tài khoản</span>
                              </button>
                            )}

                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer font-medium"
                            >
                              <Trash2 size={13} />
                              <span>Xóa vĩnh viễn</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Trang {currentPage} / {totalPages} (Tổng số {total} người dùng)</span>
            
            <div className="flex gap-2">
              <button 
                disabled={currentPage <= 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold"
              >
                Trước
              </button>
              <button 
                disabled={currentPage >= totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer font-bold"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UsersPage;
