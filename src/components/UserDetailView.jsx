import {
  User,
  Package,
  Clock,
  LogOut,
  Edit,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
} from "lucide-react";

import Badge from './Badge';
import UserAvatar from "./UserAvatar";

const UserDetailView = ({ user, onBack, onEdit }) => {

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
          >
            <ChevronLeft size={27} />
          </button>
          <h2 className="text-xl font-semibold text-gray-700">
            Thông tin cá nhân
          </h2>
        </div>
        <Badge
          type={user.role}
          text={user.role === "admin" ? "Quản trị viên" : "Người dùng"}
        />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
          <div className="relative mb-4">
            <UserAvatar src={user.avatar} alt={user.fullName} size="lg" />
            <button className="absolute bottom-0 right-0 bg-gray-700 text-white p-1.5 rounded-full shadow-lg hover:bg-[#d06a03] transition cursor-pointer">
              <Edit size={16} />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user.fullName}
          </h3>
          <p className="text-gray-700 flex items-center mt-1">
            <Mail size={14} className="mr-1" /> {user.email}
          </p>
          <p className="text-gray-700 flex items-center mt-1">
            <Phone size={14} className="mr-1" /> {user.phone}
          </p>
        </div>

        <div className="md:w-2/3 md:pl-8">
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <User size={18} className="mr-2 text-gray-700" />
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Họ và tên</p>
                <p className="font-medium text-gray-800">{user.fullName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Ngày sinh</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <Calendar size={14} className="mr-1 text-gray-700" />{" "}
                  {formatDate(user.birthDate)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Giới tính</p>
                <p className="font-medium text-gray-800">
                  {user.gender == true ? "Nam" : "Nữ"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Vai trò</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <ShieldCheck size={14} className="mr-1 text-gray-700" />{" "}
                  {user.role == "user" ? "Người dùng" : "Quản trị viên"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <MapPin size={18} className="mr-2 text-gray-700" />
              Thông tin liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">Số điện thoại</p>
                <p className="font-medium text-gray-800">{user.phone}</p>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-sm text-gray-700">Địa chỉ</p>
                <p className="font-medium text-gray-800">{user.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => onEdit(user)}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Edit size={16} className="mr-2" />
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailView;
