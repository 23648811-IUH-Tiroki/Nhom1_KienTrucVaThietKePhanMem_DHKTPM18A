import Banner from "../components/Banner";
import SliderCategory from "../components/SliderCategory";
import MainLayout from "../layout/mainLayout";
import ListProduct from "../components/ListProduct";
import Marquee from "react-fast-marquee";
import SaleProduct from "../components/SaleProduct";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import dog1 from "../assets/images/dog1.jpg";
import dog2 from "../assets/images/dog2.jpg";
import { ScaleLoader } from "react-spinners";

const articles = [
  {
    id: 1,
    title: "Cách xử lý khi chó mèo bị tiêu chảy?",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    slug: "cach-xu-ly-khi-cho-meo-bi-tieu-chay",
    excerpt:
      "Trong cuộc sống hằng ngày thì con người cũng như động vật việc hệ tiêu hóa gặp vấn đề...",
  },
  {
    id: 2,
    title: "Cấp cứu chó bị sốc nhiệt tại nhà",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog2,
    slug: "cap-cuu-cho-bi-soc-nhiet-tai-nha",
    excerpt:
      "Khi quyết định nuôi thú cưng, đặc biệt là chó, bạn cần tìm hiểu những thông tin cơ bản...",
  },
  {
    id: 3,
    title: "Có thể bạn chưa biết 'Những lợi ích của việc ngủ với thú cưng'",
    date: "08/06/2022",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    slug: "nhung-loi-ich-cua-viec-ngu-voi-thu-cung",
    excerpt:
      "Theo một nghiên cứu của Đại học Canisius, New York dựa trên việc khảo sát gần 1.000 người...",
  },
];

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = targetDate - new Date();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 justify-center items-center">
      {Object.entries(timeLeft).map(([label, value], index) => (
        <div key={index} className="bg-white flex flex-col justify-center items-center p-2 rounded-[5px]">
          <span>{value.toString().padStart(2, "0")}</span>
          <span className="text-[12px]">
            {label === "days" ? "Ngày" : label === "hours" ? "Giờ" : label === "minutes" ? "Phút" : "Giây"}
          </span>
        </div>
      ))}
    </div>
  );
};

const images = [
  "https://bizweb.dktcdn.net/100/426/888/themes/902732/assets/section_home_banner1.jpg?1728468327659",
  "https://bizweb.dktcdn.net/100/426/888/themes/902732/assets/section_home_banner2.jpg?1728468327659",
  "https://bizweb.dktcdn.net/100/426/888/themes/902732/assets/section_home_banner2.jpg?1728468327659",
];

const Home = () => {
  const { categories: productCategory, productSale } = useSelector((state) => state.products);

  const targetDate = new Date();
  targetDate.setHours(targetDate.getHours() + 12);

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
  };

  if(!productCategory || !productSale){
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ScaleLoader />
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="relative mt-10 px-5">
        <Banner />
        <SliderCategory />
      </div>
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10 px-5">
        <ListProduct products={productCategory["shop-cho-cun"]} title={"Shop cho cún"} />

        <div className="bg-brown p-5 rounded-[10px]">
          <div className="flex flex-col md:flex-row gap-3 md:gap-7 mb-5">
            <div className="flex justify-center items-center gap-3">
              <img
                className="h-4"
                src="https://file.hstatic.net/200000713019/file/flashsale-hot_6f59fac9870c4452bbed862ad7020f15.webp"
                alt=""
              />
              <h1 className="text-1xl text-white font-bold">CHỈ CÓ TẠI PETMALL ONLINE 8:30 - 20:59 MỖI NGÀY</h1>
            </div>
            <Marquee speed={50} gradient={false} className="text-[14px] text-white">
              <span className="mx-4">GIAO HÀNG NHANH TRONG 30 PHÚT TẠI HỒ CHÍ MINH</span>
              <span className="mx-4">SẢN PHẨM CHÍNH HÃNG GIÁ TỐT NHẤT THỊ TRƯỜNG</span>
            </Marquee>
            <CountdownTimer targetDate={targetDate} />
          </div>
          <SaleProduct productSale = {productSale}/>
        </div>

        <ListProduct products={productCategory["shop-cho-meo"]} title={"Shop cho mèo"} />


<div className="p-5">
        <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-yellow-300 px-6 py-3 rounded-xl shadow-md text-white text-2xl font-bold">
            <h2>Tin tức</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/blogs/news/${article.slug}`}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer block"
            >
              <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-gray-500 text-sm">
                  📅 {article.date} • Đăng bởi:{" "}
                  <strong>{article.author}</strong>
                </p>
                <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
                <p className="text-gray-600 mt-2">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;