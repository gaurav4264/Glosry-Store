import express from 'express';
import { requestNotification } from '../controllers/notifyController.js';
import authUser from '../middlewares/authUser.js';

const notifyRouter = express.Router();

notifyRouter.post('/request', authUser, requestNotification);

export default notifyRouter;
