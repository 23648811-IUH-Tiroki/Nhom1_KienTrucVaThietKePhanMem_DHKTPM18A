import axiosInstance from "../utils/axiosInstance";

export const fetchUsers = (params) =>
  axiosInstance.get("/api/admin/users", { params });

export const blockUserRequest = (id) => axiosInstance.patch(`/api/admin/users/block/${id}`);
export const unblockUserRequest = (id) => axiosInstance.patch(`/api/admin/users/unblock/${id}`);
export const updateUserRoleRequest = (id, role) => axiosInstance.patch(`/api/admin/users/role/${id}`, { role });

export default {
  fetchUsers,
  blockUserRequest,
  unblockUserRequest,
  updateUserRoleRequest,
};
