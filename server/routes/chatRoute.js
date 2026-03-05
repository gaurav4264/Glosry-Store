import express from 'express';
import { chatMessage } from '../controllers/chatController.js';

const chatRouter = express.Router();

chatRouter.post('/message', chatMessage);

export default chatRouter;
