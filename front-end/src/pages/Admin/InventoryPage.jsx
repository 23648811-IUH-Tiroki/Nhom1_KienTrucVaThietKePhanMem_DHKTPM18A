import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Upload,
  Pencil,
  Trash2,
  Eye,
  Boxes,
  AlertTriangle,
  RefreshCw,
  PlusCircle
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchProducts as fetchProductsRequest,
  fetchProductsByCategoryId as fetchProductsByCategoryIdRequest,
  searchProductsByQuery as searchProductsByQueryRequest,
  deleteProduct as deleteProductRequest,
  updateProduct as updateProductRequest
} from "../../services/productService";
import { fetchCategories as fetchCategoriesRequest } from "../../services/categoryService";
import DeleteProductConfirmationModal from "../../components/DeleteProductConfirmationModal";

const InventoryPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, in_stock, low_stock, out_of_stock
  const [activeDropdown, setActiveDropdown] = useState(null); // holds product._id of active row menu
  
  // Modals / Restock state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [isRestocking, setIsRestocking] = useState(false);

  const dropdownRef = useRef(null);

  // Fetch lists
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;
      if (categoryFilter) {
        response = await fetchProductsByCategoryIdRequest(categoryFilter);
      } else {
        response = await fetchProductsRequest();
      }
      
      let data = response.data || [];
      
      // Client-side stock status filtering
      if (stockFilter === "in_stock") {
        data = data.filter(p => p.stock > 10);
      } else if (stockFilter === "low_stock") {
        data = data.filter(p => p.stock > 0 && p.stock <= 10);
      } else if (stockFilter === "out_of_stock") {
        data = data.filter(p => p.stock === 0);
      }

      // Client-side search if needed (API search is also supported)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        data = data.filter(p => 
          p.name.toLowerCase().includes(query) || 
          (p.description && p.description.toLowerCase().includes(query))
        );
      }

      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Lỗi khi tải danh mục sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, stockFilter, searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetchCategoriesRequest();
      setCategories(response.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Click outside menu closer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(val);
  };

  // derived status helper
  const getStockStatus = (stock) => {
    if (stock > 10) return { label: "Còn hàng", class: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900" };
    if (stock > 0) return { label: "Sắp hết", class: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900" };
    return { label: "Hết hàng", class: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900" };
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProduct) return;
    setIsRestocking(true);
    try {
      const updatedStock = (restockProduct.stock || 0) + parseInt(restockQuantity);
      await updateProductRequest(restockProduct._id, {
        ...restockProduct,
        stock: updatedStock
      });
      toast.success(`Đã nhập thêm hàng thành công! Số lượng mới: ${updatedStock}`);
      setRestockProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error("Không thể cập nhật số lượng tồn kho");
      console.error(err);
    } finally {
      setIsRestocking(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = [
      ["Ten san pham", "SKU", "Danh muc", "Gia", "Ton kho"],
      ...products.map((p) => [
        p.name.replace(/,/g, ""),
        `PET-${p._id.slice(-6).toUpperCase()}`,
        p.category_id?.name || "Khac",
        p.price,
        p.stock
      ])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Xuất CSV kho hàng thành công!");
  };

  // Delete product action handlers
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteConfirmation = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductRequest(productToDelete._id);
      toast.success("Sản phẩm đã được xóa thành công");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Xóa sản phẩm thất bại");
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Kho hàng</h1>
          <p className="text-xs text-slate-500">Xem và quản lý lượng hàng dự trữ, nhập kho và kiểm kê</p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Download size={14} />
            <span>Xuất CSV</span>
          </button>
          <button 
            onClick={() => navigate("/admin/products/new")}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Plus size={14} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center shadow-xs">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Tìm theo tên sản phẩm, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
          />
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex flex-wrap gap-2 items-center">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả Danh mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="in_stock">Còn hàng (&gt;10)</option>
            <option value="low_stock">Sắp hết (1-10)</option>
            <option value="out_of_stock">Hết hàng (0)</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
              setStockFilter("all");
            }}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col justify-center items-center gap-3">
            <RefreshCw size={24} className="text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Đang tải dữ liệu tồn kho...</span>
          </div>
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300 font-semibold h-11">
                  <th className="px-6 w-20">Ảnh</th>
                  <th className="px-4">Tên sản phẩm</th>
                  <th className="px-4">SKU</th>
                  <th className="px-4">Danh mục</th>
                  <th className="px-4">Giá</th>
                  <th className="px-4">Tồn kho</th>
                  <th className="px-4">Trạng thái</th>
                  <th className="px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/60">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy sản phẩm nào trong kho khớp bộ lọc
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const status = getStockStatus(p.stock);
                    const sku = `PET-${p._id.slice(-6).toUpperCase()}`;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors h-14">
                        <td className="px-6">
                          <img 
                            src={p.images?.[0] || "/placeholder.png"} 
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                          />
                        </td>
                        <td className="px-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate" title={p.name}>
                          {p.name}
                        </td>
                        <td className="px-4 font-mono font-medium text-slate-400">{sku}</td>
                        <td className="px-4 font-medium text-slate-600 dark:text-slate-300">{p.category_id?.name || "Khác"}</td>
                        <td className="px-4 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(p.price)}</td>
                        <td className="px-4 font-semibold">{p.stock}</td>
                        <td className="px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        
                        <td className="px-6 text-right relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === p._id ? null : p._id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          
                          {activeDropdown === p._id && (
                            <div 
                              ref={dropdownRef}
                              className="absolute right-6 mt-1 w-44 bg-white dark:bg-[#1e293b] rounded-xl shadow-admin-card border border-slate-100 dark:border-slate-800 py-1.5 z-40 text-left animate-fade-in"
                            >
                              <button 
                                onClick={() => {
                                  setActiveDropdown(null);
                                  navigate(`/product/${p.slug}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Eye size={13} className="text-slate-400" />
                                <span>Xem sản phẩm</span>
                              </button>
                              
                              <button 
                                onClick={() => {
                                  setActiveDropdown(null);
                                  navigate(`/admin/products/${p._id}/edit`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <Pencil size={13} className="text-slate-400" />
                                <span>Sửa thông tin</span>
                              </button>

                              <button 
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setRestockProduct(p);
                                  setRestockQuantity(10);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              >
                                <PlusCircle size={13} className="text-slate-400" />
                                <span>Nhập thêm hàng</span>
                              </button>

                              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                              <button 
                                onClick={() => handleDeleteClick(p)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer font-medium"
                              >
                                <Trash2 size={13} />
                                <span>Xóa sản phẩm</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Prompt Modal */}
      {restockProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500">
                <Boxes size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nhập hàng vào kho</h3>
                <p className="text-[10px] text-slate-400">Sản phẩm: {restockProduct.name}</p>
              </div>
            </div>
            
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Số lượng nhập thêm</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-center font-bold text-slate-850"
                />
              </div>

              <div className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl flex gap-1.5">
                <AlertTriangle size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <span>Số lượng tồn kho hiện tại: <strong>{restockProduct.stock || 0}</strong>. Sau khi hoàn tất sẽ tự động cộng dồn.</span>
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-650 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={isRestocking}
                  className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  {isRestocking ? "Đang lưu..." : "Xác nhận nhập"}
                </button>
              </div>
            </form>
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
        onConfirm={handleDeleteConfirmation}
      />

    </div>
  );
};

export default InventoryPage;
