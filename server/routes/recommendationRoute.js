import express from 'express';
import { getPersonalRecommendations, getFrequentlyBoughtTogether, getTrendingProducts } from '../controllers/recommendationController.js';
import authUser from '../middlewares/authUser.js';

const recommendationRouter = express.Router();

recommendationRouter.post('/personal', authUser, getPersonalRecommendations);
recommendationRouter.get('/frequently-bought/:productId', getFrequentlyBoughtTogether);
recommendationRouter.get('/trending', getTrendingProducts);

export default recommendationRouter;
