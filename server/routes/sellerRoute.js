import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import { vendorLogin, isVendorAuth, vendorLogout, getVendorProducts, getVendorOrders, deleteVendorProduct, updateVendorOrderStatus, vendorAddProduct } from '../controllers/sellerApplicationController.js';
import authSeller from '../middlewares/authSeller.js';
import authVendor from '../middlewares/authVendor.js';
import { upload } from '../configs/multer.js';

const sellerRouter = express.Router();

// Admin routes
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

// Vendor auth routes
sellerRouter.post('/vendor-login', vendorLogin);
sellerRouter.get('/vendor-is-auth', authVendor, isVendorAuth);
sellerRouter.get('/vendor-logout', vendorLogout);

// Vendor product routes
sellerRouter.post('/vendor-add-product', upload.array('images'), authVendor, vendorAddProduct);
sellerRouter.get('/vendor-products', authVendor, getVendorProducts);
sellerRouter.post('/vendor-delete-product', authVendor, deleteVendorProduct);

// Vendor order routes
sellerRouter.get('/vendor-orders', authVendor, getVendorOrders);
sellerRouter.post('/vendor-update-order', authVendor, updateVendorOrderStatus);

export default sellerRouter;
