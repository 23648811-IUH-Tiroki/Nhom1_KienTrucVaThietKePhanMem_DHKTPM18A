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

const Login = () => {
  const links = [{ label: "Trang chủ", link: "/" }, { label: "Đăng nhập" }];
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        window.location.reload();
        navigate("/");
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
    setErrors((preErrors) => ({
      ...preErrors,
      [name]: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) {
      newErrors.phone = "Số điện thoại không được để trống.";
    } else if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = "Số điện thoại không hợp lệ.";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (!formData.password.match(/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/)) {
      newErrors.password =
        "Mật khẩu phải tối thiểu 6 ký tự, có ít nhất 1 chữ và 1 số.";
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axiosInstance.post("/api/users/login", {
        phone: formData.phone,
        password: formData.password,
      });

      const user = res.data;

      if (!user) {
        setErrors({
          general: "Số điện thoại hoặc mật khẩu không chính xác.",
        });
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      setSuccess(true);
      toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      if (err.response && err.response.status === 401) {
        setErrors({
          general: "Số điện thoại hoặc mật khẩu không chính xác.",
        });
      } else {
        setErrors({
          general:
            err.response?.data?.message ||
            "Đã có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
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
            Đăng nhập với
          </h1>
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
          {errors.general && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-10"
              role="alert"
            >
              {errors.general}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="space-y-6">
              <div className="input-container">
                <input
                  type="tel"
                  name="phone"
                  placeholder=" "
                  className="w-full"
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
                  type="password"
                  name="password"
                  placeholder=" "
                  className="w-full"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label>Nhập mật khẩu</label>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>
              <small className="text-gray-500 italic mx-2">
                (*) Mật khẩu tối thiểu 6 ký tự, có ít nhất 1 chữ và 1 số. (VD:
                12345a)
              </small>
            </div>
            <button
              type="submit"
              className="w-full bg-brown text-white py-3 rounded-md mt-6 font-semibold hover:shadow-lg cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>
          
          <p className="text-center text-gray-600 mt-6">
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className="text-brown font-semibold">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
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
      <ScrollToTopButton />
    </>
  );
};

export default Login;
