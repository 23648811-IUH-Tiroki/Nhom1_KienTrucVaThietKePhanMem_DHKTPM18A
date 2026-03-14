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

  useEffect(()=>{
    dispatch(fetchCategoryBySlug("shop-cho-cun"));
  }, [dispatch])

  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowBackIos className="absolute text-[#e17100] top-1/2 left-0 -translate-y-1/2 z-10 hover:cursor-pointer" size={30} onClick={onClick}/>
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <MdOutlineArrowForwardIos className="absolute text-[#e17100] top-1/2 right-0 -translate-y-1/2 hover:cursor-pointer" size={30} onClick={onClick}/>
    );
  };

  var settings = {
    infinite: true,
    slidesToShow: 5,
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

  return (
    <div className="relative md:bottom-20 z-20 max-w-[1200px] mx-auto bg-amber-50 border-1 border-amber-500">
      <Slider {...settings}>
      {
        categories.map((item, index) => (
          <div key={index}>
            <div onClick={()=>navigate(`/categories/${item.slug.replace(/(-cho-cun|-cho-meo)$/, "")}`)} className=" h-30 md:h-40 flex flex-col justify-center items-center border-l-1 border-amber-500 group hover:cursor-pointer">
              <img src={item.image} alt="" className="size-16 md:size-20 transition-transform duration-500 group-hover:rotate-y-[360deg]"/>
              <span className="group-hover:text-amber-700 text-[12px] md:text-base">{item.name.replace(/( cho cún| cho mèo)$/, "")}
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