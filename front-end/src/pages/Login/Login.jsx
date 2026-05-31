import { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import logo from "/pet.png";
import Header from "../../components/Header";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { Link, useNavigate } from "react-router-dom";
import "../page.scss";
import { ToastContainer, toast } from "react-toastify";
import { signIn } from "../../services/authService";
import { fetchProfile } from "../../services/userService";
import {
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "../../utils/validation";

const Login = () => {
  const links = [{ label: "Trang chủ", link: "/" }, { label: "Đăng nhập" }];
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [lockUntil, setLockUntil] = useState(() => {
    const storedLockUntil = Number(localStorage.getItem("loginLockUntil") || 0);
    return storedLockUntil > Date.now() ? storedLockUntil : 0;
  });
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!lockUntil) {
      setLockRemainingSeconds(0);
      localStorage.removeItem("loginLockUntil");
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setLockRemainingSeconds(remaining);

      if (remaining === 0) {
        setLockUntil(0);
        localStorage.removeItem("loginLockUntil");
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);

    return () => clearInterval(timer);
  }, [lockUntil]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/");
        setErrors({});
        setSuccess(false);
      }, 500);
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

    const email = normalizeEmail(formData.email);
    if (!email) {
      newErrors.email = "Email không được để trống.";
    } else if (!isValidEmail(email)) {
      newErrors.email = EMAIL_RULE_MESSAGE;
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = PASSWORD_RULE_MESSAGE;
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
      const res = await signIn({
        email: normalizeEmail(formData.email),
        password: formData.password,
      });

      const { accessToken } = res.data;

      if (!accessToken) {
        setErrors({
          general: "Email hoặc mật khẩu không chính xác.",
        });
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      const profileRes = await fetchProfile();
      if (profileRes?.data) {
        localStorage.setItem("user", JSON.stringify(profileRes.data));
      }
      localStorage.removeItem("loginLockUntil");
      setLockUntil(0);
      setSuccess(true);
      toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      if (err.response && err.response.status === 429) {
        const responseLockUntil = Number(err.response?.data?.lockUntil || 0);
        if (responseLockUntil > Date.now()) {
          setLockUntil(responseLockUntil);
          localStorage.setItem("loginLockUntil", String(responseLockUntil));
        }
        setErrors({
          general:
            err.response?.data?.message ||
            "Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.",
        });
      } else if (err.response && err.response.status === 401) {
        setErrors({
          general: "Email hoặc mật khẩu không chính xác.",
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
            <hr className="grow border-gray-300" />
            <span className="mx-4 text-gray-500">hoặc</span>
            <hr className="grow border-gray-300" />
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
                  type="email"
                  name="email"
                  placeholder=" "
                  className="w-full"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={lockRemainingSeconds > 0}
                />
                <label>Nhập email</label>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
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
                  disabled={lockRemainingSeconds > 0}
                />
                <label>Nhập mật khẩu</label>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>
              {lockRemainingSeconds > 0 && (
                <small className="text-red-600 italic mx-2">
                  Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau{" "}
                  {lockRemainingSeconds} giây.
                </small>
              )}
              <small className="text-gray-500 italic mx-2">
                Quên mật khẩu?{" "}
                <Link
                  to="/forgot-password"
                  className="text-brown font-semibold"
                >
                  Lấy lại mật khẩu
                </Link>
              </small>
            </div>
            <button
              type="submit"
              className="w-full bg-brown text-white py-3 rounded-md mt-6 font-semibold hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={lockRemainingSeconds > 0}
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
