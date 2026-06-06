import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Image, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import slugify from "slugify";
import {
  fetchProducts as fetchProductsRequest,
  createProduct as createProductRequest,
  updateProduct as updateProductRequest
} from "../../services/productService";
import {
  fetchCategories as fetchCategoriesRequest,
  createCategory as createCategoryRequest
} from "../../services/categoryService";

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // present only in edit mode
  const isEditMode = !!id;

  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [categorySelection, setCategorySelection] = useState("");
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [slug, setSlug] = useState("");

  // Inline Category states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("KHÁC");

  // Load categories and product details (if editing)
  const loadFormData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch categories
      const catRes = await fetchCategoriesRequest();
      setCategories(catRes.data || []);

      if (isEditMode) {
        // Fetch products and find the matching one
        const prodRes = await fetchProductsRequest();
        const product = (prodRes.data || []).find(p => p._id === id);
        
        if (!product) {
          toast.error("Không tìm thấy sản phẩm cần chỉnh sửa");
          navigate("/admin/products");
          return;
        }

        // Populate fields
        setName(product.name || "");
        setPrice(product.price || "");
        setStock(product.stock || "");
        setDescription(product.description || "");
        setCategorySelection(product.category_id?._id || product.category_id || "");
        setImages(product.images || []);
        setSlug(product.slug || "");
      }
    } catch (err) {
      console.error("Failed to load form details:", err);
      toast.error("Không thể tải thông tin biểu mẫu");
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  // Sync Slug with name during typing if not editing or manually overridden
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      setSlug(slugify(val, { lower: true, strict: true }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      if (imageUrl && !images.includes(imageUrl)) {
        setImages((prev) => [...prev, imageUrl]);
        toast.success("Đã tải ảnh lên thành công");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    const trimmedUrl = newImageUrl.trim();
    if (trimmedUrl) {
      if (!images.includes(trimmedUrl)) {
        setImages((prev) => [...prev, trimmedUrl]);
        toast.success("Đã thêm liên kết ảnh");
      }
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalCategoryId = categorySelection;

      // Inline category creation if "other" is selected
      if (categorySelection === "other") {
        if (!newCategoryName.trim()) {
          toast.error("Vui lòng nhập tên danh mục mới");
          setIsSubmitting(false);
          return;
        }

        const catResponse = await createCategoryRequest({
          name: newCategoryName.trim(),
          description: `Danh mục ${newCategoryName.trim()}`,
          image: "",
          type: newCategoryType,
          slug_type: slugify(newCategoryType, { lower: true, strict: true }),
        });
        
        const newCategory = catResponse.data;
        finalCategoryId = newCategory._id;
        toast.success(`Đã thêm danh mục mới: ${newCategory.name}`);
      }

      const productPayload = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: finalCategoryId,
        description: description.trim(),
        images: images,
        slug: slug || slugify(name, { lower: true, strict: true })
      };

      if (isEditMode) {
        await updateProductRequest(id, productPayload);
        toast.success("Cập nhật thông tin sản phẩm thành công!");
      } else {
        await createProductRequest(productPayload);
        toast.success("Thêm mới sản phẩm thành công!");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate("/admin/products")}
          className="p-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-xs text-slate-500">
            {isEditMode ? "Cập nhật các thông tin chi tiết cho sản phẩm đang bày bán" : "Nhập đầy đủ thông tin để thêm mặt hàng mới"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column - Main Details */}
            <div className="md:col-span-2 bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin Cơ bản</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Tên sản phẩm *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Ví dụ: Thức ăn cho mèo Royal Canin"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Giá bán * (VND)</label>
                    <input 
                      type="number" 
                      required
                      min="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ví dụ: 150000"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Tồn kho ban đầu *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="Ví dụ: 50"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Mô tả sản phẩm *</label>
                  <textarea 
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về thành phần, hạn sử dụng, công dụng và hướng dẫn bảo quản..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Category & Images */}
            <div className="space-y-6">
              
              {/* Category Selector */}
              <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục & Định danh</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Danh mục chủ quản *</label>
                    <select
                      required
                      value={categorySelection}
                      onChange={(e) => setCategorySelection(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                      <option value="other">Tạo danh mục mới (+)</option>
                    </select>
                  </div>

                  {categorySelection === "other" && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-3 border border-dashed border-slate-200 dark:border-slate-800 animate-fade-in">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tên danh mục mới</label>
                        <input 
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Ví dụ: Đồ chơi"
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Loại cửa hàng</label>
                        <select
                          value={newCategoryType}
                          onChange={(e) => setNewCategoryType(e.target.value)}
                          className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs cursor-pointer focus:outline-none"
                        >
                          <option value="KHÁC">KHÁC</option>
                          <option value="SHOP CHO CÚN">SHOP CHO CÚN</option>
                          <option value="SHOP CHO MÈO">SHOP CHO MÈO</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Slug URL</label>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="duong-dan-san-pham"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Images Manager */}
              <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hình ảnh (Ít nhất 1 ảnh)</h3>
                
                <div className="space-y-3">
                  {/* URL image loader */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Liên kết hình ảnh..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>

                  {/* File Uploader */}
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-12 rounded-xl border border-dashed border-slate-350 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                    >
                      <Image size={15} />
                      <span>Chọn file từ máy tính</span>
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Previews grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 overflow-hidden">
                        <img 
                          src={img} 
                          alt="product preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = "/placeholder.png"; }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <Save size={14} />
              <span>{isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default ProductFormPage;
