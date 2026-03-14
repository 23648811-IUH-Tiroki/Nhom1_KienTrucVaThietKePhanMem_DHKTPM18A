import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  birthDate: { type: Date, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: { type: String },
  gender: { type: Boolean, default: false },
  address: { type: String },
  status: { type: String, default: 'Inactive', enum: ['Active', 'Inactive'] }, 
  lastActive: { type: Date, default: null }, 
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);
export default User;