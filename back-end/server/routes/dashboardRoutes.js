import express from 'express';
import {
  getDashboardStats,
  getRecentOrders,
  getRevenueByDay,
  getRevenueByCategory,
  getDashboardNotifications,
  importOrdersFromCSV
} from '../controllers/dashboardController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/stats', getDashboardStats);

router.get('/recent-orders', getRecentOrders);

router.get('/revenue-by-day', getRevenueByDay);

router.get('/revenue-by-category', getRevenueByCategory);

router.get('/notifications', getDashboardNotifications);

router.post('/import-orders', importOrdersFromCSV);

export default router;