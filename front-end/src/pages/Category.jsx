import { Link, useParams } from 'react-router-dom';
import MainLayout from '../layout/mainLayout';
import image1 from '../assets/images/image1.jpg';
import SliderCategory from '../components/SliderCategory';
import Filter from '../components/Filter';
import { useDispatch, useSelector } from 'react-redux';
import Product from '../components/Product';
import { useEffect } from 'react';
import { featchProductByCategoryName, setCurrentPage } from '../stores/productSlice';
import { Pagination } from 'antd';


function Category() {
  const { productByCateoty: products, currentPage, totalPages, pageSize } = useSelector((state) => state.products);
  const { allCategory } = useSelector(state => state.categories);
  const { slug } = useParams();
  const dispatch = useDispatch();

  console.log("jnkn: ", products);
  
  

  useEffect(() => {
    dispatch(featchProductByCategoryName({slug, currentPage}));
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

  if (!products || !allCategory) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="relative">
        <img className="h-32 md:w-full md:h-[300px] object-cover" src={image1} alt="" />
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center top-20">
          {products.length > 0 && (
            <h1 className="mb-4 text-2xl font-bold text-white">{products[0]?.category_id?.name}</h1>
          )}
          <div>
            <Link to="/" className="hover:text-[#c49a6c] text-white">Trang chủ</Link>
            <span className="text-white"> &gt; </span>
            <span className="font-semibold text-[#c49a6c]">{products[0]?.category_id?.name}</span>
          </div>
        </div>
        <SliderCategory />
      </div>

      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6 py-3">
        <div className="w-full md:w-1/4">
          <Filter />
        </div>
        <div className="w-full md:w-3/4">
          <p className='text-2xl font-bold mb-5 py-1'>{products[0]?.category_id.name}</p>
          {products.length === 0 ? (
            <div className="text-center text-gray-600">
              <h1>Không có sản phẩm nào trong danh mục này.</h1>
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
            totalPages>1?(
              <div className='py-5'>
                <Pagination
                  current={currentPage}
                  total={totalPages*10}
                  align='center'
                  onChange={handlePageChange}
                />
               </div>
            ):""
          }

          
        </div>
      </div>
    </MainLayout>
  );
}

export default Category;