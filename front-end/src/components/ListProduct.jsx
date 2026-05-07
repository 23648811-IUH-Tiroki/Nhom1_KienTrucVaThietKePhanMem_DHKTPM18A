/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import Product from "./Product"

function ListProduct({ title, products }) {
  const icon = title.includes('cún') ? '🐶' : title.includes('mèo') ? '🐱' : '🐾';
  const totalProducts = products?.length || 0;

  return (
    <section className="rounded-3xl bg-linear-to-b from-orange-50 to-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-4 py-2 text-white shadow-md">
          <span>{icon}</span>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm font-medium text-gray-500">{totalProducts} san pham</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {
          products?.slice(0, 8).map((product, index) => (
            <Product key={index} product={product} />
          ))
        }
      </div>
      <div className="mt-5 text-right">
        <Link to="/search" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
          Xem them san pham
        </Link>
      </div>
    </section>
  );
}

export default ListProduct;
