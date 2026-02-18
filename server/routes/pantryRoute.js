import express from 'express';
import authSeller from '../middlewares/authSeller.js';
import { setProductExpiry, bulkSetExpiry, getExpiryDashboard, quickDiscount, getShelfLife } from '../controllers/pantryController.js';

const pantryRouter = express.Router();

pantryRouter.post('/set-expiry', authSeller, setProductExpiry);
pantryRouter.post('/bulk-set-expiry', authSeller, bulkSetExpiry);
pantryRouter.get('/dashboard', authSeller, getExpiryDashboard);
pantryRouter.post('/quick-discount', authSeller, quickDiscount);
pantryRouter.get('/shelf-life', authSeller, getShelfLife);

export default pantryRouter;
