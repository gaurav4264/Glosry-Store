import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getAllOrders, getUserOrders, placeOrderCOD, placeOrderStripe, updateStatus, cancelOrder, returnOrder, getSellerReport } from '../controllers/orderController.js';
import authSeller from '../middlewares/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/status', authSeller, updateStatus)
orderRouter.post('/cancel', authUser, cancelOrder)
orderRouter.post('/return', authUser, returnOrder)
orderRouter.get('/report', authSeller, getSellerReport)

export default orderRouter;
