import express from 'express';
import { getLoyaltyPoints, redeemPoints, awardPoints, getLoyaltyHistory, getUserBadges, dailySpin, redeemSpinPoints, spinStatus } from '../controllers/loyaltyController.js';
import authUser from '../middlewares/authUser.js';

const loyaltyRouter = express.Router();

loyaltyRouter.post('/points', authUser, getLoyaltyPoints);
loyaltyRouter.post('/redeem', authUser, redeemPoints);
loyaltyRouter.post('/award', authUser, awardPoints);
loyaltyRouter.post('/history', authUser, getLoyaltyHistory);
loyaltyRouter.post('/badges', authUser, getUserBadges);
loyaltyRouter.post('/spin', authUser, dailySpin);
loyaltyRouter.post('/spin-redeem', authUser, redeemSpinPoints);
loyaltyRouter.post('/spin-status', authUser, spinStatus);

export default loyaltyRouter;
