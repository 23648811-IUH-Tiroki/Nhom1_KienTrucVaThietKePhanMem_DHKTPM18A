import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
    notificationsEnabled: { type: Boolean, default: true },
    timezone: { type: String, default: "UTC" },
    emailNotifications: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
}, {collection: 'settings'});

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;

