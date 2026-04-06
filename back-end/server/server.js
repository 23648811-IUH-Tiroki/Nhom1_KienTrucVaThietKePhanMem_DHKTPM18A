import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
console.log("📂 Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error("❌ Failed to load .env file:", result.error);
} else {
    console.log("✅ .env file loaded successfully");
}

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import settingRoutes from "./routes/settingRoutes.js"; 
import dashboadRoutes from "./routes/dashboardRoutes.js";
import { protectedRoute } from "./middleware/authMiddleware.js";

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.VITE_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.warn("⚠️ MongoDB connection failed. Server continuing without DB.");
    console.warn("Error:", err.message);
  });

// Routes

// Welcome endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API!" });
});

// ===== PUBLIC ROUTES (No authentication required) =====
// Authentication routes (signup, signin, signout)
app.use("/api/auth", authRoutes);

// Product and category routes (viewing only)
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ===== PROTECTED ROUTES (Authentication required) =====
// Apply middleware to protect these routes
app.use(protectedRoute);

// User, Order, Cart, Settings, Dashboard routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboadRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}`);
});