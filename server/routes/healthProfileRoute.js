import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
    saveHealthProfile,
    getHealthProfile,
    getHealthRecommendations
} from '../controllers/healthProfileController.js';

const healthProfileRouter = express.Router();

healthProfileRouter.post('/save', authUser, saveHealthProfile);
healthProfileRouter.get('/profile', authUser, getHealthProfile);
healthProfileRouter.post('/recommend', authUser, getHealthRecommendations);

export default healthProfileRouter;
