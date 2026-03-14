import express from 'express';
import {
  getDashboardStats,
  getRecentOrders,
  getRevenueByDay,
  getRevenueByCategory,
  getDashboardNotifications,
  importOrdersFromCSV
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);

router.get('/recent-orders', getRecentOrders);

router.get('/revenue-by-day', getRevenueByDay);

router.get('/revenue-by-category', getRevenueByCategory);

router.get('/notifications', getDashboardNotifications);

router.post('/import-orders', importOrdersFromCSV);

export default router;