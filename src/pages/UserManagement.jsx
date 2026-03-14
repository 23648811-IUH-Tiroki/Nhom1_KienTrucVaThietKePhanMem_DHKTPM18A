import { useState, useEffect, useCallback } from "react";
import { UserPlus, AlertCircle, Download } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavigation from "../components/TopNavigation";
import UserTable from "../components/UserTable";
import UserDetailView from "../components/UserDetailView";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import axiosInstance from "../utils/axiosInstance";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchAndFilter from "../components/SearchAndFilter";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const ITEMS_PER_PAGE = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("list");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

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

  const fetchUsers = useCallback(async () => {
    if (searchTerm || statusFilter !== "all" || roleFilter !== "all") return;
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("api/users/paginated", {
        params: { page: currentPage, limit: ITEMS_PER_PAGE },
      });
      const usersData = Array.isArray(response.data.users)
        ? response.data.users
        : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setTotalPages(Math.ceil((response.data.total || 0) / ITEMS_PER_PAGE));

      setStats({
        total: response.data.total || usersData.length,
        active: usersData.filter((user) => user.status === "Active").length,
        inactive: usersData.filter((user) => user.status === "Inactive").length,
      });

      setError(null);
      setIsSearching(false);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError("Failed to load users. Please try again later.");
      setUsers([]);
      setFilteredUsers([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  const searchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchTerm) params.searchTerm = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter; 
      if (roleFilter !== "all") params.role = roleFilter;

      const response = await axiosInstance.get("api/users/search", { params });
      const usersData = Array.isArray(response.data.users)
        ? response.data.users
        : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setTotalPages(1); 
      setCurrentPage(1);

      setStats({
        total: usersData.length,
        active: usersData.filter((user) => user.status === "Active").length,
        inactive: usersData.filter((user) => user.status === "Inactive").length,
      });

      setError(null);
      setIsSearching(true);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError("Failed to load search results. Please try again later.");
      setUsers([]);
      setFilteredUsers([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, roleFilter]);

  const exportUsersToCSV = () => {
    const csvContent = [
      ["Full Name", "Email", "Phone", "Status"],
      ...users.map((user) => [
        user.fullName,
        user.email,
        user.phone,
        user.status || "Active",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (searchTerm || statusFilter !== "all" || roleFilter !== "all") {
      searchUsers();
    } else {
      fetchUsers();
    }
  }, [currentPage, searchTerm, statusFilter, roleFilter, fetchUsers, searchUsers]);

  const handleFormSubmit = async (formData) => {
    try {
      if (!formData.fullName || !formData.email || !formData.phone) {
        throw new Error("Please fill in all required fields");
      }
      let response;
      if (selectedUser) {
        response = await axiosInstance.put(
          `api/users/${selectedUser._id}`,
          formData
        );
        toast.success("User updated successfully");
        if (selectedUser._id === currentUser?._id) await fetchCurrentUser();
      } else {
        response = await axiosInstance.post("api/users", formData);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      setSelectedUser(null);
      if (searchTerm || statusFilter !== "all" || roleFilter !== "all") {
        await searchUsers();
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`api/users/${selectedUser._id}`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      if (currentView === "detail") setCurrentView("list");
      toast.success("User deleted successfully");
      if (searchTerm || statusFilter !== "all" || roleFilter !== "all") {
        await searchUsers();
      } else {
        const totalUsers = await axiosInstance
          .get("api/users/paginated", {
            params: { page: 1, limit: ITEMS_PER_PAGE },
          })
          .then((res) => res.data.total);
        const newTotalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0)
          setCurrentPage(newTotalPages);
        await fetchUsers();
      }
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error("Failed to delete user");
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setCurrentView("detail");
  };

  const addNewUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !isSearching)
      setCurrentPage(newPage);
  };

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <div className="max-w-7xl mx-auto">
            {currentView === "list" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg shadow-sm card bg-white dark:bg-gray-800">
                  <p className="text-gray-800 dark:text-gray-800">
                    Tổng Người Dùng
                  </p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <div className="p-4 rounded-lg shadow-sm card bg-white dark:bg-gray-800">
                  <p className="text-gray-800 dark:text-gray-800">
                    Người Dùng Hoạt Động
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.active}
                  </p>
                </div>
                <div className="p-4 rounded-lg shadow-sm card bg-white dark:bg-gray-800">
                  <p className="text-gray-800 dark:text-gray-800">
                    Người Dùng Không Hoạt Động
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {currentView === "list"
                    ? "Danh sách người dùng"
                    : "Chi tiết người dùng"}
                </h2>
                <p className="text-gray-600 dark:text-gray-600 mt-1">
                  {currentView === "list"
                    ? "Quản lý tất cả người dùng hệ thống"
                    : "Xem và chỉnh sửa thông tin chi tiết của người dùng"}
                </p>
              </div>
              {currentView === "list" && (
                <div className="flex space-x-3 mt-4 md:mt-0">
                  {/* <button
                    onClick={addNewUser}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center shadow-sm transition-colors cursor-pointer"
                  >
                    <UserPlus size={18} className="mr-2" />
                    Thêm người dùng
                  </button> */}
                  <button
                    onClick={exportUsersToCSV}
                    className="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center shadow-sm transition-colors cursor-pointer"
                  >
                    <Download size={18} className="mr-2" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
            {currentView === "list" && (
              <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resetFilters={resetFilters}
              />
            )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <LoadingSpinner size="large" />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-600 dark:text-red-400 flex flex-col items-center">
                  <AlertCircle size={24} className="mb-2" />
                  {error}
                  <button
                    onClick={() =>
                      searchTerm ||
                      statusFilter !== "all" ||
                      roleFilter !== "all"
                        ? searchUsers()
                        : fetchUsers()
                    }
                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
                  >
                    Thử lại
                  </button>
                </div>
              ) : currentView === "list" ? (
                <>
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-lg font-medium text-gray-800 dark:text-gray-700">
                      {filteredUsers.length >= 0
                        ? `${filteredUsers.length} ${
                            filteredUsers.length === 1
                              ? "người dùng"
                              : "người dùng"
                          } được tìm thấy`
                        : "Đang tải danh sách người dùng..."}
                    </div>
                    {!isSearching && (
                      <div className="text-sm text-gray-400 dark:text-gray-700">
                        Trang {currentPage} / {totalPages}
                      </div>
                    )}
                  </div>
                  {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                      <img
                        src="/empty-state.svg"
                        alt="No users found"
                        className="mx-auto h-40 mb-4"
                      />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
                        Không tìm thấy người dùng
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
                      </p>
                      <button
                        onClick={addNewUser}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <UserPlus size={18} className="mr-2" />
                        Thêm người dùng
                      </button>
                    </div>
                  ) : (
                    <>
                      <UserTable
                        users={filteredUsers}
                        onView={viewUserDetails}
                        onEdit={(user) => {
                          setSelectedUser(user);
                          setIsModalOpen(true);
                        }}
                        onDelete={(user) => {
                          setSelectedUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                      />
                      {!isSearching && totalPages > 1 && (
                        <div className="p-4 flex justify-center items-center gap-4">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 cursor-pointer"
                          >
                            Trước
                          </button>
                          <div className="flex gap-2">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded-lg ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white dark:bg-blue-700"
                                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 cursor-pointer"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 cursor-pointer"
                          >
                            Tiếp
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <UserDetailView
                  user={selectedUser}
                  onBack={() => setCurrentView("list")}
                  onEdit={(user) => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                  onDelete={(user) => {
                    setSelectedUser(user);
                    setIsDeleteModalOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? "Edit User" : "Add New User"}
        size="lg"
      >
        <UserForm
          userData={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        selectedUser={selectedUser}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UserManagement;