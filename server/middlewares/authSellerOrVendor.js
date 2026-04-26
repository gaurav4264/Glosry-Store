import jwt from 'jsonwebtoken';
import SellerApplication from '../models/SellerApplication.js';


const authSellerOrVendor = async (req, res, next) => {
    try {
        const { sellerToken, vendorToken } = req.cookies;

 
        if (sellerToken) {
            const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
            if (decoded.email === process.env.SELLER_EMAIL) {
                req.isAdmin = true;
                return next();
            }
        }

        if (vendorToken) {
            const decoded = jwt.verify(vendorToken, process.env.JWT_SECRET);
            if (!decoded.isVendor) {
                return res.json({ success: false, message: 'Not Authorized' });
            }
            const seller = await SellerApplication.findById(decoded.id).select('_id status sellerId');
            if (!seller || seller.status !== 'approved') {
                return res.json({ success: false, message: 'Your seller account is not approved.' });
            }
            req.isAdmin = false;
            req.vendorId = decoded.id;
            req.sellerId = decoded.sellerId;
            return next();
        }

        return res.json({ success: false, message: 'Not Authorized - Please login' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default authSellerOrVendor;
