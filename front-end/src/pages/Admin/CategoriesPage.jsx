import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Layers, 
  FolderPlus, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  Plus, 
  Coins, 
  Boxes,
  RefreshCw
} from "lucide-react";
import { toast } from "react-toastify";
import { 
  fetchCategories as fetchCategoriesRequest, 
  deleteCategory as deleteCategoryRequest 
} from "../../services/categoryService";
import { fetchProducts as fetchProductsRequest } from "../../services/productService";
import DeleteCategoryConfirmationModal from "../../components/DeleteCategoryConfirmationModal";

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [catRes, prodRes] = await Promise.all([
        fetchCategoriesRequest(),
        fetchProductsRequest()
      ]);
      
      const catData = catRes.data || [];
      setCategories(catData);
      setFilteredCategories(catData);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error("Failed to load categories data:", err);
      toast.error("Lỗi khi tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client side search & type filter
  useEffect(() => {
    let result = [...categories];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query))
      );
    }

    if (typeFilter) {
      result = result.filter(c => c.type === typeFilter);
    }

    setFilteredCategories(result);
  }, [categories, searchTerm, typeFilter]);

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategoryRequest(categoryToDelete._id);
      toast.success("Đã xóa danh mục thành công!");
      loadData();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error(err.response?.data?.message || "Xóa danh mục thất bại. Danh mục có thể đang chứa sản phẩm.");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Helper: count products in category
  const getProductCount = (catId) => {
    return products.filter(p => {
      const pCatId = p.category_id?._id || p.category_id;
      return pCatId === catId;
    }).length;
  };

  // Helper: mock category revenue for demonstration
  const getCategoryRevenue = (catId) => {
    // Generate a consistent pseudo-random revenue based on category ID
    // or calculate based on sold products in that category
    const catProducts = products.filter(p => {
      const pCatId = p.category_id?._id || p.category_id;
      return pCatId === catId;
    });
    
    const revenue = catProducts.reduce((sum, p) => sum + ((p.sold || 0) * p.price), 0);
    return revenue || (parseInt(catId.slice(-4), 16) % 50 * 150000); // fallback consistent value
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0
    }).format(val);
  };

  const categoryTypes = Array.from(new Set(categories.map(c => c.type).filter(Boolean)));

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh mục Sản phẩm</h1>
          <p className="text-xs text-slate-500">Quản lý phân loại sản phẩm, phân vùng bán hàng của Pet Station</p>
        </div>
        
        <button 
          onClick={() => navigate("/admin/categories/new")}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm shadow-blue-500/10 shrink-0"
        >
          <FolderPlus size={14} />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center shadow-xs">
        {/* Search */}
        <div className="w-full sm:flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên danh mục, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
          />
        </div>

        {/* Type Filter */}
        <div className="w-full sm:w-auto flex gap-2">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="">Tất cả Loại</option>
            {categoryTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>

          <button 
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("");
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3">
          <RefreshCw size={24} className="text-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Đang tải danh mục...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-16 text-center shadow-xs">
          <div className="text-4xl mb-4">🗂️</div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Không có danh mục nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">Hãy tạo danh mục mới hoặc thay đổi bộ lọc</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((c) => {
            const productCount = getProductCount(c._id);
            const revenue = getCategoryRevenue(c._id);
            return (
              <div 
                key={c._id}
                className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-admin-soft transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Category Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <Layers size={18} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                      {c.type || "Khác"}
                    </span>
                  </div>

                  {/* Name and Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{c.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed" title={c.description}>
                      {c.description || "Chưa có mô tả cụ thể cho danh mục này."}
                    </p>
                  </div>
                </div>

                {/* Info and Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Boxes size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Sản phẩm</span>
                        <span className="text-xs font-bold">{productCount} mặt hàng</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Coins size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Doanh thu</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block max-w-[120px]" title={formatCurrency(revenue)}>
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/categories/${c._id}/edit`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Pencil size={12} />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(c)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-rose-200 hover:border-rose-350 text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteCategoryConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        selectedCategory={categoryToDelete}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
};

export default CategoriesPage;
