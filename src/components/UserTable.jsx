import ActionButton from './ActionButton'
import Badge from './Badge';
import UserAvatar from './UserAvatar';
import {User, Edit, Trash2} from "lucide-react";

const UserTable = ({ users, onView, onEdit, onDelete }) => (
  <div className="overflow-x-auto relative bg-white rounded-lg">
    <table className="w-full text-sm text-left">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-t-lg">
        <tr>
          <th scope="col" className="py-3.5 px-6">
            Người dùng
          </th>
          <th scope="col" className="py-3.5 px-6">
            Email
          </th>
          <th scope="col" className="py-3.5 px-6">
            Số điện thoại
          </th>
          <th scope="col" className="py-3.5 px-6">
            Địa chỉ
          </th>
          <th scope="col" className="py-3.5 px-6">
            Vai trò
          </th>
          <th scope="col" className="py-3.5 px-6 text-right">
            Thao tác
          </th>
        </tr>
      </thead>
      <tbody>
        {users.length > 0 ? (
          users.map((user) => (
            <tr
              key={user._id}
              className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <UserAvatar src={user.avatar} alt={user.fullName} />
                  <div>
                    <div className="font-medium dark:text-gray-400">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.gender}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-gray-600">{user.email}</td>
              <td className="py-4 px-6 text-gray-600">{user.phone}</td>
              <td className="py-4 px-6 text-gray-600">{user.address}</td>
              <td className="py-4 px-6">
                <Badge
                  type={user.role}
                  text={user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                />
              </td>
              <td className="py-4 px-6">
                <div className="flex space-x-1 justify-end">
                  <ActionButton
                    icon={User}
                    onClick={() => onView(user)}
                    color="blue"
                  />
                  <ActionButton
                    icon={Edit}
                    onClick={() => onEdit(user)}
                    color="yellow"
                  />
                  <ActionButton
                    icon={Trash2}
                    onClick={() => onDelete(user)}
                    color="red"
                  />
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="py-8 text-center text-gray-500">
              Không tìm thấy người dùng nào
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default UserTable;
