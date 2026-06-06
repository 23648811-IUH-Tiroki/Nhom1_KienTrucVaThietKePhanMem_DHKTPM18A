import { useState, useEffect, useCallback } from "react";
import { Settings as SettingsIcon, Save, Bell, Globe, Shield, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { fetchSettings as fetchSettingsRequest, updateSettings as updateSettingsRequest } from "../../services/settingService";

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    timezone: "UTC",
    emailNotifications: false,
    maintenanceMode: false,
  });

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchSettingsRequest();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Không thể tải cài đặt");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettingsRequest(settings);
      toast.success("Cập nhật cài đặt thành công!");
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Lưu cài đặt thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt Hệ thống</h1>
          <p className="text-xs text-slate-500">Quản lý cấu hình chung cho website</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
        >
          <Save size={16} />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="space-y-6">
        
        {/* General Settings */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Cấu hình chung</h2>
              <p className="text-xs text-slate-500">Quản lý múi giờ và các thiết lập cơ bản</p>
            </div>
          </div>

          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Múi giờ hệ thống
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:bg-white dark:focus:bg-[#1e293b] focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</option>
                <option value="America/New_York">America/New York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Thông báo</h2>
              <p className="text-xs text-slate-500">Quản lý cách hệ thống gửi cảnh báo</p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Thông báo In-app</h4>
                <p className="text-xs text-slate-500">Bật/tắt thông báo trên giao diện web</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleChange("notificationsEnabled", e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Email Alerts</h4>
                <p className="text-xs text-slate-500">Gửi báo cáo và cảnh báo quan trọng qua email</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-rose-100 dark:border-rose-900/30 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900 dark:text-rose-400">Bảo mật & Bảo trì</h2>
              <p className="text-xs text-rose-500/80 dark:text-rose-400/80">Khu vực nguy hiểm, cẩn thận khi thay đổi</p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl">
            <label className="flex items-center justify-between p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer transition">
              <div>
                <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>Chế độ bảo trì</span>
                </h4>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">Đóng website với người dùng, chỉ admin mới truy cập được</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                />
                <div className="w-11 h-6 bg-rose-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-rose-900/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-rose-600 peer-checked:bg-rose-600"></div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
