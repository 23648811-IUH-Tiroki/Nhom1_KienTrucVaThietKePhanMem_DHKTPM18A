import { useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { toast } from "react-toastify";

const CategoryForm = ({ category, onSubmit, onCancel }) => {
    const fileInputRef = useRef(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [slug, setSlug] = useState("");
    const [type, setType] = useState("");
    const [slugType, setSlugType] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [slugTypeTouched, setSlugTypeTouched] = useState(false);

    useEffect(() => {
        setName(category?.name || "");
        setDescription(category?.description || "");
        setImage(category?.image || "");
        setSlug(category?.slug || "");
        setType(category?.type || "");
        setSlugType(category?.slug_type || "");
        setSlugTouched(false);
        setSlugTypeTouched(false);
    }, [category]);

    useEffect(() => {
        if (!slugTouched) {
            setSlug(slugify(name || "", { lower: true, strict: true }));
        }
    }, [name, slugTouched]);

    useEffect(() => {
        if (!slugTypeTouched) {
            setSlugType(slugify(type || "", { lower: true, strict: true }));
        }
    }, [type, slugTypeTouched]);

    const handleAddImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result || "");
        };
        reader.readAsDataURL(file);
        event.target.value = "";
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedType = type.trim();
        const slugValue = (slug || slugify(trimmedName, { lower: true, strict: true }))
            .trim();
        const slugTypeValue = (
            slugType || slugify(trimmedType, { lower: true, strict: true })
        ).trim();

        if (!trimmedName) {
            toast.error("Tên danh mục là bắt buộc");
            return;
        }
        if (!trimmedType) {
            toast.error("Loại danh mục là bắt buộc");
            return;
        }
        if (!slugValue) {
            toast.error("Slug là bắt buộc");
            return;
        }
        if (!slugTypeValue) {
            toast.error("Slug type là bắt buộc");
            return;
        }

        onSubmit({
            name: trimmedName,
            description: description.trim(),
            image: image.trim(),
            slug: slugValue,
            type: trimmedType,
            slug_type: slugTypeValue,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Tên danh mục
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                        className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại</label>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        required
                        className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                    >
                        <option value="">Chọn loại</option>
                        <option value="SHOP CHO CÚN">SHOP CHO CÚN</option>
                        <option value="SHOP CHO MÈO">SHOP CHO MÈO</option>
                        <option value="KHÁC">KHÁC</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(event) => {
                            setSlug(event.target.value);
                            setSlugTouched(true);
                        }}
                        required
                        className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug type</label>
                    <input
                        type="text"
                        value={slugType}
                        onChange={(event) => {
                            setSlugType(event.target.value);
                            setSlugTypeTouched(true);
                        }}
                        required
                        className="mt-1 block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                <div className="mt-1 flex items-center space-x-2">
                    <input
                        type="text"
                        value={image}
                        onChange={(event) => setImage(event.target.value)}
                        placeholder="Nhập URL hình ảnh hoặc chọn file"
                        className="block w-full h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleAddImage}
                        className="inline-flex items-center whitespace-nowrap px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        Chọn file
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {image && (
                    <div className="mt-3 flex items-center space-x-3">
                        <img
                            src={image}
                            alt="Preview"
                            className="h-14 w-14 rounded object-cover border"
                            onError={(event) => {
                                event.currentTarget.src = "https://via.placeholder.com/64";
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setImage("")}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            Xóa hình
                        </button>
                    </div>
                )}
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
                    {category ? "Cập nhật" : "Tạo mới"}
                </button>
            </div>
        </form>
    );
};

export default CategoryForm;
