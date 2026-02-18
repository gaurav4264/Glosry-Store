import express from 'express';
import { getNearbyShops, seedShops, getAllShops, getShopsByCategory } from '../controllers/shopController.js';

const shopRouter = express.Router();

shopRouter.post('/seed', seedShops);
shopRouter.post('/nearby', getNearbyShops);
shopRouter.get('/all', getAllShops);
shopRouter.post('/category', getShopsByCategory);

export default shopRouter;
