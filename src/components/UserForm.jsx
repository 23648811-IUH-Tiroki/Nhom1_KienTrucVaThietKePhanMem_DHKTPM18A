import { useState, useEffect } from "react";
import FormField from "./FormField";

const UserForm = ({ userData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    userData || {
      fullName: "",
      birthDate: "",
      gender: "Nam",
      email: "",
      phone: "",
      address: "",
      avatar: "",
    }
  );

  const [avatarPreview, setAvatarPreview] = useState("");

  // Hàm chuyển đổi ngày sang định dạng YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Nếu không phải ngày hợp lệ
    return date.toISOString().split("T")[0]; // Trả về YYYY-MM-DD
  };

  // Cập nhật preview và formData khi userData thay đổi (chỉ khi edit)
  useEffect(() => {
    if (userData) {
      const convertedImage = convertBase64ToImage(userData.avatar);
      setAvatarPreview(convertedImage);
      setFormData({
        ...userData,
        birthDate: formatDateForInput(userData.birthDate), // Chuẩn hóa ngày
      });
    } else {
      setAvatarPreview(""); // Không hiển thị ảnh khi add user
      setFormData({
        fullName: "",
        birthDate: "",
        gender: "Nam",
        email: "",
        phone: "",
        address: "",
        avatar: "",
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Hàm chuyển đổi Base64 sang định dạng ảnh
  const convertBase64ToImage = (base64) => {
    if (!base64) return "/avatar.png"; // Ảnh mặc định nếu không có Base64
    return base64.startsWith("data:image")
      ? base64
      : `data:image/jpeg;base64,${base64}`; // Giả định JPEG nếu chưa có tiền tố
  };

  // Xử lý chọn ảnh mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, avatar: base64String });
        setAvatarPreview(base64String); // Hiển thị ảnh mới chọn
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện
          </label>
          <div className="flex items-center space-x-6">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full object-cover" // Tăng kích thước lên 128px
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                Chưa có ảnh
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <FormField
          label="Họ và tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
        />

        {/* Date Picker cho birthDate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày sinh
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <FormField
          label="Giới tính"
          name="gender"
          type="select"
          value={formData.gender}
          onChange={handleInputChange}
          options={[
            { value: "Nam", label: "Nam" },
            { value: "Nữ", label: "Nữ" },
          ]}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
        />

        <FormField
          label="Số điện thoại"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />

        <FormField
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 font-medium transition-colors cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm cursor-pointer"
        >
          {userData ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
