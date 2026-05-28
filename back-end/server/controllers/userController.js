import * as userService from "../services/userService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: error.message,
      users: [],
      total: 0,
      stats: { total: 0, active: 0, inactive: 0 },
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return sendControllerError(res, error, 404);
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return sendControllerError(res, error, 400);
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(
      req.params.id,
      req.body,
      req.user
    );
    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return sendControllerError(res, error, 400);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return res.json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    return sendControllerError(res, error, 500);
  }
};

export const checkDuplicate = async (req, res) => {
  try {
    const result = await userService.checkDuplicate(req.body);
    return res.json(result);
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return sendControllerError(res, error, 500);
  }
};

export const getUsersWithPagination = async (req, res) => {
  try {
    const result = await userService.getUsersWithPagination(req.query);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching users with pagination:", error);
    return res.status(500).json({
      message: error.message,
      users: [],
      total: 0,
      stats: { total: 0, active: 0, inactive: 0 },
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const result = await userService.searchUsers(req.query);
    return res.json(result);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      message: error.message,
      users: [],
      total: 0,
      stats: { total: 0, active: 0, inactive: 0 },
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await userService.getProfile(req.user);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return sendControllerError(res, error, 404);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.user, req.body);
    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return sendControllerError(res, error, 400);
  }
};

export const getShippingAddress = async (req, res) => {
  try {
    const result = await userService.getShippingAddress(req.user);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching shipping address:", error);
    return sendControllerError(res, error, 404);
  }
};

export const updateShippingAddress = async (req, res) => {
  try {
    const result = await userService.updateShippingAddress(req.user, req.body);
    return res.json(result);
  } catch (error) {
    console.error("Error updating shipping address:", error);
    return sendControllerError(res, error, 400);
  }
};
