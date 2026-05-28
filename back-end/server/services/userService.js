import User from "../models/User.js";
import mongoose from "mongoose";
import { createServiceError } from "../utils/serviceError.js";

// ============ Helper Functions ============

/**
 * Build user statistics
 */
const buildUserStats = async () => {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "Active" }),
    User.countDocuments({ status: "Inactive" }),
  ]);

  return { total, active, inactive };
};

/**
 * Normalize gender value
 */
const normalizeGender = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (["nam", "male", "m", "true", "1"].includes(normalized)) return true;
  if (["nu", "nữ", "female", "f", "false", "0"].includes(normalized)) return false;
  return undefined;
};

const buildLegacyAddress = (payload) => {
  const parts = [
    payload.detailAddress,
    payload.ward,
    payload.district,
    payload.province,
  ].filter((part) => Boolean(String(part || "").trim()));

  return parts.join(", ");
};

const validateShippingAddressPayload = (payload) => {
  const errors = {};

  const receiverName = String(payload.receiverName || "").trim();
  const phone = String(payload.phone || "").trim();
  const province = String(payload.province || "").trim();
  const district = String(payload.district || "").trim();
  const ward = String(payload.ward || "").trim();
  const detailAddress = String(payload.detailAddress || "").trim();

  if (!receiverName) {
    errors.receiverName = "Tên người nhận không được để trống.";
  }

  if (!phone) {
    errors.phone = "Số điện thoại không được để trống.";
  }

  if (!province) {
    errors.province = "Tỉnh/Thành phố không được để trống.";
  }

  if (!district) {
    errors.district = "Quận/Huyện không được để trống.";
  }

  if (!ward) {
    errors.ward = "Phường/Xã không được để trống.";
  }

  if (!detailAddress) {
    errors.detailAddress = "Địa chỉ chi tiết không được để trống.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    sanitized: {
      receiverName,
      phone,
      province,
      district,
      ward,
      detailAddress,
    },
  };
};

// ============ Service Functions ============

/**
 * Get all users with pagination
 */
export const getAllUsers = async (params) => {
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments();
  const stats = await buildUserStats();

  return {
    users: users || [],
    total: total || 0,
    stats,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }
  return user;
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  const user = new User(userData);
  const newUser = await user.save();
  return newUser;
};

/**
 * Update user by ID
 */
export const updateUser = async (userId, updateData, currentUser) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  const allowedAdminFields = [
    "fullName",
    "phone",
    "role",
    "status",
    "avatar",
    "gender",
    "address",
    "shippingAddress",
    "birthDate",
    "sold",
  ];

  const allowedSelfFields = [
    "fullName",
    "phone",
    "address",
    "shippingAddress",
    "birthDate",
    "avatar",
    "gender",
  ];

  const updates = {};

  // Admin can update limited set of fields
  if (currentUser && currentUser.role === "admin") {
    Object.keys(updateData || {}).forEach((key) => {
      if (key === "email" || key === "password") return;
      if (allowedAdminFields.includes(key)) {
        updates[key] = updateData[key];
      }
    });
  } else {
    // Non-admin can only update their own allowed fields
    Object.keys(updateData || {}).forEach((key) => {
      if (key === "email" || key === "password" || key === "role" || key === "status") return;
      if (allowedSelfFields.includes(key)) {
        updates[key] = updateData[key];
      }
    });
  }

  if (Object.prototype.hasOwnProperty.call(updates, "gender")) {
    const normalizedGender = normalizeGender(updates.gender);
    if (typeof normalizedGender === "undefined") {
      delete updates.gender;
    } else {
      updates.gender = normalizedGender;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createServiceError("Không có trường hợp lệ để cập nhật hoặc bạn không có quyền.", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );

  if (!updatedUser) {
    throw createServiceError("User not found", 404);
  }

  return updatedUser;
};

/**
 * Delete user by ID
 */
export const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createServiceError("User not found", 404);
  }
  await User.deleteOne({ _id: userId });
  return { message: "User deleted" };
};

/**
 * Check duplicate email and phone
 */
export const checkDuplicate = async (checkData) => {
  const email = String(checkData?.email ?? "").trim().toLowerCase();
  const phoneRaw = checkData?.phone;
  const phone = typeof phoneRaw === "string" ? phoneRaw.trim() : phoneRaw;

  const duplicateEmail = email ? await User.findOne({ email }) : null;
  const duplicatePhone = phone ? await User.findOne({ phone }) : null;

  return {
    duplicateEmail: !!duplicateEmail,
    duplicatePhone: !!duplicatePhone,
    db: { name: mongoose.connection?.name, host: mongoose.connection?.host },
  };
};

/**
 * Get users with pagination
 */
export const getUsersWithPagination = async (params) => {
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments();
  const stats = await buildUserStats();

  return {
    users: users || [],
    total: total || 0,
    stats,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Search users with filters
 */
export const searchUsers = async (params) => {
  const { searchTerm = "", status = "all", role = "all" } = params;

  let query = {};

  if (searchTerm) {
    query.$or = [
      { fullName: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (status !== "all") {
    query.status = status;
  }

  if (role !== "all") {
    query.role = role;
  }

  const users = await User.find(query);
  const total = await User.countDocuments(query);
  const stats = await buildUserStats();

  return {
    users: users || [],
    total: total || 0,
    stats,
  };
};

/**
 * Get user profile
 */
export const getProfile = async (user) => {
  if (!user) {
    throw createServiceError("Không tồn tại user!", 404);
  }
  return user;
};

/**
 * Update user profile
 */
export const updateProfile = async (user, updateData) => {
  if (!user) {
    throw createServiceError("Không tồn tại user!", 404);
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(updateData, "fullName")) {
    updates.fullName = String(updateData.fullName || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "phone")) {
    const normalizedPhone = String(updateData.phone || "").trim();
    updates.phone = normalizedPhone || undefined;
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "address")) {
    updates.address = String(updateData.address || "").trim();
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "birthDate")) {
    if (!updateData.birthDate) {
      throw createServiceError("Ngày sinh không được để trống.", 400);
    }

    const parsedDate = new Date(updateData.birthDate);
    if (Number.isNaN(parsedDate.getTime())) {
      throw createServiceError("Ngày sinh không hợp lệ.", 400);
    }

    updates.birthDate = parsedDate;
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "gender")) {
    updates.gender = Boolean(updateData.gender);
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "avatar")) {
    updates.avatar = updateData.avatar;
  }

  Object.assign(user, updates);
  const updatedUser = await user.save();
  return updatedUser;
};

/**
 * Get shipping address
 */
export const getShippingAddress = async (user) => {
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  return {
    shippingAddress: user.shippingAddress || null,
    address: user.address || "",
  };
};

/**
 * Update shipping address
 */
export const updateShippingAddress = async (user, updateData = {}) => {
  if (!user) {
    throw createServiceError("User not found", 404);
  }

  const { isValid, errors, sanitized } = validateShippingAddressPayload(updateData || {});
  if (!isValid) {
    throw createServiceError("Dữ liệu không hợp lệ.", 400, { message: "Dữ liệu không hợp lệ.", errors });
  }

  const nextAddress = {
    ...sanitized,
    updatedAt: new Date(),
  };

  user.shippingAddress = nextAddress;
  user.address = buildLegacyAddress(nextAddress);

  const updatedUser = await user.save();

  return {
    shippingAddress: updatedUser.shippingAddress,
    address: updatedUser.address || "",
  };
};
