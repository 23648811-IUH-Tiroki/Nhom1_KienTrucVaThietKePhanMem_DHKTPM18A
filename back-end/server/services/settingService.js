import Setting from "../models/Setting.js";
import { createServiceError } from "../utils/serviceError.js";

const allowedTimezones = ["UTC", "Asia/Ho_Chi_Minh", "America/New_York", "Europe/London"];

export const getSettings = async () => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = new Setting({
      notificationsEnabled: true,
      timezone: "UTC",
      emailNotifications: false,
      maintenanceMode: false,
    });

    await settings.save();
  }

  return settings;
};

export const updateSettings = async (updates = {}) => {
  const payload = {
    ...updates,
    updatedAt: Date.now(),
  };

  if (payload.timezone && !allowedTimezones.includes(payload.timezone)) {
    throw createServiceError("Invalid timezone", 400);
  }

  return Setting.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  });
};

export default {
  getSettings,
  updateSettings,
};