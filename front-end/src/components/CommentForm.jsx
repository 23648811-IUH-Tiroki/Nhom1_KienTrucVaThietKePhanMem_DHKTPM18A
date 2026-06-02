import React, { useState } from "react";
import { FaFacebookF, FaGoogle, FaTwitter } from "react-icons/fa";
import { toast } from "react-toastify";

const CommentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi:", formData);

    // Hiển thị thông báo đẹp hơn với toast
    toast.success("🎉 Bình luận của bạn đã được gửi thành công!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

    setFormData({ name: "", email: "", comment: "" });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">


      {/* Chia sẻ mạng xã hội */}
      <div className="flex items-center space-x-4 text-gray-600 text-sm mb-6">
        <span className="font-medium">Chia sẻ:</span>
        <a
          href="#"
          className="hover:text-blue-600 transition duration-300"
          title="Chia sẻ Facebook"
        >
          <FaFacebookF size={18} />
        </a>
        <a
          href="#"
          className="hover:text-red-500 transition duration-300"
          title="Chia sẻ Google+"
        >
          <FaGoogle size={18} />
        </a>
        <a
          href="#"
          className="hover:text-blue-400 transition duration-300"
          title="Chia sẻ Twitter"
        >
          <FaTwitter size={18} />
        </a>
      </div>

      {/* Form bình luận */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Gửi ý kiến của bạn cho chúng tôi
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Họ và tên"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            required
          />
        </div>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          rows="4"
          placeholder="Viết bình luận..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          required
        ></textarea>
        <button
          type="submit"
          className="w-full bg-brown text-white py-3 rounded-lg font-semibold hover:bg-[#a88258] transition cursor-pointer"
        >
          Gửi bình luận
        </button>
      </form>
    </div>
  );
};

export default CommentForm;
