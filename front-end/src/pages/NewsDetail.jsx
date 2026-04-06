import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layout/mainLayout";
import Breadcrumb2 from "../components/Breadcrumb2";
import CommentForm from "../components/CommentForm";
import dog1 from "../assets/images/dog1.jpg";
import dog2 from "../assets/images/dog2.jpg";
import dog3 from "../assets/images/dog3.png";

import NotFoundPage from "./NotFoundPage";

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

const NewsDetail = () => {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);

  // Cuộn lên đầu trang khi vào bài viết mới
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <MainLayout>
        <Breadcrumb2
        links={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/blogs/news" },
          { label: "Bài viết không tồn tại", href: `` },
        ]}
        banner={null}
      />
        <NotFoundPage/>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Breadcrumb2
        links={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/blogs/news" },
          { label: article.title, href: `/blogs/news/${article.slug}` },
        ]}
        banner={null}
      />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800">{article.title}</h1>
        <p className="text-gray-500 mt-2">
          📅 {article.date} • Đăng bởi: <strong>{article.author}</strong>
        </p>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-80 object-cover rounded-lg mt-4"
        />
        <div className="text-gray-700 mt-6 leading-relaxed">
          {article.excerpt}
        </div>

        <CommentForm />
      </div>
    </MainLayout>
  );
};

export default NewsDetail;
