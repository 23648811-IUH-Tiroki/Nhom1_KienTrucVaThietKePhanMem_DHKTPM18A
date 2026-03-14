import { useNavigate } from "react-router-dom";
import "./component.scss";
import { FaShoppingBag, FaClock, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";

const PopupSearch = ({
  searchRef,
  searchResults = [],
  searchHistory = [],
  onSearch,
  onHistoryItemClick,
  onClearHistory,
}) => {
  const navigate = useNavigate();
  const hasResults = searchResults && searchResults.length > 0;
  const hasHistory = searchHistory && searchHistory.length > 0;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeSection, setActiveSection] = useState(
     hasResults ? "results" : "history"
  );

  useEffect(() => {
    setSelectedIndex(-1);
    setActiveSection(hasResults ? "results" : "history");
  }, [searchResults, searchHistory, hasResults]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!hasResults && !hasHistory) return;

      const items = activeSection === "results" ? searchResults : searchHistory;
      const maxIndex = items.length - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
            if (activeSection === "results") {
              handleProductClick(searchResults[selectedIndex]);
            } else {
              onHistoryItemClick(searchHistory[selectedIndex]);
            }
          }
          break;
        case "Tab":
          if (hasResults && hasHistory) {
            e.preventDefault();
            setActiveSection((prev) =>
              prev === "results" ? "history" : "results"
            );
            setSelectedIndex(-1);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    hasResults,
    hasHistory,
    selectedIndex,
    activeSection,
    searchResults,
    searchHistory,
  ]);


  const handleProductClick = (result) => {
    if (result.slug) {
      if (result.name) {
        onSearch(result);
      }
      navigate(`/product/${result.slug}`);
    } else if (result.category_id && result.category_id.slug) {
      navigate(`/categories/${result.category_id.slug}`);
    }
  };

  return (
    <div
      className="popup-search absolute top-full left-0 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-y-auto popup-search-container"
      style={{ position: "absolute", zIndex: 9999 }}
    >
      {hasResults ? (
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">
            Kết quả tìm kiếm
          </h3>
          <ul className="suggestions-list">
            {searchResults.map((result, index) => (
              <li
                key={`result-${index}`}
                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                  activeSection === "results" && selectedIndex === index
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(result);
                }}
                onMouseEnter={() => {
                  setActiveSection("results");
                  setSelectedIndex(index);
                }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                    {result.images && result.images.length > 0 ? (
                      <img
                        src={result.images[0]}
                        alt={result.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">
                        <FaShoppingBag />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-800">{result.name}</span>
                    <span className="text-xs text-gray-500">
                      {result.price
                        ? new Intl.NumberFormat("vi-VN").format(result.price) +
                          "đ"
                        : "Danh mục"}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {hasHistory && (
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Lịch sử tìm kiếm
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearHistory();
                  }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center cursor-pointer"
                >
                  <FaTrash className="mr-1" />
                  Xóa lịch sử
                </button>
              </div>
              <ul className="history-list">
                {searchHistory.map((item, index) => (
                  <li
                    key={`history-${index}`}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${
                      activeSection === "history" && selectedIndex === index
                        ? "bg-gray-200"
                        : ""
                    }`}
                    onClick={() => onHistoryItemClick(item)}
                    onMouseEnter={() => {
                      setActiveSection("history");
                      setSelectedIndex(index);
                    }}
                  >
                    <FaClock className="text-gray-400 mr-2" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!hasResults && !hasHistory && (
            <div className="p-4 text-center text-gray-500">
              {searchResults === null
                ? "Đang tìm kiếm..."
                : "Không tìm thấy kết quả nào"}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PopupSearch;
