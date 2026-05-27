import User from "../models/User.js";
import mongoose from "mongoose";

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

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "all" } = req.query;
    const skip = (page - 1) * limit;
    const query = buildQuery({ searchTerm: search, role });

    const users = await User.find(query)
      .select("fullName email phone role status isBlocked avatar createdAt")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({ users, total, currentPage: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "User id invalid" });
    if (String(req.user._id) === String(id)) return res.status(400).json({ message: "Cannot block yourself" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();
    return res.json({ message: "User blocked", userId: id });
  } catch (err) {
    console.error("blockUser error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "User id invalid" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();
    return res.json({ message: "User unblocked", userId: id });
  } catch (err) {
    console.error("unblockUser error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "User id invalid" });
    if (!role) return res.status(400).json({ message: "Role is required" });

    const allowedRoles = ["user", "staff", "admin", "superadmin"];
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

    // Only superadmin can assign admin or superadmin
    if ((role === "admin" || role === "superadmin") && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only super admin can assign admin role" });
    }

    // Admin can toggle user<->staff
    if (req.user.role === "admin" && role === "admin") {
      return res.status(403).json({ message: "Admin cannot assign admin role" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    return res.json({ message: "Role updated", userId: id, role });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  getUsers,
  blockUser,
  unblockUser,
  updateUserRole,
};
