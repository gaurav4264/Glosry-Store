import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getEcoRoute, getDeliveryStats } from '../controllers/ecoRouteController.js';

const ecoRouteRouter = express.Router();

ecoRouteRouter.post('/calculate', authUser, getEcoRoute);
ecoRouteRouter.get('/stats', authUser, getDeliveryStats);

export default ecoRouteRouter;
