import express from "express";
import {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    generateSystemNotifications
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);

router.get("/system", generateSystemNotifications);

router.post("/", createNotification);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

export default router;