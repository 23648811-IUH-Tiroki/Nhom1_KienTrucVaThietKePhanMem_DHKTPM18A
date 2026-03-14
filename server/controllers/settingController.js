import Setting from "../models/Setting.js";

// Lấy cài đặt hiện tại
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Nếu chưa có cài đặt, tạo một bản ghi mặc định
      settings = new Setting({
        notificationsEnabled: true,
        timezone: "UTC",
        emailNotifications: false,
        maintenanceMode: false,
      });
      await settings.save();
    }
    res.status(200).json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Server error while fetching settings" });
  }
};

// Cập nhật cài đặt
export const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();

    // Validation (tùy chọn)
    if (updates.timezone && !["UTC", "Asia/Ho_Chi_Minh", "America/New_York", "Europe/London"].includes(updates.timezone)) {
      return res.status(400).json({ message: "Invalid timezone" });
    }

    const settings = await Setting.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true, // Tạo mới nếu không tồn tại
    });
    res.status(200).json(settings);
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ message: "Server error while updating settings" });
  }
};