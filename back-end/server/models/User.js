import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  role: { type: String, default: 'user' },
  avatar: { type: String },
  gender: { type: Boolean, default: false },
  address: { type: String },
  shippingAddress: {
    receiverName: { type: String, default: "" },
    phone: { type: String, default: "" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    ward: { type: String, default: "" },
    detailAddress: { type: String, default: "" },
    updatedAt: { type: Date, default: null },
  },
  status: { type: String, default: 'Inactive', enum: ['Active', 'Inactive'] },
  lastActive: { type: Date, default: null },
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);
export default User;