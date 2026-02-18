import express from 'express';
import authUser from '../middlewares/authUser.js';
import { getSmartBag, getSavingsTips, getCategories } from '../controllers/budgetController.js';

const budgetRouter = express.Router();

budgetRouter.post('/smart-bag', authUser, getSmartBag);
budgetRouter.get('/tips', authUser, getSavingsTips);
budgetRouter.get('/categories', authUser, getCategories);

export default budgetRouter;
