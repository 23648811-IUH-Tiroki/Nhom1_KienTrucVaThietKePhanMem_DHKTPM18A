import Breadcrumb from "../components/Breadcrumb";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import MainLayout from "../layout/mainLayout";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { IoLogoInstagram } from "react-icons/io5";


const ContactUs = () => {
  const links = [{ label: "Trang chủ", link: "/" }, { label: "Về chúng tôi" }];

  return (
    <>
      <MainLayout>
        <Breadcrumb items={links} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
            LIÊN HỆ VỚI CHÚNG TÔI
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-orange-500 mb-8">
                Thông tin liên hệ
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-orange-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Địa chỉ cửa hàng
                    </h3>
                    <p className="text-gray-600 mt-1">
                      123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-orange-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800">Số điện thoại</h3>
                    <p className="text-gray-600 mt-1">
                      <a
                        href="tel:0915020903"
                        className="hover:text-orange-500 transition-colors"
                      >
                        0915020903
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-orange-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <p className="text-gray-600 mt-1">
                      <a
                        href="mailto:info@petstationshop.com"
                        className="hover:text-orange-500 transition-colors"
                      >
                        info@petstationshop.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-orange-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-800">Giờ làm việc</h3>
                    <p className="text-gray-600 mt-1">
                      Thứ Hai - Chủ Nhật: 8:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="font-medium text-gray-800 mb-4">
                  Kết nối với chúng tôi
                </h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebook className="h-7 w-7" />
                  </a>
                  <a
                    href="#"
                    className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors"
                  >
                    <IoLogoInstagram className="h-7 w-7" />
                  </a>
                  <a
                    href="#"
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <FaYoutube className="h-7 w-7" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-orange-500 mb-8">
                Gửi tin nhắn cho chúng tôi
              </h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-orange-500 text-white py-3 px-8 rounded-lg hover:bg-orange-600 transition duration-300 flex items-center justify-center text-lg cursor-pointer"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Gửi tin nhắn
                </button>
              </form>
            </div>
          </div>

          <div className="mb-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
              BẢN ĐỒ CỬA HÀNG
            </h2>
            <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0381286049655!2d106.69941867469567!3d10.7287961896639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f7b7ed82d8d%3A0xb3ec0fc0a5b2c8b0!2sNguy%E1%BB%85n%20V%C4%83n%20Linh%2C%20Qu%E1%BA%ADn%207%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1682345678901!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
        <ScrollToTopButton />
      </MainLayout>
    </>
  );
};

export default ContactUs;
