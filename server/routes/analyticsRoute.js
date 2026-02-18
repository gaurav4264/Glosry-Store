import express from 'express';
import { getRevenueStats, getTopProducts, getSalesTrends, getCustomerStats, getTopCustomers } from '../controllers/analyticsController.js';
import authSeller from '../middlewares/authSeller.js';

const analyticsRouter = express.Router();

analyticsRouter.post('/revenue', authSeller, getRevenueStats);
analyticsRouter.post('/top-products', authSeller, getTopProducts);
analyticsRouter.post('/trends', authSeller, getSalesTrends);
analyticsRouter.get('/customers', authSeller, getCustomerStats);
analyticsRouter.get('/customers/top', authSeller, getTopCustomers);

export default analyticsRouter;
