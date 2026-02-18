import express from 'express';
import { getLoyaltyPoints, redeemPoints, awardPoints, getLoyaltyHistory } from '../controllers/loyaltyController.js';
import authUser from '../middlewares/authUser.js';

const loyaltyRouter = express.Router();

loyaltyRouter.post('/points', authUser, getLoyaltyPoints);
loyaltyRouter.post('/redeem', authUser, redeemPoints);
loyaltyRouter.post('/award', authUser, awardPoints);
loyaltyRouter.post('/history', authUser, getLoyaltyHistory);

export default loyaltyRouter;
