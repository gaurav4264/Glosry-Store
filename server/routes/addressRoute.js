import express from 'express';
import authUser from '../middlewares/authUser.js';
import { addAddress, getAddress, setDefaultAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);
addressRouter.post('/default', authUser, setDefaultAddress);

export default addressRouter;