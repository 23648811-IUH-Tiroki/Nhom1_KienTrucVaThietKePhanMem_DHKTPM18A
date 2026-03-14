import policy1 from "/policy1.webp";
import policy2 from "/policy2.webp";
import policy3 from "/policy3.webp";
import policy4 from "/policy4.webp";
import logo from "/pet.png";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 mt-5">
      {/* head */}
      <div className="bg-brown text-white">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-3 px-2 md:px-8 lg:px-16">
          {[
            {
              img: policy1,
              title: "GIAO HÀNG MIỄN PHÍ",
              desc: "Với đơn trên 500.000đ",
            },
            { img: policy2, title: "HỖ TRỢ 24/7", desc: "Nhiệt tình chu đáo" },
            {
              img: policy3,
              title: "GIAO HÀNG MIỄN PHÍ",
              desc: "Nhanh chóng thuận tiện",
            },
            { img: policy4, title: "GIÁ TIÊU CHUẨN", desc: "" },
          ].map((policy, index) => (
            <div
              key={index}
              className="group flex flex-col items-center gap-4 perspective"
            >
              {/* Ảnh policy */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 transform-style preserve-3d group-hover:rotate-y-180 transition-transform duration-700">
                {/* Mặt trước */}
                <div className="absolute w-full h-full backface-hidden">
                  <img
                    src={policy.img}
                    alt="Policy"
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Mặt sau */}
                <div className="absolute w-full h-full bg-brown flex items-center justify-center backface-hidden rotate-y-180">
                  <img
                    src={policy.img}
                    alt="Policy"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              {/* Văn bản */}
              <div className="text-center">
                <h2 className="text-white font-bold text-sm lg:text-base">
                  {policy.title}
                </h2>
                <p className="text-white text-xs lg:text-sm">{policy.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* body */}
      <div
        className="text-white bg-cover bg-no-repeat py-20 gap-10 "
        style={{ backgroundImage: "url('/bgft.jpg')" }}
      >
        <div className="container mx-auto  flex flex-wrap items-center justify-between py-4 px-4 md:px-8 lg:px-16 gap-6">
          {/* col 1: logo & address*/}
          <div>
            <div className="flex items-center space-x-3">
              <a href="/">
                <img
                  src={logo}
                  alt="Logo Pet Shop"
                  className="h-20 w-20 object-cover"
                />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-brown">
                  PET STATION SHOP
                </h1>
                <p className="text-2sm text-brown ml-12">
                  The happy store for pet
                </p>
              </div>
            </div>
            <h1 className="text-2sm text-brown mb-2">PET STATION SHOP</h1>
            <p>
              Trụ sở chính: Phường 4, Nguyễn Văn Bảo,
              <br /> Quận Gò Vấp, Hồ Chí Minh, Vietnam
            </p>
            <p>Hotline: 0915020803 - 0987475837</p>
            <p>Email: petstation@gmail.com</p>
          </div>
          {/* col 2: link */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-brown">VỀ CHÚNG TÔI</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-brown-hover">
                  SHOP CHO CÚN
                </a>
              </li>
              <li>
                <a href="#" className="text-brown-hover">
                  SHOP CHO MÈO
                </a>
              </li>
              <li>
                <a href="#" className="text-brown-hover">
                  KHUYẾN MÃI
                </a>
              </li>
              <li>
                <a href="#" className="text-brown-hover">
                  TIN TỨC
                </a>
              </li>
            </ul>
          </div>
          {/* col 3: support hotline */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-brown">
              TỔNG ĐÀI HỖ TRỢ
            </h3>
            <ul className="space-y-2">
              <li className="text-brown-hover">
                <p>Hotline 1: 0915020803</p>
              </li>
              <li className="text-brown-hover">
                <p>Hotline 2: 0987475837</p>
              </li>
              <li className="text-brown-hover">
                <p>Email: support@petstation.com</p>
              </li>
              <li className="text-brown-hover">
                <p>Thời gian: 24/7</p>
              </li>
            </ul>
          </div>

          {/* col 4: promotion */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-brown">
              NHẬN TIN KHUYẾN MÃI
            </h3>
            <div className="flex justify-center">
              <input
                type="email"
                placeholder="Nhập email..."
                className="p-2 border rounded-l-md focus:outline-none w-80"
              />
              <button className="p-2 bg-brown text-white rounded-r-md cursor-pointer">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* bottom */}
      <div className="bg-333 text-white text-sm py-4">
        <div className="container mx-auto text-center gap-4">
          <p className="w-full lg:w-auto font-semibold">
            Bản quyền thuộc về <span className="text-brown">GR19</span> |{" "}
            <span className="text-brown">Powered by K18</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
