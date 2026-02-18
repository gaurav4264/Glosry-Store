import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import authUser from '../middlewares/authUser.js';

const wishlistRouter = express.Router();

wishlistRouter.post('/add', authUser, addToWishlist);
wishlistRouter.post('/remove', authUser, removeFromWishlist);
wishlistRouter.post('/get', authUser, getWishlist);
wishlistRouter.post('/toggle', authUser, toggleWishlist);

export default wishlistRouter;
