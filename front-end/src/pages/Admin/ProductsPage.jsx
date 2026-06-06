import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Star,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProducts as fetchProductsRequest,
  deleteProduct as deleteProductRequest
} from "../../services/productService";
import { fetchCategories as fetchCategoriesRequest } from "../../services/categoryService";
import DeleteProductConfirmationModal from "../../components/DeleteProductConfirmationModal";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all"); // all, under_100k, 100k_500k, over_500k
  const [stockFilter, setStockFilter] = useState("all"); // all, in_stock, out_of_stock
  const [ratingFilter, setRatingFilter] = useState("all"); // all, 4_star_plus, 5_star

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchProductsRequest();
      setProducts(res.data || []);
      setFilteredProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetchCategoriesRequest();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Apply filters client-side
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(p => {
        const catId = p.category_id?._id || p.category_id;
        return catId === categoryFilter;
      });
    }

    // Price range filter
    if (priceRangeFilter !== "all") {
      if (priceRangeFilter === "under_100k") {
        result = result.filter(p => p.price < 100000);
      } else if (priceRangeFilter === "100k_500k") {
        result = result.filter(p => p.price >= 100000 && p.price <= 500000);
      } else if (priceRangeFilter === "over_500k") {
        result = result.filter(p => p.price > 500000);
      }
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "in_stock") {
        result = result.filter(p => p.stock > 0);
      } else if (stockFilter === "out_of_stock") {
        result = result.filter(p => p.stock === 0);
      }
    }

    // Rating filter (default mock to 4.5 stars if rating not defined)
    if (ratingFilter !== "all") {
      if (ratingFilter === "4_star_plus") {
        result = result.filter(p => (p.rating || 4.5) >= 4.0);
      } else if (ratingFilter === "5_star") {
        result = result.filter(p => (p.rating || 4.5) === 5.0);
      }
    }

    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, priceRangeFilter, stockFilter, ratingFilter]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setPriceRangeFilter("all");
    setStockFilter("all");
    setRatingFilter("all");
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductRequest(productToDelete._id);
      toast.success("Đã xóa sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại!");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh mục Sản phẩm</h1>
          <p className="text-xs text-slate-500">Xem, tìm kiếm và quản lý thông tin các mặt hàng trong hệ thống</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-xs">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "grid" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
              title="Xem dạng ô"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "table" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"}`}
              title="Xem dạng bảng"
            >
              <List size={16} />
            </button>
          </div>
          
          <button 
            onClick={() => navigate("/admin/products/new")}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Plus size={14} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Search & Complex Filters */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search */}
          <div className="w-full md:flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            />
          </div>
          
          {/* Quick reset button */}
          <button 
            onClick={handleResetFilters}
            className="w-full md:w-auto h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 transition cursor-pointer shrink-0"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mr-2">
            <SlidersHorizontal size={12} />
            Bộ lọc nâng cao:
          </span>

          {/* Category selection */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-650 cursor-pointer focus:outline-none"
          >
            <option value="">Tất cả Danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Price Range */}
          <select 
            value={priceRangeFilter}
            onChange={(e) => setPriceRangeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-650 cursor-pointer focus:outline-none"
          >
            <option value="all">Khoảng Giá (Tất cả)</option>
            <option value="under_100k">Dưới 100k VND</option>
            <option value="100k_500k">Từ 100k - 500k VND</option>
            <option value="over_500k">Trên 500k VND</option>
          </select>

          {/* Stock */}
          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-650 cursor-pointer focus:outline-none"
          >
            <option value="all">Tồn kho (Tất cả)</option>
            <option value="in_stock">Còn hàng</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>

          {/* Rating */}
          <select 
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-650 cursor-pointer focus:outline-none"
          >
            <option value="all">Đánh giá (Tất cả)</option>
            <option value="4_star_plus">Từ 4 sao trở lên</option>
            <option value="5_star">Đạt 5 sao tuyệt đối</option>
          </select>
        </div>
      </div>

      {/* Grid or Table content rendering */}
      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3">
          <RefreshCw size={24} className="text-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Đang tải danh sách sản phẩm...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-16 text-center shadow-xs">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Không có sản phẩm nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc</p>
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 cursor-pointer"
          >
            Reset bộ lọc
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const rating = p.rating || 4.5;
            const inStock = p.stock > 0;
            return (
              <div 
                key={p._id}
                className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-admin-soft transition-all duration-300 group hover:-translate-y-1 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0">
                  <img 
                    src={p.images?.[0] || "/placeholder.png"} 
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  
                  {/* Floating badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      inStock 
                        ? "bg-green-500 text-white shadow-xs" 
                        : "bg-rose-500 text-white shadow-xs"
                    }`}>
                      {inStock ? `Tồn kho: ${p.stock}` : "Hết hàng"}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{p.category_id?.name || "Khác"}</span>
                    <h3 className="text-xs font-bold text-slate-950 dark:text-white line-clamp-2 leading-relaxed" title={p.name}>
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(p.price)}</span>
                    
                    {/* Floating quick actions */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => navigate(`/product/${p.slug}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                        title="Xem trang bán hàng"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                        title="Sửa sản phẩm"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 transition cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-semibold h-11">
                  <th className="px-6 w-20">Ảnh</th>
                  <th className="px-4">Tên sản phẩm</th>
                  <th className="px-4">Danh mục</th>
                  <th className="px-4">Giá</th>
                  <th className="px-4">Tồn kho</th>
                  <th className="px-4">Đánh giá</th>
                  <th className="px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const rating = p.rating || 4.5;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors h-14">
                      <td className="px-6">
                        <img 
                          src={p.images?.[0] || "/placeholder.png"} 
                          alt={p.name}
                          className="w-9 h-9 rounded-lg object-cover"
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                      </td>
                      <td className="px-4 font-bold text-slate-900 dark:text-white max-w-[300px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-4 font-medium text-slate-500">{p.category_id?.name || "Khác"}</td>
                      <td className="px-4 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(p.price)}</td>
                      <td className="px-4 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock > 10 
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                            : p.stock > 0 
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" 
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 font-bold flex items-center gap-1 h-14">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span>{rating.toFixed(1)}</span>
                      </td>
                      <td className="px-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => navigate(`/product/${p.slug}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProductConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        selectedProduct={productToDelete}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
};

export default ProductsPage;
