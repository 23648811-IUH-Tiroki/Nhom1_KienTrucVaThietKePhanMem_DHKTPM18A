import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import slugify from "slugify";
import { createCategory } from "../services/categoryService";

const ProductForm = ({ product, categories, onSubmit, onCancel, onCategoryCreated }) => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categorySelection, setCategorySelection] = useState(
    product?.category_id?._id || product?.category_id || ""
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("KHÁC");

  useEffect(() => {
    setImages(product?.images || []);
    setName(product?.name || "");
    setSlug(product?.slug || "");
    setCategorySelection(product?.category_id?._id || product?.category_id || "");
    setNewImageUrl("");
    setNewCategoryName("");
    setNewCategoryType("KHÁC");
  }, [product]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      if (imageUrl && !images.includes(imageUrl)) {
        setImages((prev) => [...prev, imageUrl]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddImage = () => {
    const trimmedUrl = newImageUrl.trim();
    if (trimmedUrl) {
      if (!images.includes(trimmedUrl)) {
        setImages([...images, trimmedUrl]);
      }
      setNewImageUrl("");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());

    let categoryId = categorySelection || productData.category_id;
    if (categoryId === "other") {
      if (!newCategoryName.trim()) {
        toast.error("Vui lòng nhập tên danh mục mới");
        return;
      }
      try {
        const response = await createCategory({
          name: newCategoryName.trim(),
          description: `Danh mục ${newCategoryName.trim()}`,
          image: "",
          type: newCategoryType,
          slug_type: slugify(newCategoryType, { lower: true, strict: true }),
        });
        const newCategory = response.data;
        categoryId = newCategory._id;
        onCategoryCreated?.(newCategory);
      } catch (err) {
        console.error("Lỗi khi tạo danh mục mới:", err);
        toast.error("Không thể tạo danh mục mới");
        return;
      }
    }

    const slugifiedName = slugify(productData.name, { lower: true });
    setSlug(slugifiedName);

    onSubmit({
      ...productData,
      category_id: categoryId,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      images: images,
      slug: slugifiedName,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
          <input
            type="text"
            name="name"
            defaultValue={product?.name || ""}
            required
            className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Giá</label>
          <input
            type="number"
            name="price"
            step="0.01"
            defaultValue={product?.price || ""}
            required
            className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tồn kho
          </label>
          <input
            type="number"
            name="stock"
            defaultValue={product?.stock || ""}
            required
            className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Danh mục
          </label>
          <select
            name="category_id"
            value={categorySelection}
            onChange={(e) => {
              setCategorySelection(e.target.value);
              if (e.target.value !== "other") {
                setNewCategoryName("");
              }
            }}
            required
            className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
            <option value="other">Khác</option>
          </select>
          {categorySelection === "other" && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên danh mục mới
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên danh mục mới"
                  className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại danh mục
                </label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value)}
                  className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                >
                  <option value="KHÁC">KHÁC</option>
                  <option value="SHOP CHO CÚN">SHOP CHO CÚN</option>
                  <option value="SHOP CHO MÈO">SHOP CHO MÈO</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description || ""}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Hình ảnh sản phẩm
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Nhập URL hình ảnh hoặc để trống để chọn file"
            className="block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Thêm
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mt-2 space-y-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="flex items-center space-x-2">
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  className="h-10 w-10 object-cover rounded"
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/50")
                  }
                />
                <span className="text-sm text-gray-600 truncate max-w-xs">
                  {img}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
        >
          {product ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
