import User from '../models/User.js'

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


export const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone, password });
    if (!user) {
      return res.status(401).json({ message: 'Số điện thoại hoặc mật khẩu không chính xác.' });
    }

    user.status = 'Active';
    user.lastActive = new Date();
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'Inactive';
    user.lastActive = new Date();
    await user.save();

    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const checkDuplicate = async (req, res) => {
  const { phone, email } = req.body;

  try {
    const duplicateEmail = await User.findOne({ email });
    const duplicatePhone = await User.findOne({ phone });

    res.json({
      duplicateEmail: !!duplicateEmail,
      duplicatePhone: !!duplicatePhone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req, res) => {
  const { fullName, phone, email, birthDate, password, avatar } = req.body;

  try {
    const user = new User({
      fullName,
      phone,
      email,
      birthDate,
      password,
      role: "user",
      avatar
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
