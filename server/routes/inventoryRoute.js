import express from 'express';
import { getLowStockProducts, updateStockQuantity, deductStock, getInventoryAlerts } from '../controllers/inventoryController.js';
import authSeller from '../middlewares/authSeller.js';

const inventoryRouter = express.Router();

inventoryRouter.get('/low-stock', authSeller, getLowStockProducts);
inventoryRouter.post('/update', authSeller, updateStockQuantity);
inventoryRouter.post('/deduct', deductStock);
inventoryRouter.get('/alerts', authSeller, getInventoryAlerts);

export default inventoryRouter;
