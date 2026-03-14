/* eslint-disable react/prop-types */
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layout/mainLayout";
import { TiTick } from "react-icons/ti";
import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import {
  MdAssignmentReturn,
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
  MdOutlineRemoveRedEye,
  MdOutlineStar,
} from "react-icons/md";
import image1 from "../assets/images/image1.jpg";
import Slider from "react-slick";
import { useEffect, useState } from "react";
import DialogProduct from "../components/DialogProduct";
import { useDispatch, useSelector } from "react-redux";
import { fetachProductByName, fetchProducts } from "../stores/productSlice";
import { Image } from "antd";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { IoMdCart } from "react-icons/io";
import { addToCart } from "../stores/cartSlice";
import { ScaleLoader } from "react-spinners";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const services = [
  {
    icon: <TiTick />,
    title: "100% hàng thật",
  },
  {
    icon: <FaShippingFast />,
    title: "Freeship mọi nơi",
  },
  {
    icon: <RiRefund2Line />,
    title: "Hoàn 200% nếu hàng giả",
  },
  {
    icon: <MdAssignmentReturn />,
    title: "30 ngày đổi trả",
  },
];

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("mo-ta");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageId, setSelectedImageId] = useState(0);

  const { addToCart } = useCart();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productDetail, items: products } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetachProductByName(slug));
  }, [slug, dispatch]);

  useEffect(() => {
    if (productDetail?.images?.length) {
      setSelectedImage(productDetail.images[0]);
    }
  }, [productDetail]);

  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowBackIos
        className="absolute top-1/2 -left-2 bg-amber-50 rounded-full p-2 -translate-y-1/2 z-10 hover:cursor-pointer"
        size={30}
        onClick={onClick}
      />
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowForwardIos
        className="absolute top-1/2 -right-2 bg-amber-50 rounded-full p-2 -translate-y-1/2 hover:cursor-pointer"
        size={30}
        onClick={onClick}
      />
    );
  };

  const settings = {
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    rows: 2,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleThumbnailClick = (image, index) => {
    setSelectedImage(image);
    setSelectedImageId(index);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleBuyNow = async () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }
    const result = await addToCart(user._id, productDetail._id, quantity);

    if (result.success) {
      navigate("/checkout");
    } else {
      toast.error(result.message);
    }
    // dispatch(addToCart({ ...productDetail, cartQuantity: quantity }));
    // navigate("/checkout");
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const handleAddToCart = async () => {
    if (!user?._id) {
      navigate("/login");
      return;
    }

    const result = await addToCart(user._id, productDetail._id, quantity);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (!productDetail) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ScaleLoader />
      </div>
    );
  }

  return (
    <MainLayout>
      <ul className="gap-10 border-b-[1px] justify-center border-[#c49a6c] items-center hidden md:flex">
        <Link className="font-bold text-blue-900">Cam kết</Link>
        {services.map((service, index) => (
          <li key={index} className="py-3">
            <Link className="flex gap-2 justify-center items-center">
              <span className="text-blue-600">{service.icon}</span>
              <span className="text-black text-[15px]">{service.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative">
        <img className="h-32 md:w-full md:h-full" src={image1} alt="" />
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 text-base md:text-[20px] text-white font-bold text-center">
          <h1
            style={{ color: "white" }}
            className="mb-4 text-2xl hidden md:block"
          >
            {productDetail.name}
          </h1>
          <div>
            <Link to="/" className="hover:text-[#c49a6c]">
              Trang chủ
            </Link>
            <span> &gt; </span>
            <Link to="/shop-meo" className="hover:text-[#c49a6c]">
              {productDetail.category_id?.type}
            </Link>
            <span> &gt; </span>
            <span className="text-[#e17100] font-semibold">
              {productDetail.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1350px] mx-auto flex flex-col gap-5 px-5">
        <div className="flex gap-5 mt-5">
          <div className="w-full md:w-8/10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white shadow-md rounded-lg p-4">
              <Swiper
                style={{
                  "--swiper-navigation-color": "#fff",
                  "--swiper-pagination-color": "#fff",
                }}
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                onSlideChange={(swiper) => {
                  setSelectedImage(productDetail.images[swiper.activeIndex]);
                  setSelectedImageId(swiper.activeIndex);
                }}
                className="mySwiper2 h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden"
              >
                {productDetail?.images?.map((image, index) => (
                  <SwiperSlide
                    key={index}
                    className="flex justify-center items-center bg-white"
                  >
                    <Image
                      src={image}
                      className="block w-full h-full object-cover"
                      preview={{ mask: "Xem ảnh" }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <hr className="my-5 opacity-10" />

              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="mySwiper h-[80px] md:h-[100px] box-border py-[10px] mt-4"
              >
                {productDetail?.images?.map((image, index) => (
                  <SwiperSlide
                    key={index}
                    className={`w-[25%] h-full transition-opacity duration-200 cursor-pointer ${
                      selectedImageId === index
                        ? "border-2 border-amber-500 rounded-lg"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => handleThumbnailClick(image, index)}
                  >
                    <img
                      src={image}
                      className={`block w-full h-full object-cover rounded-lg ${
                        selectedImageId === index
                          ? "opacity-100"
                          : "opacity-75 hover:opacity-100"
                      }`}
                      alt={`Thumbnail ${index}`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="bg-white shadow-md rounded-lg">
              <div className="p-3 flex flex-col gap-3">
                <div className="flex gap-5 items-center">
                  <div className="p-3 flex flex-col gap-3 rounded-[5px]">
                    <h1 className="text-[22px] font-semibold">
                      {productDetail?.name}
                    </h1>
                    <span className="opacity-50">
                      Đã bán: {productDetail.sold}
                    </span>
                    <div className="flex items-center gap-5">
                      <h5 className="font-bold text-[25px] text-red-600">
                        {new Intl.NumberFormat("vi-VN").format(
                          productDetail.price
                        )}
                        đ
                      </h5>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="flex flex-col gap-4">
                  <h1 className="font-semibold text-lg text-gray-800">
                    Số lượng
                  </h1>
                  <div className="flex items-center w-fit bg-white border border-gray-300 rounded-full shadow-sm">
                    <button
                      className="size-10 text-lg font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-6 text-lg font-medium">{quantity}</span>
                    <button
                      className="size-10 text-lg font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition rounded-full"
                      onClick={handleIncrease}
                    >
                      +
                    </button>
                  </div>

                  <h1 className="font-semibold text-lg text-gray-800">
                    Tổng tiền
                  </h1>
                  <span className="font-semibold text-3xl text-gray-800">
                    {new Intl.NumberFormat("vi-VN").format(
                      quantity * productDetail.price
                    )}
                    đ
                  </span>

                  <div className="flex gap-5">
                    <button
                      onClick={() => handleBuyNow(productDetail)}
                      className="bg-amber-600 text-white w-full py-2 text-[20px] rounded-[10px] cursor-pointer border-2 text-brown-hover hover:bg-transparent"
                    >
                      Mua ngay
                    </button>
                    <button
                      onClick={() => handleAddToCart(productDetail)}
                      className="border-2 border-amber-600 w-full py-2 text-[20px] rounded-[10px] cursor-pointer hover:bg-amber-600 hover:text-white"
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block md:w-2/10 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b-2 border-gray-200 p-6">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Liên hệ
              </h1>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Showroom Hà Nội:</span> 185 Lệ
                Mật, Phường Đức Giang, Quận Long Biên, Thành phố Hà Nội
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Showroom HCM:</span> 180 Nguyễn
                Văn Thương, Phường 25, Quận Bình Thạnh, Hồ Chí Minh
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Hotline:</span> 0888.042.637
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                info@hangxingiatot.com
              </p>
            </div>

            <div className="p-6">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                DỊCH VỤ BÁN HÀNG
              </h1>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">✅</span>Sản phẩm chất lượng
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">✅</span>Giao hàng toàn quốc
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">✅</span>Tư vấn, chăm sóc nhiệt tình
                </li>
                <li className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">✅</span>Đổi trả sản phẩm trong 7 ngày
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white shadow-md rounded-lg">
          <div className="flex border-b border-gray-500">
            {[
              { id: "mo-ta", label: "Mô tả" },
              { id: "chinh-sach", label: "Chính sách đổi trả" },
              { id: "huong-dan", label: "Hướng dẫn sử dụng" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id ? "bg-brown text-white" : "text-gray-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            {activeTab === "mo-ta" && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Mô tả sản phẩm</h3>
                <span>- Tên sản phẩm: {productDetail?.name}</span>
                <p>
                  Đối với các bé trưởng thành, bát thức ăn bệt gây tác hại mỏi
                  xương cổ, ảnh hưởng xương sống. Quá trình nhai nuốt cũng không
                  hiệu quả do phải cúi thấp. Bát thức ăn nâng cao và điều chỉnh
                  được độ nghiêng 15 độ là giải pháp an toàn cho vật nuôi. Tư
                  thế thoải mái, dễ chịu khi nhai nuốt sẽ làm vật nuôi dễ dàng
                  hấp thụ thức ăn. Tránh tác động xấu về lâu dài lên hệ cơ xương
                  và tiêu hóa.
                </p>
                <span>
                  - Chất liệu: Nhựa PP an toàn cho sức khỏe và thân thiện với
                  môi trường. Chịu nhiệt tốt. Dễ dàng lau chùi.
                </span>
                <span>- Kích thước: dài, rộng 13 cm, cao 14.5 cm.</span>
              </div>
            )}

            {activeTab === "chinh-sach" && (
              <div className="flex flex-col gap-4 p-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  Chính sách đổi trả
                </h3>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    Quý khách có thể đổi hàng đã mua trong các trường hợp sau:
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Hàng có lỗi kỹ thuật do nhà sản xuất.</li>
                    <li>Hàng bị giao nhầm, nhầm size.</li>
                  </ul>
                  <p className="text-gray-600">
                    <span className="font-medium">Thời hạn đổi hàng:</span> 05
                    ngày kể từ ngày mua/nhận hàng.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    Điều kiện đổi hàng:
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>
                      Hàng chưa qua sử dụng, giặt ủi, phải còn nguyên tem mác,
                      không dính bẩn,…
                    </li>
                    <li>Hàng đổi phải có giá bằng hoặc cao hơn hàng đã mua.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Phí đổi hàng:</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>
                      Nếu hàng bị lỗi kỹ thuật do nhà sản xuất: miễn phí toàn bộ
                      phí chuyển hàng (gửi trả và giao hàng)
                    </li>
                    <li>
                      Trường hợp khác Quý khách hàng sẽ chịu chi phí chuyển hàng
                      (gửi trả và giao hàng).
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    CHÍNH SÁCH BẢO HÀNH.
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Hàng có lỗi kỹ thuật do nhà sản xuất.</li>
                    <li>Thời hạn bảo hành dây kéo : trọn đời.</li>
                  </ul>
                </div>

                <h3 className="font-medium text-gray-700">
                  Chân thành cảm ơn Quý Khách Hàng đã quan tâm đến các sản phẩm
                  nhãn hiệu Pet Shop.
                </h3>
              </div>
            )}

            {activeTab === "huong-dan" && (
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Hướng dẫn sử dụng</h3>
                <p>
                  - Lắp đặt bát ăn theo đúng hướng dẫn để đảm bảo độ nghiêng phù
                  hợp cho thú cưng.
                </p>
                <p>
                  - Sử dụng nước ấm và khăn mềm để vệ sinh, tránh dùng hóa chất
                  mạnh.
                </p>
                <p>
                  - Đặt bát ăn ở nơi bằng phẳng, tránh khu vực có nhiều bụi bẩn.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-white shadow-md rounded-lg flex flex-col gap-2">
          <h3 className="font-medium text-2xl">Sản phẩm tương tự</h3>
          <Slider {...settings}>
            {products.map((product, index) => (
              <div key={index} className="p-3">
                <div>
                <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer block">
                  <div className="relative group hover:cursor-pointer">
                      <Link to={`/product/${product.slug}`}>
                        <img
                          className="hover:opacity-70 w-full h-48 object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      </Link>
                      <div className="flex gap-3 absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="bg-amber-50 p-2 rounded-[5px] group hover:bg-gray-400"
                        >
                          <MdOutlineRemoveRedEye
                            className="hover:text-white"
                            size={25}
                          />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-amber-50 p-2 rounded-[5px] group hover:bg-gray-400"
                        >
                          <IoMdCart className="hover:text-white" size={25} />
                        </button>
                      </div>
                    </div>
                    <div className="py-3 px-4 flex flex-col gap-1 justify-between h-full">
                      <Link
                        to={`/product/${product.slug}`}
                        className="line-clamp-2 hover:text-[#c49a6c] hover:cursor-pointer"
                        >
                        {product.name}
                      </Link>
                      <div>
                        <span className="text-1xl text-[#c49a6c] text-start">
                          {product.price.toLocaleString("vi-VN") + "₫"}
                        </span>
                        <button className="mt-3 mb-2 bg-[#e17100] text-white border-2 border-[#e17100] duration-200 transition-colors hover:bg-white text-brown-hover w-full py-2 rounded-[10px] font-medium cursor-pointer">
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <DialogProduct
            open={open}
            product={selectedProduct}
            setOpen={setOpen}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
