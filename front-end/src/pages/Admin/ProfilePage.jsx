import { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Save, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { updateProfile as updateProfileRequest } from "../../services/userService";

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({
        ...parsed,
        avatar: convertBase64ToImage(parsed.avatar),
      });
      setPreview(convertBase64ToImage(parsed.avatar));
    }
  }, []);

  const convertBase64ToImage = (value) => {
    if (!value) return "https://ui-avatars.com/api/?name=Admin&background=random";
    if (value.startsWith("data:image")) return value;
    if (value.startsWith("/") || value.startsWith("http")) return value;
    return `data:image/jpeg;base64,${value}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleChange = (field) => (e) => {
    setUser((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let avatarData = user.avatar;

      if (selectedFile) {
        const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
        const base64Str = await toBase64(selectedFile);
        avatarData = base64Str.split(",")[1];
      }

      const updateData = {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        ...(selectedFile && { avatar: avatarData }),
      };

      const res = await updateProfileRequest(updateData);
      const updatedUser = res.data;
      updatedUser.avatar = convertBase64ToImage(updatedUser.avatar);
      
      setUser(updatedUser);
      setPreview(updatedUser.avatar);
      
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({
        ...storedUser,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      }));

      toast.success("Cập nhật hồ sơ thành công!");
      
      // Dispatch event to update Header avatar
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hồ sơ cá nhân</h1>
          <p className="text-xs text-slate-500">Quản lý thông tin tài khoản quản trị</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs text-center flex flex-col items-center">
            <div className="relative group mb-4">
              <img 
                src={preview || user.avatar || "https://ui-avatars.com/api/?name=Admin"} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-sm"
              />
              <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg ring-4 ring-white dark:ring-[#1e293b]">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.fullName || "Admin"}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 dark:border-blue-800">
              <Shield size={12} className="mr-1" />
              Quản trị viên
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Thông tin chi tiết</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Họ và tên</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={user.fullName}
                      onChange={handleChange("fullName")}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:bg-white dark:focus:bg-[#1e293b] focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={user.phone}
                      onChange={handleChange("phone")}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:bg-white dark:focus:bg-[#1e293b] focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Địa chỉ Email (Đọc cẩn)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white shadow-xs transition"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{isLoading ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
