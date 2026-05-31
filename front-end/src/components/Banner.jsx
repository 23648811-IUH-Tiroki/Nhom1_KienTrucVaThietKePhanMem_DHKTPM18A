import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';


const categories = [
  "https://theme.hstatic.net/200000521195/1000872898/14/slider_1.jpg?v=259",
  "https://theme.hstatic.net/200000521195/1000872898/14/slider_2.jpg?v=259"
];

export default function Banner({number}) {
  return (
    <div>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper rounded-[10px]"
      >
        {
          categories.map((item, index) => (
            <SwiperSlide key={index}>
              <img src={item} alt="" />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  );
}
