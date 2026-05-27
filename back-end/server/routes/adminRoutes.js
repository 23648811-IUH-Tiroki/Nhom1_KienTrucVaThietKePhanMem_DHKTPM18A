import express from "express";
import {
  getUsers,
  blockUser,
  unblockUser,
  updateUserRole,
} from "../controllers/adminController.js";
import { protectedRoute, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectedRoute);
router.use(requireAdmin);

router.get("/users", getUsers);
router.patch("/users/block/:id", blockUser);
router.patch("/users/unblock/:id", unblockUser);
router.patch("/users/role/:id", updateUserRole);

export default router;
