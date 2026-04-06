import { useState } from "react";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import Slider from "react-slick";
import { IoMdCart } from "react-icons/io";
import DialogProduct from "./DialogProduct";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../stores/cartSlice";

function SaleProduct({ productSale }) {
  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowBackIos
        className="absolute top-1/2 text-white -left-5 -translate-y-1/2 z-10 hover:cursor-pointer"
        size={30}
        onClick={onClick}
      />
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowForwardIos
        className="absolute top-1/2 text-white -right-5 -translate-y-1/2 hover:cursor-pointer"
        size={30}
        onClick={onClick}
      />
    );
  };

  var settings = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
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

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleBuyNow = (product) => {
    dispatch(addToCart(product));
    navigate("/cart");
    window.scroll(0, 0);
  };

  return (
    <div>
      <Slider {...settings}>
        {productSale?.map((product, index) => (
          <div key={index} className="px-3">
            <div>
              <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer block">
                <div className="relative group hover:cursor-pointer">
                  <Link to={`/product/${product.slug}`}>
                    <img
                      className={`hover:opacity-70 w-screen`}
                      src={product.images[0]}
                      alt=""
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

                <div className="py-3 px-4 flex flex-col gap-1 h-[170px] justify-between">
                  <Link
                    to={"/product/2"}
                    className="line-clamp-2 hover:text-[#c49a6c] hover:cursor-pointer"
                  >
                    {product.name}
                  </Link>
                  <div>
                    <span className="text-1xl text-[#c49a6c] text-start">
                      {product.price.toLocaleString("vi-VN") + "₫"}
                    </span>
                    <button
                      onClick={() => handleBuyNow(product)}
                      style={{}}
                      className="mt-3 mb-2 bg-[#e17100] cursor-pointer text-white border-2 border-[#e17100] duration-200 transition-colors hover:bg-white text-brown-hover w-full py-2 rounded-[10px] font-medium mt-2"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <DialogProduct open={open} product={selectedProduct} setOpen={setOpen} />
    </div>
  );
}

export default SaleProduct;
