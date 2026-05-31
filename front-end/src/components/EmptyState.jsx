import { User, UserPlus } from "lucide-react";

const EmptyState = ({ onAddUser }) => (
  <div className="text-center py-12">
    <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
      <User size={32} className="text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">
      Chưa có người dùng nào
    </h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Bắt đầu thêm người dùng vào hệ thống của bạn để quản lý thông tin và quyền
      của họ.
    </p>
    <button
      onClick={onAddUser}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
    >
      <UserPlus size={18} className="mr-2" />
      Thêm người dùng đầu tiên
    </button>
  </div>
);

export default EmptyState;
