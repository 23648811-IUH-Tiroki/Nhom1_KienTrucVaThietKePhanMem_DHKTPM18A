import * as adminService from "../services/adminService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getUsers = async (req, res) => {
  try {
    const result = await adminService.getUsers(req.query);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const blockUser = async (req, res) => {
  try {
    const result = await adminService.blockUser(req.params.id, req.user?._id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const unblockUser = async (req, res) => {
  try {
    const result = await adminService.unblockUser(req.params.id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const result = await adminService.updateUserRole(req.params.id, req.body.role, req.user);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export default {
  getUsers,
  blockUser,
  unblockUser,
  updateUserRole,
};
