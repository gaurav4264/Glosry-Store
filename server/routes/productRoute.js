import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import authUser from '../middlewares/authUser.js';
import { addProduct, changeStock, productById, productList, addProductRating, removeProduct, deleteProductRating } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
productRouter.get('/list', productList)
productRouter.get('/id', productById)
productRouter.post('/stock', authSeller, changeStock)
productRouter.post('/rating', authUser, addProductRating)
productRouter.post('/rating/delete', authUser, deleteProductRating)
productRouter.post('/remove', authSeller, removeProduct)

export default productRouter;