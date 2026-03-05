import SellerApplication from '../models/SellerApplication.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ─── In-memory OTP store (mobile → { otp, expiry }) ───────────────────────
const otpStore = new Map();

// Send OTP : POST /api/seller-application/send-otp
export const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || !/^\d{10}$/.test(mobile)) {
            return res.json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        otpStore.set(mobile, { otp, expiry });

        // In production: send via SMS API (Twilio, MSG91, etc.)
        console.log(`[OTP] Mobile: ${mobile} → OTP: ${otp}`);
        return res.json({ success: true, message: 'OTP sent successfully!', otp }); // remove otp in prod
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify OTP : POST /api/seller-application/verify-otp
export const verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        const record = otpStore.get(mobile);
        if (!record) return res.json({ success: false, message: 'OTP not sent or expired.' });
        if (Date.now() > record.expiry) {
            otpStore.delete(mobile);
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' });
        }
        if (record.otp !== otp) return res.json({ success: false, message: 'Invalid OTP.' });
        otpStore.delete(mobile);
        return res.json({ success: true, message: 'Mobile verified successfully!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Register New Seller Application : POST /api/seller-application/register
export const registerSeller = async (req, res) => {
    try {
        const {
            fullName, mobileNumber, email, aadhaarNumber, panNumber,
            bankAccountNumber, ifscCode, gstNumber,
            shopName, shopCategory, shopAddress, area, pickupAddress,
            city, state, pinCode, landmark,
            latitude, longitude
        } = req.body;

        // Check if email already registered
        const existingApp = await SellerApplication.findOne({ email });
        if (existingApp) {
            return res.json({ success: false, message: 'An application with this email already exists. Application No: ' + existingApp.applicationNumber });
        }

        // Upload documents to Cloudinary
        let aadhaarImage = '', panImage = '', passportPhoto = '', shopLogo = '';

        if (req.files?.aadhaarImage) {
            const r = await cloudinary.uploader.upload(req.files.aadhaarImage[0].path, { folder: 'seller-docs/aadhaar', resource_type: 'image' });
            aadhaarImage = r.secure_url;
        }
        if (req.files?.panImage) {
            const r = await cloudinary.uploader.upload(req.files.panImage[0].path, { folder: 'seller-docs/pan', resource_type: 'image' });
            panImage = r.secure_url;
        }
        if (req.files?.passportPhoto) {
            const r = await cloudinary.uploader.upload(req.files.passportPhoto[0].path, { folder: 'seller-docs/photos', resource_type: 'image' });
            passportPhoto = r.secure_url;
        }
        if (req.files?.shopLogo) {
            const r = await cloudinary.uploader.upload(req.files.shopLogo[0].path, { folder: 'seller-docs/logos', resource_type: 'image' });
            shopLogo = r.secure_url;
        }

        const location = {
            type: 'Point',
            coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0]
        };

        const application = new SellerApplication({
            fullName, mobileNumber, email,
            aadhaarNumber, panNumber,
            bankAccountNumber, ifscCode,
            gstNumber: gstNumber || '',
            aadhaarImage, panImage, passportPhoto,
            shopName, shopCategory, shopAddress,
            area: area || '',
            pickupAddress: pickupAddress || '',
            shopLogo,
            city, state, pinCode,
            landmark: landmark || '',
            location
        });

        await application.save();

        return res.json({
            success: true,
            message: 'Application submitted successfully!',
            applicationNumber: application.applicationNumber,
            shopRegNumber: application.shopRegNumber,
            sellerId: application.sellerId
        });

    } catch (error) {
        console.error('registerSeller error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Check Application Status : GET /api/seller-application/status/:appNum
export const checkApplicationStatus = async (req, res) => {
    try {
        const { appNum } = req.params;
        const application = await SellerApplication.findOne({ applicationNumber: appNum })
            .select('applicationNumber shopRegNumber sellerId fullName shopName shopCategory city status adminRemarks registrationDate approvedAt passwordSet');

        if (!application) {
            return res.json({ success: false, message: 'No application found with this Application Number.' });
        }

        return res.json({
            success: true,
            application: {
                applicationNumber: application.applicationNumber,
                shopRegNumber: application.shopRegNumber,
                sellerId: application.sellerId,
                fullName: application.fullName,
                shopName: application.shopName,
                shopCategory: application.shopCategory,
                city: application.city,
                status: application.status,
                adminRemarks: application.adminRemarks,
                registrationDate: application.registrationDate,
                approvedAt: application.approvedAt,
                passwordSet: application.passwordSet
            }
        });

    } catch (error) {
        console.error('checkApplicationStatus error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Set Password after Approval : POST /api/seller-application/set-password
export const setSellerPassword = async (req, res) => {
    try {
        const { sellerId, password } = req.body;
        const application = await SellerApplication.findOne({ sellerId });
        if (!application) return res.json({ success: false, message: 'Seller ID not found.' });
        if (application.status !== 'approved') return res.json({ success: false, message: 'Your application is not approved yet.' });
        if (password.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters.' });

        application.password = password;
        application.passwordSet = true;
        await application.save();
        return res.json({ success: true, message: 'Password set successfully! You can now login.' });
    } catch (error) {
        console.error('setSellerPassword error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Vendor Login : POST /api/seller/vendor-login
export const vendorLogin = async (req, res) => {
    try {
        const { sellerId, password } = req.body;
        const application = await SellerApplication.findOne({ sellerId });
        if (!application) return res.json({ success: false, message: 'Invalid Seller ID.' });
        if (application.status !== 'approved') return res.json({ success: false, message: 'Your application is not approved yet. Status: ' + application.status });
        if (!application.passwordSet) return res.json({ success: false, message: 'Please set your password first using your Seller ID.' });

        const isMatch = await bcrypt.compare(password, application.password);
        if (!isMatch) return res.json({ success: false, message: 'Invalid password.' });

        const token = jwt.sign(
            { sellerId: application.sellerId, id: application._id, isVendor: true },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('vendorToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true,
            message: 'Logged In',
            seller: {
                sellerId: application.sellerId,
                shopName: application.shopName,
                fullName: application.fullName,
                shopCategory: application.shopCategory,
                city: application.city,
                area: application.area || '',
                pickupAddress: application.pickupAddress || '',
                shopLogo: application.shopLogo || '',
                passportPhoto: application.passportPhoto
            }
        });
    } catch (error) {
        console.error('vendorLogin error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Vendor isAuth : GET /api/seller/vendor-is-auth
export const isVendorAuth = async (req, res) => {
    try {
        const application = await SellerApplication.findById(req.vendorId)
            .select('sellerId shopName fullName shopCategory city area pickupAddress shopLogo passportPhoto status pinCode');
        if (!application) return res.json({ success: false });

        return res.json({
            success: true,
            seller: {
                sellerId: application.sellerId,
                shopName: application.shopName,
                fullName: application.fullName,
                shopCategory: application.shopCategory,
                city: application.city,
                area: application.area || '',
                pickupAddress: application.pickupAddress || '',
                shopLogo: application.shopLogo || '',
                passportPhoto: application.passportPhoto,
                pinCode: application.pinCode || ''
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Vendor Logout
export const vendorLogout = async (req, res) => {
    try {
        res.clearCookie('vendorToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: 'Logged Out' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// POST /api/seller/vendor-add-product  ← VENDOR ONLY (authVendor)
export const vendorAddProduct = async (req, res) => {
    try {
        const vendorId = req.vendorId?.toString();
        if (!vendorId) return res.json({ success: false, message: 'Not authorized as vendor' });

        let productData;
        try {
            productData = JSON.parse(req.body.productData);
        } catch {
            return res.json({ success: false, message: 'Invalid product data format' });
        }

        if (!req.files || req.files.length === 0) {
            return res.json({ success: false, message: 'Please upload at least one product image' });
        }

        // Upload images to Cloudinary
        const { v2: cloudinaryUpload } = await import('cloudinary');
        const imagesUrl = await Promise.all(
            req.files.map(async (file) => {
                const result = await cloudinaryUpload.uploader.upload(file.path, { resource_type: 'image' });
                return result.secure_url;
            })
        );

        // Get vendor shop info
        const vendorRecord = await SellerApplication.findById(vendorId).select('shopName sellerId');
        const vendorShopName = vendorRecord?.shopName || null;

        const product = await Product.create({
            ...productData,
            image: imagesUrl,
            vendorId,        // always a string now
            vendorShopName
        });

        console.log(`[Vendor Product Add] vendorId=${vendorId}, product=${product._id}, shop=${vendorShopName}`);

        return res.json({ success: true, message: 'Product Added Successfully!', productId: product._id });
    } catch (error) {
        console.error('vendorAddProduct error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/seller/vendor-products
export const getVendorProducts = async (req, res) => {
    try {
        const vendorId = req.vendorId?.toString();
        const products = await Product.find({ vendorId }).sort({ createdAt: -1 });
        return res.json({ success: true, products });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// POST /api/seller/vendor-delete-product
export const deleteVendorProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const vendorId = req.vendorId?.toString();
        const product = await Product.findOne({ _id: id, vendorId });
        if (!product) return res.json({ success: false, message: 'Product not found or not yours' });
        await Product.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Product Deleted' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// GET /api/seller/vendor-orders
export const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.vendorId?.toString();
        const vendorProducts = await Product.find({ vendorId }).select('_id name image offerPrice');
        const productIds = vendorProducts.map(p => p._id.toString());

        if (productIds.length === 0) {
            return res.json({ success: true, orders: [], stats: { total: 0, revenue: 0, pending: 0, delivered: 0 } });
        }

        const allOrders = await Order.find({}).populate('address').sort({ createdAt: -1 });

        const vendorOrders = allOrders.filter(order =>
            order.items.some(item => productIds.includes((item.product?._id || item.product)?.toString()))
        ).map(order => {
            const myItems = order.items
                .filter(item => productIds.includes((item.product?._id || item.product)?.toString()))
                .map(item => {
                    const pId = (item.product?._id || item.product)?.toString();
                    const prod = vendorProducts.find(p => p._id.toString() === pId);
                    return {
                        productId: item.product,
                        productName: prod?.name || 'Unknown',
                        productImage: prod?.image?.[0] || '',
                        quantity: item.quantity,
                        price: prod?.offerPrice || 0,
                        subtotal: (prod?.offerPrice || 0) * item.quantity
                    };
                });
            const myRevenue = myItems.reduce((sum, i) => sum + i.subtotal, 0);
            return {
                _id: order._id,
                status: order.status,
                vendorStatus: order.vendorStatus || 'Pending',
                trackingId: order.trackingId || null,
                paymentType: order.paymentType,
                isPaid: order.isPaid,
                address: order.address,
                myItems,
                myRevenue,
                createdAt: order.createdAt,
                statusHistory: order.statusHistory || [],
            };
        });

        const stats = {
            total: vendorOrders.length,
            revenue: vendorOrders.reduce((s, o) => s + o.myRevenue, 0),
            pending: vendorOrders.filter(o => o.vendorStatus === 'Pending').length,
            delivered: vendorOrders.filter(o => o.vendorStatus === 'Delivered').length,
        };

        return res.json({ success: true, orders: vendorOrders, stats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// POST /api/seller/vendor-update-order
export const updateVendorOrderStatus = async (req, res) => {
    try {
        const { orderId, vendorStatus } = req.body;
        const validStatuses = ['Accepted', 'Rejected', 'Packed', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(vendorStatus)) {
            return res.json({ success: false, message: 'Invalid vendor status.' });
        }

        const vendorProducts = await Product.find({ vendorId: req.vendorId?.toString() }).select('_id');
        const productIds = vendorProducts.map(p => p._id.toString());

        const order = await Order.findById(orderId);
        if (!order) return res.json({ success: false, message: 'Order not found.' });

        const hasProducts = order.items.some(item => productIds.includes((item.product?._id || item.product)?.toString()));
        if (!hasProducts) return res.json({ success: false, message: 'This order does not belong to you.' });

        const vendorRecord = await SellerApplication.findById(req.vendorId).select('sellerId');
        const vendorSellerId = vendorRecord?.sellerId || '';

        const statusMap = {
            'Accepted': 'Packing',
            'Rejected': 'Cancelled',
            'Packed': 'Packing',
            'Shipped': 'Shipped',
            'Delivered': 'Delivered'
        };

        order.vendorStatus = vendorStatus;
        order.status = statusMap[vendorStatus] || order.status;
        order.sellerId = vendorSellerId;

        if (vendorStatus === 'Shipped' && !order.trackingId) {
            order.trackingId = `TRK-${vendorSellerId}-${Date.now()}`;
        }

        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: order.status, timestamp: new Date() });

        await order.save();
        return res.json({
            success: true,
            message: `Order marked as ${vendorStatus}`,
            trackingId: order.trackingId,
            orderStatus: order.status
        });
    } catch (error) {
        console.error('updateVendorOrderStatus error:', error);
        res.json({ success: false, message: error.message });
    }
};
