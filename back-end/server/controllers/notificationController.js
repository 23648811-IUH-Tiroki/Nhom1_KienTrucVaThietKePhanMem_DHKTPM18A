import * as notificationService from "../services/notificationService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getNotifications = async (req, res) => {
    try {
        const result = await notificationService.getNotifications(req.query);
        return res.status(200).json(result);
    } catch (error) {
        return sendControllerError(res, error, 500);
    }
};

export const createNotification = async (req, res) => {
    try {
        const result = await notificationService.createNotification(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return sendControllerError(res, error, 400);
    }
};

export const markAsRead = async (req, res) => {
    try {
        const result = await notificationService.markAsRead(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return sendControllerError(res, error, 400);
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const result = await notificationService.deleteNotification(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return sendControllerError(res, error, 400);
    }
};

export const generateSystemNotifications = async (req, res) => {
    try {
        const result = await notificationService.generateSystemNotifications();
        return res.status(200).json(result);
    } catch (error) {
        return sendControllerError(res, error, 500);
    }
};