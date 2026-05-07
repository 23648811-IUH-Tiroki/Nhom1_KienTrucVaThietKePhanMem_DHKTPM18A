import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">
        Oops! Trang bạn tìm kiếm không tồn tại.
      </h2>
      <p className="text-gray-500 mt-2">
        Có thể đường dẫn đã bị thay đổi hoặc trang đã bị xóa.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-brown text-white rounded-lg font-semibold hover:bg-[#a88258] transition"
      >
        Quay về Trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
