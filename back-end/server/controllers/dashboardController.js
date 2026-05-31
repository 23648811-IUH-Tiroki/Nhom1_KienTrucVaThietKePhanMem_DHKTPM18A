import * as dashboardService from "../services/dashboardService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getDashboardStats = async (req, res) => {
  try {
    const result = await dashboardService.getDashboardStats(req.query.timeFilter);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const result = await dashboardService.getRecentOrders(req.query.limit);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getRevenueByDay = async (req, res) => {
  try {
    const result = await dashboardService.getRevenueByDay(req.query.timeFilter);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getRevenueByCategory = async (req, res) => {
  try {
    const result = await dashboardService.getRevenueByCategory();
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getDashboardNotifications = async (req, res) => {
  try {
    const result = await dashboardService.getDashboardNotifications();
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const importOrdersFromCSV = async (req, res) => {
  try {
    const result = await dashboardService.importOrdersFromCSV();
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};