import React from "react";
import MainLayout from "../../layout/mainLayout";
import Breadcrumb2 from "../../components/Breadcrumb2";
import dog1 from "../../assets/images/dog1.jpg";
import dog2 from "../../assets/images/dog2.jpg";
import dog3 from "../../assets/images/dog3.png";

import { Link } from "react-router-dom";

const links = [
  { label: "Trang chủ", href: "/" },
  { label: "Tin tức", href: "/blogs/news" },
];

const articles = [
  {
    id: 1,
    title: "Cách xử lý khi chó mèo bị tiêu chảy?",
    date: "25/04/2025",
    author: "Vân Nguyễn Thị Khánh",
    image: dog1,
    slug: "cach-xu-ly-khi-cho-meo-bi-tieu-chay",
    excerpt:
      "Trong cuộc sống hằng ngày thì con người cũng như động vật việc hệ tiêu hóa gặp vấn đề là việc khá thường xuyên xảy ra. Do đó việc chó mèo bị rối loạn tiêu hóa tiêu chảy là cũng không hiếm gặp. Vậy chúng ta phải làm thế nào khi chó mèo bị rối loạn tiêu hóa tiêu chảy, cùng tham khảo kỹ bài viết sau đây của PAWTY các bạn sẽ có cái nhìn khái quát và phương hướng điều trị đúng để tránh gây ra các biến chứng nguy hiểm cho chú cún chú meo nhà bạn nhé!",
  },
  {
    id: 2,
    title: "Cấp cứu chó bị sốc nhiệt tại nhà",
    date: "20/04/2025",
    author: "Vân Nguyễn Thị Khánh",
    image: dog2,
    slug: "cap-cuu-cho-bi-soc-nhiet-tai-nha",
    excerpt:
      "Khi quyết định nuôi thú cưng, đặc biệt là chó, bạn cần tìm hiểu những thông tin cơ bản về chế độ dinh dưỡng, một số bệnh dễ gặp,… để có thể chăm sóc pet một cách tốt nhất. Với khí hậu thời tiết ở nước ta, miền Bắc có mùa hè đổ lửa còn miền Nam thì có mùa khô nắng gắt sẽ ảnh hưởng rất nhiều đến sức khỏe của chó. Vì vậy bạn cần biết cách chữa chó sốc nhiệt để không bị lúng túng nếu gặp phải trường hợp này.",
  },
  {
    id: 3,
    title: "Có thể bạn chưa biết 'Những lợi ích của việc ngủ với thú cưng'",
    date: "08/04/2025",
    author: "Vân Nguyễn Thị Khánh",
    image: dog3,
    slug: "co-the-ban-chua-biet-nhung-loi-ich-cua-viec-ngu-voi-thu-cung",
    excerpt:
      "Theo một nghiên cứu của Đại học Canisius, New York dựa trên việc khảo sát gần 1.000 phụ nữ Mỹ về thói quen ngủ phát hiện, việc ngủ cùng thú cưng mang lại giấc ngủ ngon hơn cả. Đặc biệt là với chó cưng vì chúng mang đến cảm giác thoải mái, an toàn. Theo đó 57% số người được khảo sát cho biết họ ngủ chung giường với bạn đời, 55% ngủ cùng chó và 31% với mèo. Kết quả cho thấy những phụ nữ ngủ với chó có giấc ngủ ngon nhất.",
  },
];


const NewsList = () => {
  return (
    <MainLayout>
       {/* Breadcrumb + Banner */}
       <Breadcrumb2 links={links} banner={null} />

      <div className="max-w-6xl mx-auto p-6">
        

        <div className="mt-10 relative w-full">
        <div className="flex">

          <span className="bg-brown text-white px-4 py-2 rounded-md font-semibold relative z-10 transform skew-x-10">
            TIN TỨC
          </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full border-b-2 border-gray-200 mt-4"></div>

        </div>

        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/blogs/news/${article.slug}`}
            className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer block"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-gray-500 text-sm">
                📅 {article.date} • Đăng bởi:{" "}
                <strong>{article.author}</strong>
              </p>
              <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
              <p className="line-clamp-2 text-gray-600 mt-2">{article.excerpt}</p>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default NewsList;
