import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

// Load environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
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
import aiRoutes from "./routes/AIRoutes.js";
import dashboadRoutes from "./routes/dashboardRoutes.js";
import { protectedRoute } from "./middleware/authMiddleware.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import redisClient from "./configs/redisClient.js";
import { createRequire } from "module";
// Load connect-redis (CJS) via createRequire to avoid ESM import issues
const require = createRequire(import.meta.url);
const connectRedisModule = require("connect-redis");
// Normalize different export shapes from connect-redis (CJS/ESM variants)
let RedisStoreClass;
if (connectRedisModule && typeof connectRedisModule.RedisStore === "function") {
  // v7+: exports { RedisStore }
  RedisStoreClass = connectRedisModule.RedisStore;
} else if (typeof connectRedisModule === "function") {
  // older CJS: module is a function that accepts session and returns the store class
  RedisStoreClass = connectRedisModule(session);
} else if (
  connectRedisModule &&
  typeof connectRedisModule.default === "function"
) {
  RedisStoreClass = connectRedisModule.default(session);
} else if (
  connectRedisModule &&
  typeof connectRedisModule.create === "function"
) {
  RedisStoreClass = connectRedisModule.create(session);
} else {
  throw new Error("connect-redis: unsupported module shape");
}

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
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

app.get("/redis-test", async (req, res) => {
  try {
    await redisClient.set("shop", "petshop");

    const value = await redisClient.get("shop");

    console.log(value);

    res.json({
      redis: value,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Lưu session vào Redis
app.use(
  session({
    store: new RedisStoreClass({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 1, // 1 minute
    },
  }),
);
app.set("trust proxy", 1); // Nếu ứng dụng chạy sau proxy (ví dụ: Nginx), để Express biết và xử lý cookie đúng cách
app.use(rateLimiter); // Apply rate limiter to all routes
// ===== PUBLIC ROUTES (No authentication required) =====
// Authentication routes (signup, signin, signout)
app.use("/api/auth", authRoutes);

// Product and category routes (viewing only)
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);

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
