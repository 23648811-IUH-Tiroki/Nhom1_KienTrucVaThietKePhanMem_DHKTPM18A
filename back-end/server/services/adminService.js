import mongoose from "mongoose";
import User from "../models/User.js";
import { createServiceError } from "../utils/serviceError.js";

const buildQuery = ({ searchTerm, role }) => {
  const query = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, "i");
    query.$or = [{ fullName: re }, { email: re }, { phone: re }];
  }

  if (role && role !== "all") {
    query.role = role;
  }

  return query;
};

export const getUsers = async (params = {}) => {
  const { page = 1, limit = 10, search = "", role = "all" } = params;
  const skip = (Number(page) - 1) * Number(limit);
  const query = buildQuery({ searchTerm: search, role });

  const users = await User.find(query)
    .select("fullName email phone role status isBlocked avatar createdAt")
    .skip(skip)
    .limit(Number.parseInt(limit, 10))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const blockUser = async (targetUserId, currentUserId) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw createServiceError("User id invalid", 400);
  }

  if (String(currentUserId) === String(targetUserId)) {
    throw createServiceError("Cannot block yourself", 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  user.isBlocked = true;
  await user.save();

  return { message: "User blocked", userId: targetUserId };
};

export const unblockUser = async (targetUserId) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw createServiceError("User id invalid", 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  user.isBlocked = false;
  await user.save();

  return { message: "User unblocked", userId: targetUserId };
};

export const updateUserRole = async (targetUserId, role, currentUser) => {
  if (!mongoose.isValidObjectId(targetUserId)) {
    throw createServiceError("User id invalid", 400);
  }

  if (!role) {
    throw createServiceError("Role is required", 400);
  }

  const allowedRoles = ["user", "staff", "admin", "superadmin"];
  if (!allowedRoles.includes(role)) {
    throw createServiceError("Invalid role", 400);
  }

  if ((role === "admin" || role === "superadmin") && currentUser?.role !== "superadmin") {
    throw createServiceError("Only super admin can assign admin role", 403);
  }

  if (currentUser?.role === "admin" && role === "admin") {
    throw createServiceError("Admin cannot assign admin role", 403);
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  user.role = role;
  await user.save();

  return { message: "Role updated", userId: targetUserId, role };
};

export default {
  getUsers,
  blockUser,
  unblockUser,
  updateUserRole,
};