import { useEffect, useState } from "react";
import FormField from "./FormField";
import {
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE_MESSAGE,
  isValidGmailAddress,
  isValidPassword,
  isValidPhone,
  normalizeEmail,
} from "../utils/validation";

const UserForm = ({
  userData,
  onSubmit,
  onCancel,
  submitting = false,
  apiErrors = {},
}) => {
  const [formData, setFormData] = useState(
    userData || {
      fullName: "",
      birthDate: "",
      gender: "Nam",
      email: "",
      phone: "",
      address: "",
      avatar: "",
      password: "",
      confirmPassword: "",
    }
  );

  const [avatarPreview, setAvatarPreview] = useState("");
  const [errors, setErrors] = useState({});

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const convertBase64ToImage = (base64) => {
    if (!base64) return "/avatar.png";
    return base64.startsWith("data:image")
      ? base64
      : `data:image/jpeg;base64,${base64}`;
  };

  useEffect(() => {
    if (userData) {
      const convertedImage = convertBase64ToImage(userData.avatar);
      setAvatarPreview(convertedImage);
      setFormData({
        ...userData,
        birthDate: formatDateForInput(userData.birthDate),
        password: "",
        confirmPassword: "",
      });
    } else {
      setAvatarPreview("");
      setFormData({
        fullName: "",
        birthDate: "",
        gender: "male",
        email: "",
        phone: "",
        address: "",
        avatar: "",
        password: "",
        confirmPassword: "",
      });
    }
    setErrors({});
  }, [userData]);

  useEffect(() => {
    if (!apiErrors || Object.keys(apiErrors).length === 0) return;
    setErrors((prev) => ({ ...prev, ...apiErrors }));
  }, [apiErrors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? String(value || "").replace(/\D/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prev) => ({ ...prev, avatar: base64String }));
      setAvatarPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const nextErrors = {};

    const fullName = String(formData.fullName || "").trim();
    const email = normalizeEmail(formData.email);
    const phone = String(formData.phone || "").trim();
    const address = String(formData.address || "").trim();
    const birthDate = String(formData.birthDate || "").trim();

    // Kiểm tra Họ và tên
    if (!fullName) {
      nextErrors.fullName = "Họ và tên không được để trống.";
    }

    // Kiểm tra Ngày sinh
    if (!birthDate) {
      nextErrors.birthDate = "Vui lòng chọn ngày sinh.";
    } else if (birthDate.includes("/")) {
      nextErrors.birthDate = "Vui lòng chọn ngày sinh.";
    } else if (Number.isNaN(new Date(birthDate).getTime())) {
      nextErrors.birthDate = "Vui lòng chọn ngày sinh.";
    }

    // Kiểm tra Email
    if (!email) {
      nextErrors.email = "Email không được để trống.";
    } else if (!isValidGmailAddress(email)) {
      nextErrors.email = "Email phải có đuôi @gmail.com.";
    }

    // Kiểm tra Địa chỉ
    if (!address) {
      nextErrors.address = "Địa chỉ không được để trống.";
    }

    // Kiểm tra Số điện thoại
    if (!phone) {
      nextErrors.phone = "Số điện thoại không được để trống.";
    } else if (!isValidPhone(phone)) {
      nextErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
    }

    // Kiểm tra mật khẩu (chỉ khi thêm mới)
    if (!userData) {
      if (!formData.password) {
        nextErrors.password = "Mật khẩu không được để trống.";
      } else if (!isValidPassword(formData.password)) {
        nextErrors.password = PASSWORD_RULE_MESSAGE;
      }

      if (!formData.confirmPassword) {
        nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
      } else if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      }
    }

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = { ...validate(), ...(apiErrors || {}) };
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      ...formData,
      fullName: String(formData.fullName || "").trim(),
      email: normalizeEmail(formData.email),
      phone: String(formData.phone || "").trim(),
    };

    if (userData) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện
          </label>
          <div className="flex items-center space-x-6">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full object-cover"
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
              disabled={submitting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <FormField
          label="Họ và tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          error={errors.fullName}
          disabled={submitting}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày sinh
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {errors.birthDate && (
            <p className="text-sm font-bold text-red-600 mt-1">{errors.birthDate}</p>
          )}
        </div>

        <FormField
          label="Giới tính"
          name="gender"
          type="select"
          value={formData.gender}
          onChange={handleInputChange}
          options={[
            { value: "male", label: "Nam" },
            { value: "female", label: "Nữ" },
          ]}
          disabled={submitting}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          disabled={submitting || Boolean(userData)}
        />

        <FormField
          label="Số điện thoại"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
          disabled={submitting}
        />

        <FormField
          label="Địa chỉ"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          error={errors.address}
          disabled={submitting}
        />

        {!userData && (
          <>
            <FormField
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              disabled={submitting}
            />
            <FormField
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              disabled={submitting}
            />
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Đang xử lý..." : userData ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;