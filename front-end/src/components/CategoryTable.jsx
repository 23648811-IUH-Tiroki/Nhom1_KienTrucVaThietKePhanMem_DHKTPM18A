import { Pencil, Plus, Search, Trash } from "lucide-react";

const CategoryTable = ({
    categories,
    searchTerm,
    onSearchChange,
    typeFilter,
    onTypeChange,
    typeOptions,
    onCreate,
    onEdit,
    onDelete,
    formatDate,
    startIndex = 0,
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(event) => onSearchChange(event.target.value)}
                            className="block w-full h-10 rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <select
                        value={typeFilter}
                        onChange={(event) => onTypeChange(event.target.value)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 cursor-pointer"
                    >
                        <option value="">Tất cả loại</option>
                        {typeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={onCreate}
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm danh mục
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ảnh
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mô tả
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày tạo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">
                                    Chưa có danh mục nào
                                </td>
                            </tr>
                        ) : (
                            categories.map((category, index) => (
                                <tr key={category._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="h-10 w-10 rounded object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.src = "https://via.placeholder.com/40";
                                                }}
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                        {category.description || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate ? formatDate(category.createdAt) : (category.createdAt || "-")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(category)}
                                            className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(category)}
                                            className="text-red-600 hover:text-red-900 cursor-pointer"
                                        >
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryTable;
