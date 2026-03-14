import { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumb from "../components/Breadcrumb";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import logo from "/pet.png";
import Header from "../components/Header";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { Link, useNavigate } from "react-router-dom";
import "./page.scss";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance";

const Register = () => {
  const links = [{ label: "Trang chủ", link: "/" }, { label: "Đăng ký" }];
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
        setErrors({});
        setSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((preErros) => ({
      ...preErros,
      [name]: null, // xóa lỗi khi người dùng bắt đầu nhập lại
    }));
  };

  const validateForm = () => {
    const { fullName, phone, email, birthDate, password, confirmPassword } =
      formData;

    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Họ và tên không được để trống.";
    if (!phone.match(/^\d{10}$/))
      newErrors.phone = "Số điện thoại không hợp lệ.";
    if (
      email &&
      !email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    )
      newErrors.email = "Email không hợp lệ.";
    if (!birthDate) newErrors.birthDate = "Ngày sinh không được để trống.";
    if (!password.match(/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/))
      newErrors.password =
        "Mật khẩu phải tối thiểu 6 ký tự, có ít nhất 1 chữ và 1 số.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp.";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const validationError = validateForm();
    if (Object.keys(validationError).length > 0) {
      setErrors(validationError);
      return;
    }

    try {
      // Kiểm tra trùng lặp email và số điện thoại
      const { phone, email } = formData;
      const checkDuplicateResponse = await axiosInstance.post("/api/users/check-duplicate",
        {
          phone,
          email,
        }
      ); 

      if (checkDuplicateResponse.data.duplicateEmail) {
        setErrors({ email: "Email đã tồn tại." });
        toast.error("Email đã tồn tại!");
        return;
      }

      if (checkDuplicateResponse.data.duplicatePhone) {
        setErrors({ phone: "Số điện thoại đã tồn tại." });
        toast.error("Số điện thoại đã tồn tại!");
        return;
      }

      const imagePath = "/avatar.png";
      const response = await fetch(imagePath);
      const blob = await response.blob();

      // Chuyển đổi Blob thành base64
      const defaultAvatarBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      if (!defaultAvatarBase64) {
        throw new Error("Không thể chuyển đổi hình ảnh mặc định.");
      }

      console.log("defaultAvatarBase64:", defaultAvatarBase64);

      // Tạo người dùng mới
      const userData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        birthDate: formData.birthDate,
        password: formData.password,
        role: "user",
        avatar: defaultAvatarBase64.split(",")[1],
      };

      const res = await axiosInstance.post("/api/users/register",
        userData
      );

      if (res.status === 201) {
        setSuccess(true);
        toast.success("Đăng ký thành công. Đến trang đăng nhập.");
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          birthDate: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setErrors({
        general:
          err.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      });
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb items={links} />
      <div className="container mx-auto px-4 md:px-8 flex flex-col items-center -mt-10">
        <div className="w-full max-w-2xl bg-white rounded-md shadow-md p-8">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="w-30 h-30 object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Đăng ký với
          </h1>
          {/* social login */}
          <div className="flex justify-center gap-4 mb-6">
            <button className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-md hover:bg-gray-200 shadow-sm cursor-pointer">
              <FcGoogle className="text-4xl" />
              Google
            </button>
            <button className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-md hover:bg-gray-200 shadow-sm cursor-pointer">
              <FaFacebook className="text-4xl text-blue-600" />
              Facebook
            </button>
          </div>
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500">hoặc</span>
            <hr className="flex-grow border-gray-300" />
          </div>
          {/* form */}
          <form onSubmit={handleRegister}>
            {errors.general && (
              <span className="error-message">{errors.general}</span>
            )}
            <div className="space-y-6">
              <div className="input-container">
                <input
                  type="text"
                  name="fullName"
                  placeholder=" "
                  className="w-full mb-2"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <label>Nhập họ và tên</label>
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="input-container">
                <input
                  type="text"
                  name="phone"
                  placeholder=" "
                  className="w-full mb-2"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <label>Nhập số điện thoại</label>
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="input-container">
                <input
                  type="text"
                  name="email"
                  placeholder=" "
                  className="w-full mb-2"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label>Nhập email</label>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="input-container">
                <input
                  type="date"
                  name="birthDate"
                  placeholder=" "
                  className="w-full"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
                <label>Chọn ngày sinh</label>
                {errors.birthDate && (
                  <span className="error-message">{errors.birthDate}</span>
                )}
              </div>

              <div className="input-container">
                <input
                  type="password"
                  name="password"
                  placeholder=" "
                  className="w-full mb-2"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label>Nhập mật khẩu</label>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              <div className="input-container">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder=" "
                  className="w-full mb-2"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <label>Xác nhận mật khẩu</label>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-brown text-white py-3 rounded-md mt-2 font-semibold hover:shadow-lg cursor-pointer"
            >
              Đăng ký
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Bạn đã có tài khoản?{" "}
            <Link to="/login" className="text-brown font-semibold">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      <ScrollToTopButton />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Register;
