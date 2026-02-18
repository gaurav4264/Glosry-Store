import express from 'express';
import authUser from '../middlewares/authUser.js';
import { addPantryItem, getPantryItems, updatePantryItem, deletePantryItem, getExpiryAlerts, getWasteStats } from '../controllers/userPantryController.js';

const userPantryRouter = express.Router();

userPantryRouter.post('/add', authUser, addPantryItem);
userPantryRouter.get('/items', authUser, getPantryItems);
userPantryRouter.put('/update', authUser, updatePantryItem);
userPantryRouter.delete('/delete', authUser, deletePantryItem);
userPantryRouter.get('/alerts', authUser, getExpiryAlerts);
userPantryRouter.get('/waste-stats', authUser, getWasteStats);

export default userPantryRouter;
