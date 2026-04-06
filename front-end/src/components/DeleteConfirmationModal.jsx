import { Trash2 } from "lucide-react";
import Modal from "./Modal";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  selectedUser,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xoá tài khoản"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-start p-5 bg-red-50 rounded-lg border border-red-200">
          <div className="mr-4 mt-1 bg-red-100 p-3 rounded-full cursor-pointer">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800 text-lg mb-2">
              Xoá tài khoản người dùng
            </h3>
            <p className="text-red-600 leading-relaxed">
              Bạn có chắc chắn muốn xoá{" "}
              <strong>{selectedUser?.fullName}</strong>?<br />
              Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ
              bị xoá vĩnh viễn.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium cursor-pointer"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md cursor-pointer"
          >
            Xoá vĩnh viễn
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
