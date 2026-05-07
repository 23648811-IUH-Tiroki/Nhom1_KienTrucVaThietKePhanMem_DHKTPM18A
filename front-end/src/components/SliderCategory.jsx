/* eslint-disable react/prop-types */
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategoryBySlug } from "../stores/catetorySlice";

function SliderCategory() {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories)

  useEffect(() => {
    dispatch(fetchCategoryBySlug("shop-cho-cun"));
  }, [dispatch])

  const getSlidesToShow = (maxSlides) => {
    if (!categories?.length) return 1;
    return Math.min(categories.length, maxSlides);
  };

  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowBackIos className="absolute text-[#e17100] top-1/2 left-0 -translate-y-1/2 z-10 hover:cursor-pointer" size={30} onClick={onClick} />
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowForwardIos className="absolute text-[#e17100] top-1/2 right-0 -translate-y-1/2 hover:cursor-pointer" size={30} onClick={onClick} />
    );
  };

  var settings = {
    infinite: categories.length > getSlidesToShow(5),
    slidesToShow: getSlidesToShow(5),
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
          slidesToShow: getSlidesToShow(4),
          infinite: categories.length > getSlidesToShow(4),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: getSlidesToShow(3),
          infinite: categories.length > getSlidesToShow(3),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: getSlidesToShow(2),
          infinite: categories.length > getSlidesToShow(2),
        },
      },
    ],
  };

  return (
    <div className="relative z-20 mx-auto w-full overflow-hidden rounded-2xl border border-amber-400 bg-linear-to-r from-amber-50 to-orange-50 shadow-sm md:-mt-20">
      <Slider {...settings}>
        {
          categories.map((item, index) => (
            <div key={index}>
              <div onClick={() => navigate(`/categories/${item.slug.replace(/(-cho-cun|-cho-meo)$/, "")}`)} className="group flex h-30 flex-col items-center justify-center border-l border-amber-300 px-2 md:h-40 hover:cursor-pointer hover:bg-white/55">
                <img src={item.image} alt="" className="size-16 md:size-20 transition-transform duration-500 group-hover:rotate-y-360" />
                <span className="mt-2 line-clamp-2 text-center text-[12px] md:text-base group-hover:text-amber-700">{item.name.replace(/( cho cún| cho mèo)$/, "")}
                </span>
              </div>
            </div>
          ))
        }
      </Slider>
    </div>
  )
}

export default SliderCategory;