import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategory } from "../stores/catetorySlice";
import { Link } from "react-router-dom";
import { featchProductFilterProduct } from "../stores/productSlice";

const priceRanges = [
  "Giá dưới 20.000đ",
  "20.000đ - 50.000đ",
  "50.000đ - 100.000đ",
  "100.000đ - 200.000đ",
  "200.000đ - 300.000đ",
  "Giá trên 300.000đ",
];

const Filter = () => {
  const [selectedPrices, setSelectedPrices] = useState([]);
  const dispatch = useDispatch();
  const { allCategory } = useSelector(state => state.categories)
  const [priceFilter, setPriceFilter] = useState([])

  const handlePriceChange = (price) => {
    setSelectedPrices((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const parsePriceRange = (priceStr) => {
    if (priceStr.includes("dưới")) {
      const max = parseInt(priceStr.match(/\d+/g).join(""));
      return { min: 0, max };
    } else if (priceStr.includes("trên")) {
      const min = parseInt(priceStr.match(/\d+/g).join(""));
      return { min, max: Infinity };
    } else {
      const [minStr, maxStr] = priceStr.split(" - ");
      const min = parseInt(minStr.replace(/\D/g, ""));
      const max = parseInt(maxStr.replace(/\D/g, ""));
      return { min, max };
    }
  };

  const handleFilterSubmit = async () => {
    const parsedRanges = selectedPrices.map(parsePriceRange);
    dispatch(featchProductFilterProduct(parsedRanges))
  };

  useEffect(() => {
    dispatch(fetchAllCategory())
  }, [dispatch])

  return (
    <div>
      <div className="mb-4">
        <h4 className="bg-brown text-white p-3 font-semibold mb-3 rounded-[10px] text-center">
          DANH MỤC
        </h4>
        <div className="bg-white border border-gray-200 rounded-[10px] p-2 flex flex-col gap-1 shadow-sm">
          {allCategory?.map((category, index) => (
            <Link
              key={index}
              to={`/categories/${category.slug}`}
              className="block px-3 py-2 rounded-[8px] hover:bg-[#e17100]/10 hover:text-[#e17100] transition-all duration-200"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="bg-brown text-white p-3 font-semibold mb-3 rounded-[10px] text-center">KHOẢNG GIÁ</h4>
        <div className="bg-white border border-gray-200 rounded-[10px] p-2 flex flex-col gap-1 shadow-sm">
          {priceRanges.map((price, index) => (
            <label key={index} className="flex items-center space-x-2 py-1 block px-3 py-2 rounded-[8px] hover:bg-[#e17100]/10 hover:text-[#e17100] transition-all duration-200">
              <input
                type="checkbox"
                value={price}
                checked={selectedPrices.includes(price)}
                onChange={() => handlePriceChange(price)}
                className="accent-[#e17100]"
              />
              <span>{price}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="text-center">
  <button 
    onClick={handleFilterSubmit} 
    className="w-50 bg-brown text-center rounded-[25px] mt-5 py-2 text-[20px] text-white font-bold cursor-pointer 
    hover:bg-brown/80 hover:shadow-lg hover:scale-105 transition-all duration-300">
    Lọc
  </button>
</div>

    </div>
  );
};

export default Filter;