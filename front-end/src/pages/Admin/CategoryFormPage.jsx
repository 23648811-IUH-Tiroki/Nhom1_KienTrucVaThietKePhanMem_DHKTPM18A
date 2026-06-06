import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import slugify from "slugify";
import {
  fetchCategoryById as fetchCategoryByIdRequest,
  createCategory as createCategoryRequest,
  updateCategory as updateCategoryRequest
} from "../../services/categoryService";

const CategoryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("KHÁC");
  const [slugType, setSlugType] = useState("");

  const loadCategoryDetails = useCallback(async () => {
    if (!isEditMode) return;
    try {
      setIsLoading(true);
      const res = await fetchCategoryByIdRequest(id);
      const cat = res.data || {};
      
      setName(cat.name || "");
      setDescription(cat.description || "");
      setImage(cat.image || "");
      setType(cat.type || "KHÁC");
      setSlugType(cat.slug_type || "");
    } catch (err) {
      console.error("Failed to load category:", err);
      toast.error("Không tìm thấy thông tin danh mục cần sửa");
      navigate("/admin/categories");
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    loadCategoryDetails();
  }, [loadCategoryDetails]);

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setType(val);
    // Auto-map slug_type based on selection
    setSlugType(slugify(val, { lower: true, strict: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng điền tên danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        type: type,
        slug_type: slugType || slugify(type, { lower: true, strict: true })
      };

      if (isEditMode) {
        await updateCategoryRequest(id, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createCategoryRequest(payload);
        toast.success("Thêm danh mục mới thành công!");
      }

      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header and Back navigation */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate("/admin/categories")}
          className="p-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h1>
          <p className="text-xs text-slate-500">
            {isEditMode ? "Cập nhật tên, thể loại và mô tả chi tiết của danh mục hàng" : "Nhập đầy đủ thông tin để định nghĩa danh mục hàng mới"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Tên danh mục *</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Đồ ăn hạt, Cát vệ sinh, Đồ chơi..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Loại cửa hàng *</label>
                <select
                  required
                  value={type}
                  onChange={handleTypeChange}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="KHÁC">KHÁC</option>
                  <option value="SHOP CHO CÚN">SHOP CHO CÚN</option>
                  <option value="SHOP CHO MÈO">SHOP CHO MÈO</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Định danh URL (Slug Type)</label>
                <input 
                  type="text" 
                  readOnly
                  value={slugType}
                  placeholder="shop-cho-cun / shop-cho-meo"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Đường dẫn hình ảnh danh mục</label>
              <input 
                type="text" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Ví dụ: /images/categories/cat-food.png (tùy chọn)"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Mô tả danh mục</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt về các nhóm sản phẩm thuộc danh mục này..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
              />
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
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
              <span>{isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật danh mục" : "Tạo danh mục"}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

export default CategoryFormPage;
