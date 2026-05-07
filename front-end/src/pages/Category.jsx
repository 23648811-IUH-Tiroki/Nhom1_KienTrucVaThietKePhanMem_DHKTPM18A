import { useParams } from 'react-router-dom';
import MainLayout from '../layout/mainLayout';
import SliderCategory from '../components/SliderCategory';
import Filter from '../components/Filter';
import { useDispatch, useSelector } from 'react-redux';
import Product from '../components/Product';
import { useEffect } from 'react';
import { featchProductByCategoryName, setCurrentPage } from '../stores/productSlice';
import { Pagination } from 'antd';
import Breadcrumb2 from '../components/Breadcrumb2';


function Category() {
  const { productByCateoty: products, currentPage, totalPages, load, error } = useSelector((state) => state.products);
  const { allCategory } = useSelector(state => state.categories);
  const { slug } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(featchProductByCategoryName({ slug, currentPage }));
  }, [dispatch, slug, currentPage]);

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // if (load) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[300px]">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[300px]">
  //       <h1 className="text-red-500">Đã xảy ra lỗi: {error}</h1>
  //     </div>
  //   );
  // }

  if (load) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="mx-auto mt-8 max-w-250 rounded-xl border border-red-100 bg-red-50 p-5 text-red-700">
          Da xay ra loi khi tai danh muc. Vui long thu lai sau.
        </div>
      </MainLayout>
    );
  }

  const categoryName = products?.[0]?.category_id?.name || "Danh muc san pham";
  const banner = products?.[0]?.images?.[0] || null;
  const links = [
    { label: 'Trang chủ', href: '/' },
    { label: categoryName, href: `/categories/${slug}` },
  ];

  return (
    <MainLayout>
      <Breadcrumb2 links={links} banner={banner} />
      <SliderCategory />

      <div className="mx-auto flex max-w-300 flex-col gap-6 py-3 md:flex-row">
        <div className="w-full md:w-1/4">
          <Filter />
        </div>
        <div className="w-full md:w-3/4">
          <p className='text-2xl font-bold mb-5 py-1'>{categoryName}</p>
          {products.length === 0 ? (
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-6 text-center text-gray-600">
              <h1>Khong co san pham nao trong danh muc nay.</h1>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                // <div key={index} className="hover:scale-105 transition-transform">
                <Product key={index} product={product} />
                // </div>
              ))}
            </div>
          )}

          {
            totalPages > 1 ? (
              <div className='py-5'>
                <Pagination
                  current={currentPage}
                  total={totalPages * 10}
                  align='center'
                  onChange={handlePageChange}
                />
              </div>
            ) : ""
          }


        </div>
      </div>
    </MainLayout>
  );
}

export default Category;