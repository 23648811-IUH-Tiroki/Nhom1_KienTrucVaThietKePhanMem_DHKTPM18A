/* eslint-disable react/prop-types */
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { TiTick } from "react-icons/ti";
import { FaShippingFast } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import {
    MdAssignmentReturn,
    MdOutlineArrowBackIos,
    MdOutlineArrowForwardIos,
    MdOutlineRemoveRedEye,
} from "react-icons/md";
import Slider from "react-slick";
import { useEffect, useState } from "react";
import DialogProduct from "../../components/DialogProduct";
import { useDispatch, useSelector } from "react-redux";
import { fetachProductByName, fetchProducts } from "../../stores/productSlice";
import Breadcrumb2 from "../../components/Breadcrumb2";
import { Image } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { IoMdCart } from "react-icons/io";
import { useCart } from "../../context/CartContext";
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
    const [selectedImageId, setSelectedImageId] = useState(0);

    const { addToCart } = useCart();
    const { slug } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { productDetail, items: products, load, error } = useSelector(
        (state) => state.products
    );

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        if (!slug) return;
        dispatch(fetachProductByName(slug));
    }, [slug, dispatch]);

    useEffect(() => {
        if (productDetail?.images?.length) {
            setSelectedImageId(0);
        }
    }, [productDetail]);

    const CustomPrevArrow = (props) => {
        const { onClick } = props;
        return (
            <MdOutlineArrowBackIos
                className="absolute top-1/2 -left-3 bg-white/90 rounded-full p-2 -translate-y-1/2 z-10 shadow ring-1 ring-black/5 hover:bg-amber-50 transition hover:cursor-pointer"
                size={30}
                onClick={onClick}
            />
        );
    };

    const CustomNextArrow = (props) => {
        const { onClick } = props;
        return (
            <MdOutlineArrowForwardIos
                className="absolute top-1/2 -right-3 bg-white/90 rounded-full p-2 -translate-y-1/2 z-10 shadow ring-1 ring-black/5 hover:bg-amber-50 transition hover:cursor-pointer"
                size={30}
                onClick={onClick}
            />
        );
    };

    const settings = {
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        rows: 1,
        lazyLoad: "ondemand",
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
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

    const handleThumbnailClick = (_image, index) => {
        setSelectedImageId(index);
    };

    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    const handleBuyNow = async () => {
        if (!userId) {
            navigate("/login");
            return;
        }

        navigate("/checkout", {
            state: {
                buyNowItems: [
                    {
                        product_id: productDetail,
                        quantity,
                    },
                ],
            },
        });
    };

    const handleAddToCart = async () => {
        if (!userId) {
            navigate("/login");
            return;
        }

        const pagePathAtClick = window.location.pathname;
        const result = await addToCart(userId, productDetail._id, quantity);

        if (window.location.pathname !== pagePathAtClick) {
            return;
        }

        if (!result.success) {
            toast.error(result.message || "Đã xảy ra lỗi khi thêm vào giỏ hàng");
        }
    };

    if (load && !productDetail) {
        return (
            <MainLayout>
                <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                    <div className="h-40 md:h-56 rounded-2xl bg-slate-200 animate-pulse" />
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-6">
                        <div className="space-y-4">
                            <div className="h-96 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                            <div className="h-64 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                        </div>
                        <div className="h-80 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!productDetail) {
        return (
            <MainLayout>
                <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Khong tim thay san pham
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            {error || "San pham hien tai khong kha dung."}
                        </p>
                        <Link
                            to="/"
                            className="mt-4 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition"
                        >
                            Quay ve trang chu
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const breadcrumbLinks = [
        { label: "Trang chu", href: "/" },
        {
            label: productDetail.category_id?.type || "San pham",
            href: productDetail.category_id?.slug
                ? `/categories/${productDetail.category_id.slug}`
                : "/",
        },
        { label: productDetail.name || "Chi tiet san pham" },
    ];

    return (
        <MainLayout>
            <Breadcrumb2 links={breadcrumbLinks} banner={null} />
            <div className="bg-white border-b border-amber-100 hidden md:block">
                <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 py-3 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">Cam kết</span>
                        {services.map((service, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-amber-600">{service.icon}</span>
                                <span>{service.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="contents">
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 h-full flex flex-col lg:order-1">
                            <Swiper
                                style={{
                                    "--swiper-navigation-color": "#ffffff",
                                    "--swiper-pagination-color": "#ffffff",
                                }}
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{
                                    swiper:
                                        thumbsSwiper && !thumbsSwiper.destroyed
                                            ? thumbsSwiper
                                            : null,
                                }}
                                modules={[FreeMode, Navigation, Thumbs]}
                                onSlideChange={(swiper) => {
                                    setSelectedImageId(swiper.activeIndex);
                                }}
                                className="mySwiper2 w-full max-w-sm mx-auto rounded-xl overflow-hidden"
                            >
                                {productDetail?.images?.map((image, index) => (
                                    <SwiperSlide
                                        key={index}
                                        className="flex justify-center items-center bg-slate-50"
                                    >
                                        <div className="w-full max-w-sm mx-auto aspect-square">
                                            <Image
                                                src={image}
                                                className="block w-full h-full object-cover"
                                                preview={{ mask: "Xem ảnh" }}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <div className="mt-5">
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[FreeMode, Navigation, Thumbs]}
                                    className="mySwiper h-10 md:h-12 box-border"
                                >
                                    {productDetail?.images?.map((image, index) => (
                                        <SwiperSlide
                                            key={index}
                                            className="w-[25%] h-full cursor-pointer"
                                            onClick={() => handleThumbnailClick(image, index)}
                                        >
                                            <img
                                                src={image}
                                                className={`block w-full h-full object-cover rounded-xl border ${selectedImageId === index
                                                    ? "border-amber-500 ring-2 ring-amber-200"
                                                    : "border-transparent opacity-70 hover:opacity-100"
                                                    }`}
                                                alt={`Thumbnail ${index}`}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 lg:col-span-2 lg:order-3">
                            <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
                                {[
                                    { id: "mo-ta", label: "Mô tả" },
                                    { id: "chinh-sach", label: "Chính sách đổi trả" },
                                    { id: "huong-dan", label: "Hướng dẫn sử dụng" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === tab.id
                                            ? "bg-amber-600 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-amber-50"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-5 text-slate-700 leading-relaxed">
                                {activeTab === "mo-ta" && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="font-semibold text-slate-900">
                                            Mô tả sản phẩm
                                        </h3>
                                        <span>- Tên sản phẩm: {productDetail?.name}</span>
                                        <p>
                                            Đối với các bé trưởng thành, bát thức ăn bệt gây tác hại
                                            mỏi xương cổ, ảnh hưởng xương sống. Quá trình nhai nuốt
                                            cũng không hiệu quả do phải cúi thấp. Bát thức ăn nâng cao
                                            và điều chỉnh được độ nghiêng 15 độ là giải pháp an toàn
                                            cho vật nuôi. Tư thế thoải mái, dễ chịu khi nhai nuốt sẽ
                                            làm vật nuôi dễ dàng hấp thụ thức ăn. Tránh tác động xấu về
                                            lâu dài lên hệ cơ xương và tiêu hóa.
                                        </p>
                                        <span>
                                            - Chất liệu: Nhựa PP an toàn cho sức khỏe và thân thiện
                                            với môi trường. Chịu nhiệt tốt. Dễ dàng lau chùi.
                                        </span>
                                        <span>- Kích thước: dài, rộng 13 cm, cao 14.5 cm.</span>
                                    </div>
                                )}

                                {activeTab === "chinh-sach" && (
                                    <div className="flex flex-col gap-4">
                                        <h3 className="font-semibold text-lg text-slate-900">
                                            Chính sách đổi trả
                                        </h3>

                                        <div className="space-y-2">
                                            <h3 className="font-medium text-slate-800">
                                                Quý khách có thể đổi hàng đã mua trong các trường hợp
                                                sau:
                                            </h3>
                                            <ul className="list-disc list-inside text-slate-600">
                                                <li>Hàng có lỗi kỹ thuật do nhà sản xuất.</li>
                                                <li>Hàng bị giao nhầm, nhầm size.</li>
                                            </ul>
                                            <p className="text-slate-600">
                                                <span className="font-medium">Thời hạn đổi hàng:</span>
                                                05 ngày kể từ ngày mua/nhận hàng.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium text-slate-800">
                                                Điều kiện đổi hàng:
                                            </h3>
                                            <ul className="list-disc list-inside text-slate-600">
                                                <li>
                                                    Hàng chưa qua sử dụng, giặt ủi, phải còn nguyên tem
                                                    mác, không dính bẩn,…
                                                </li>
                                                <li>
                                                    Hàng đổi phải có giá bằng hoặc cao hơn hàng đã mua.
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium text-slate-800">
                                                Phí đổi hàng:
                                            </h3>
                                            <ul className="list-disc list-inside text-slate-600">
                                                <li>
                                                    Nếu hàng bị lỗi kỹ thuật do nhà sản xuất: miễn phí
                                                    toàn bộ phí chuyển hàng (gửi trả và giao hàng)
                                                </li>
                                                <li>
                                                    Trường hợp khác Quý khách hàng sẽ chịu chi phí chuyển
                                                    hàng (gửi trả và giao hàng).
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-medium text-slate-800">
                                                CHÍNH SÁCH BẢO HÀNH.
                                            </h3>
                                            <ul className="list-disc list-inside text-slate-600">
                                                <li>Hàng có lỗi kỹ thuật do nhà sản xuất.</li>
                                                <li>Thời hạn bảo hành dây kéo : trọn đời.</li>
                                            </ul>
                                        </div>

                                        <h3 className="font-medium text-slate-800">
                                            Chân thành cảm ơn Quý Khách Hàng đã quan tâm đến các sản
                                            phẩm nhãn hiệu Pet Shop.
                                        </h3>
                                    </div>
                                )}

                                {activeTab === "huong-dan" && (
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-semibold text-slate-900">
                                            Hướng dẫn sử dụng
                                        </h3>
                                        <p>
                                            - Lắp đặt bát ăn theo đúng hướng dẫn để đảm bảo độ nghiêng
                                            phù hợp cho thú cưng.
                                        </p>
                                        <p>
                                            - Sử dụng nước ấm và khăn mềm để vệ sinh, tránh dùng hóa
                                            chất mạnh.
                                        </p>
                                        <p>
                                            - Đặt bát ăn ở nơi bằng phẳng, tránh khu vực có nhiều bụi
                                            bẩn.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="space-y-6 lg:self-stretch lg:order-2">
                        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 h-full flex flex-col">
                            <div className="flex flex-col gap-4 flex-1">
                                <div>
                                    <h2 className="font-display text-2xl font-semibold text-slate-900">
                                        {productDetail?.name}
                                    </h2>
                                    <span className="text-sm text-slate-500">
                                        Đã bán: {productDetail.sold}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h5 className="font-semibold text-3xl text-rose-600">
                                        {new Intl.NumberFormat("vi-VN").format(productDetail.price)}
                                        đ
                                    </h5>
                                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                                        Giá tốt hôm nay
                                    </span>
                                </div>

                                <div className="h-px bg-slate-100" />

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-2">
                                            Số lượng
                                        </h3>
                                        <div className="flex items-center w-fit bg-white border border-slate-200 rounded-full">
                                            <button
                                                className="size-10 text-lg font-bold bg-slate-50 hover:bg-slate-100 transition rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={handleDecrease}
                                                disabled={quantity <= 1}
                                                aria-label="Giảm số lượng"
                                            >
                                                -
                                            </button>
                                            <span className="px-6 text-lg font-medium">
                                                {quantity}
                                            </span>
                                            <button
                                                className="size-10 text-lg font-bold bg-slate-50 hover:bg-slate-100 transition rounded-full"
                                                onClick={handleIncrease}
                                                aria-label="Tăng số lượng"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-800 mb-2">
                                            Tổng tiền
                                        </h3>
                                        <span className="font-semibold text-3xl text-slate-900">
                                            {new Intl.NumberFormat("vi-VN").format(
                                                quantity * productDetail.price
                                            )}
                                            đ
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                                        <button
                                            onClick={handleBuyNow}
                                            className="bg-amber-600 text-white w-full py-3 text-lg rounded-xl font-semibold hover:bg-amber-500 transition"
                                        >
                                            Mua ngay
                                        </button>
                                        <button
                                            onClick={handleAddToCart}
                                            className="border border-amber-600 text-amber-700 w-full py-3 text-lg rounded-xl font-semibold hover:bg-amber-50 transition"
                                        >
                                            Thêm vào giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-10">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-2xl text-slate-900">
                            Sản phẩm tương tự
                        </h3>
                    </div>
                    <Slider {...settings}>
                        {products.filter(Boolean).map((product, index) => (
                            <div key={index} className="px-2">
                                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                                    <div className="relative group">
                                        <Link to={`/product/${product?.slug || ""}`}>
                                            <img
                                                className="w-full h-48 object-cover"
                                                src={product?.images?.[0] || "/pet.png"}
                                                alt={product?.name || "Sản phẩm"}
                                            />
                                        </Link>
                                        <div className="flex gap-3 absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                onClick={() => handleViewProduct(product)}
                                                className="bg-white/90 p-2 rounded-full shadow hover:bg-amber-50"
                                                aria-label="Xem nhanh"
                                            >
                                                <MdOutlineRemoveRedEye size={22} />
                                            </button>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="bg-white/90 p-2 rounded-full shadow hover:bg-amber-50"
                                                aria-label="Thêm vào giỏ"
                                            >
                                                <IoMdCart size={22} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2">
                                        <Link
                                            to={`/product/${product?.slug || ""}`}
                                            className="line-clamp-2 text-slate-800 hover:text-amber-600 transition"
                                        >
                                            {product?.name || "Sản phẩm không có tên"}
                                        </Link>
                                        <div>
                                            <span className="text-lg font-semibold text-amber-600">
                                                {(product?.price || 0).toLocaleString("vi-VN") +
                                                    "₫"}
                                            </span>
                                            <button className="mt-3 bg-amber-600 text-white border border-amber-600 transition-colors hover:bg-white hover:text-amber-700 w-full py-2 rounded-xl font-medium">
                                                Mua ngay
                                            </button>
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
            </section>

            <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <div className="border-b border-slate-100 p-5">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                            Liên hệ
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">Showroom Hà Nội:</span> 185 Lệ
                            Mật, Phường Đức Giang, Quận Long Biên, Thành phố Hà Nội
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">Showroom HCM:</span> 180 Nguyễn
                            Văn Thương, Phường 25, Quận Bình Thạnh, Hồ Chí Minh
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">Hotline:</span> 0888.042.637
                        </p>
                        <p className="text-sm text-slate-600">
                            <span className="font-medium">Email:</span>
                            info@hangxingiatot.com
                        </p>
                    </div>

                    <div className="p-5">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                            Dịch vụ bán hàng
                        </h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <span>✅</span>Sản phẩm chất lượng
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>Giao hàng toàn quốc
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>Tư vấn, chăm sóc nhiệt tình
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>Đổi trả sản phẩm trong 7 ngày
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
};

export default ProductDetail;
