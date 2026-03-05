import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import authSellerOrVendor from '../middlewares/authSellerOrVendor.js';
import authUser from '../middlewares/authUser.js';
import { addProduct, changeStock, productById, productList, addProductRating, removeProduct, deleteProductRating, updateStockQuantity } from '../controllers/productController.js';

const productRouter = express.Router();

// Both admin AND approved vendors can add/remove products
productRouter.post('/add', upload.array(["images"]), authSellerOrVendor, addProduct);
productRouter.post('/remove', authSellerOrVendor, removeProduct);

// Admin-only operations
productRouter.get('/list', productList)
productRouter.get('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.post('/update-stock', authSeller, updateStockQuantity)
productRouter.post('/rating', authUser, addProductRating)
productRouter.post('/rating/delete', authUser, deleteProductRating)

export default productRouter;
