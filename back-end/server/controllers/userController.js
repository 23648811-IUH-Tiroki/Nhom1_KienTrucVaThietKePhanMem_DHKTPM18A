import User from '../models/User.js'
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users: users || [],
      total: total || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      message: err.message,
      users: [],
      total: 0
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    Object.assign(user, req.body);
    const updatedUser = await user.save();
    res.json(updatedUser); // Trả về user đã cập nhật
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.deleteOne({ _id: req.params.id }); // Xóa user
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const checkDuplicate = async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const phoneRaw = req.body?.phone;
  const phone = typeof phoneRaw === "string" ? phoneRaw.trim() : phoneRaw;

  try {
    const duplicateEmail = email ? await User.findOne({ email }) : null;
    const duplicatePhone =
      phone ? await User.findOne({ phone }) : null;

    res.json({
      duplicateEmail: !!duplicateEmail,
      duplicatePhone: !!duplicatePhone,
      db: { name: mongoose.connection?.name, host: mongoose.connection?.host },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUsersWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users: users || [],
      total: total || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching users with pagination:', err);
    res.status(500).json({
      message: err.message,
      users: [],
      total: 0
    });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { searchTerm = "", status = "all", role = "all" } = req.query;

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

    res.json({
      users: users || [],
      total: total || 0,
    });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({
      message: err.message,
      users: [],
      total: 0,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Không tồn tại user!" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Không tồn tại user!" });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "fullName")) {
      updates.fullName = String(req.body.fullName || "").trim();
    }

    // if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
    //   updates.email = String(req.body.email || "").trim();
    // }

    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
      const normalizedPhone = String(req.body.phone || "").trim();
      updates.phone = normalizedPhone || undefined;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "address")) {
      updates.address = String(req.body.address || "").trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "birthDate")) {
      if (!req.body.birthDate) {
        return res.status(400).json({ message: "Ngày sinh không được để trống." });
      }

      const parsedDate = new Date(req.body.birthDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ." });
      }

      updates.birthDate = parsedDate;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "gender")) {
      updates.gender = Boolean(req.body.gender);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "avatar")) {
      updates.avatar = req.body.avatar;
    }

    // if (updates.email) {
    //   const duplicateEmail = await User.findOne({
    //     email: updates.email,
    //     _id: { $ne: user._id },
    //   });
    //   if (duplicateEmail) {
    //     return res.status(409).json({ message: "Email đã được sử dụng." });
    //   }
    // }

    // if (updates.phone) {
    //   const duplicatePhone = await User.findOne({
    //     phone: updates.phone,
    //     _id: { $ne: user._id },
    //   });
    //   if (duplicatePhone) {
    //     return res.status(409).json({ message: "Số điện thoại đã được sử dụng." });
    //   }
    // }

    Object.assign(user, updates);

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(400).json({ message: err.message });
  }
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

export const getShippingAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      shippingAddress: user.shippingAddress || null,
      address: user.address || "",
    });
  } catch (err) {
    console.error("Error fetching shipping address:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateShippingAddress = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { isValid, errors, sanitized } = validateShippingAddressPayload(req.body || {});
    if (!isValid) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors });
    }

    const nextAddress = {
      ...sanitized,
      updatedAt: new Date(),
    };

    user.shippingAddress = nextAddress;
    user.address = buildLegacyAddress(nextAddress);

    const updatedUser = await user.save();

    return res.json({
      shippingAddress: updatedUser.shippingAddress,
      address: updatedUser.address || "",
    });
  } catch (err) {
    console.error("Error updating shipping address:", err);
    return res.status(400).json({ message: err.message });
  }
};
