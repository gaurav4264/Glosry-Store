import express from 'express';
import authSeller from '../middlewares/authSeller.js';
import {
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    getSellerStats,
    getAllOrdersAdmin,
    getAdminRevenueStats,
    getVendorProductsAdmin
} from '../controllers/adminSellerController.js';

const router = express.Router();

// Seller application routes
router.get('/sellers/stats', authSeller, getSellerStats);
router.get('/sellers', authSeller, getAllApplications);
router.get('/sellers/:id', authSeller, getApplicationById);
router.put('/sellers/:id/status', authSeller, updateApplicationStatus);

// Admin order routes
router.get('/all-orders', authSeller, getAllOrdersAdmin);
router.get('/revenue-stats', authSeller, getAdminRevenueStats);
router.get('/vendor-products/:vendorDbId', authSeller, getVendorProductsAdmin);

export default router;
