import { useState } from "react";
import slugify from "slugify";

const ProductForm = ({ product, categories, onSubmit, onCancel }) => {
  const [images, setImages] = useState(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    const slugifiedName = slugify(productData.name, { lower: true });
    setSlug(slugifiedName);

    onSubmit({
      ...productData,
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
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Danh mục
          </label>
          <select
            name="category_id"
            defaultValue={product?.category_id || ""}
            required
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description || ""}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            placeholder="Nhập URL hình ảnh"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Thêm
          </button>
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
