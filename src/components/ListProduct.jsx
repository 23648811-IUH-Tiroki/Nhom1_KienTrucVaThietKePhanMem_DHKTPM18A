/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"
import Product from "./Product"
import { useEffect, useState } from "react"
import axiosInstance from "../utils/axiosInstance";

function ListProduct({title, products}) {
  const icon = title.includes('cún') ? '🐶' : title.includes('mèo') ? '🐱' : '🐾';

  const [categories, setCategories] = useState([]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const collections = categories.map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`,
  }));

  return (
    // <div className={`flex flex-col gap-4 ${style ? "md:flex-row-reverse" : "md:flex-row"}`}>
    //   <div className="hidden lg:w-1/3 lg:flex flex-col items-center border-2 gap-5 border-[#c49a6c]">
    //     <Product product={products[0]} primary/>
    //   </div>
    //   <div className="w-full lg:w-2/3">
    //     <div>
    //       <div className="border-b-2 border-[#c49a6c] mb-5 md:0">
    //         <div className="bg-[#c49a6c] w-44 text-center p-1 skew-x-[-15deg] ml-1">
    //           <h2 className="text-2xl text-white">{title}</h2>
    //         </div>
    //       </div>
    //       <ul className="hidden md:flex gap-3 pb-5">
    //         {
    //           collections.map((collection, index) => (
    //             <li key={index}>
    //               <Link
    //                 to={
    //                 title === "Shop cho cún"
    //                   ? `/collections/${collection.link || collection.link1}`
    //                   : `/collections/${collection.link || collection.link2}`}
    //                 className="hover:text-[#c49a6c]">{collection.name}
    //               </Link>
    //             </li>
    //           ))
    //         }
    //       </ul>
    //     </div>
    //     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    //       {
    //         products.map((product, index) => (
    //           <Product key={index} product={product}/>
    //         ))
    //       }
    //     </div>
    //   </div>
    // </div>
    <div className="p-5">
      <div className="flex flex-row justify-between">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-yellow-300 px-6 py-3 rounded-xl shadow-md text-white text-2xl font-bold mb-3">
            <span>{icon}</span>
            <h2>{title}</h2>
          </div>
        <ul className="hidden md:flex gap-5 pb-5">
          {collections.map((collection, index) => (
            <li key={index}>
              <Link
                to={
                  title === "Shop cho cún"
                    ? `/collections/${collection.link || collection.link1}`
                    : `/collections/${collection.link || collection.link2}`
                }
                className="hover:text-[#c49a6c]"
              >
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-5">
        {
          products?.slice(0, 8).map((product, index) => (
            <Product key={index} product={product}/>
          ))
        }
      </div>
    </div>
  );
}

export default ListProduct;
