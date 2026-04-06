import { useState, useEffect, useCallback } from "react";
import { Settings as SettingsIcon, AlertCircle, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavigation from "../components/TopNavigation";
import LoadingSpinner from "../components/LoadingSpinner";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // trạng thái cài đặt
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    timezone: "UTC",
    emailNotifications: false,
    maintenanceMode: false,
  });

  // Fetch current user
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
        fullName: "",
        email: "",
        avatar: "",
      });
    }
  }, []);

  // fetch settings từ server
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("api/settings");
      setSettings(response.data);
      setError(null);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setError("Failed to load settings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchSettings();
  }, [fetchCurrentUser, fetchSettings]);

  // change
  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  
  // save
  const handleSaveSettings = async () => {
    try {
      await axiosInstance.put("api/settings", settings);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.error("Failed to save settings");
    }
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
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Cài đặt
                </h2>
                <p className="text-gray-600 dark:text-gray-600 mt-1">
                  Cấu hình cài đặt hệ thống
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center shadow-sm transition-colors mt-4 md:mt-0"
              >
                <Save size={18} className="mr-2" />
                Lưu cài đặt
              </button>
            </div>

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
                    onClick={fetchSettings}
                    className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 cursor-pointer transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  {/* General Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-600 mb-4">
                      Cài đặt chung
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-500">
                          Bật thông báo
                        </label>
                        <input
                          type="checkbox"
                          checked={settings.notificationsEnabled}
                          onChange={(e) =>
                            handleSettingsChange(
                              "notificationsEnabled",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-500">
                          Thông báo qua Email
                        </label>
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) =>
                            handleSettingsChange(
                              "emailNotifications",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-gray-700 dark:text-gray-500">
                          Chế độ bảo trì
                        </label>
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) =>
                            handleSettingsChange(
                              "maintenanceMode",
                              e.target.checked
                            )
                          }
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timezone Settings */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-600 mb-4">
                      Múi giờ
                    </h3>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSettingsChange("timezone", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</option>
                      <option value="America/New_York">America/New York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>

                  {/* Additional Settings (có thể mở  rộng) */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-600 mb-4">
                      Cài đặt nâng cao
                    </h3>
                    <p className="text-gray-600 dark:text-gray-500">
                      Đang phát triển thêm...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
