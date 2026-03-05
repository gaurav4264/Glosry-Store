import jwt from 'jsonwebtoken';
import SellerApplication from '../models/SellerApplication.js';

const authVendor = async (req, res, next) => {
    const { vendorToken } = req.cookies;

    if (!vendorToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(vendorToken, process.env.JWT_SECRET);
        if (!tokenDecode.isVendor) {
            return res.json({ success: false, message: 'Not Authorized' });
        }

        // Verify seller is still approved
        const seller = await SellerApplication.findById(tokenDecode.id).select('_id status sellerId');
        if (!seller || seller.status !== 'approved') {
            return res.json({ success: false, message: 'Not Authorized - Seller not approved' });
        }

        req.vendorId = tokenDecode.id;
        req.sellerId = tokenDecode.sellerId;
        next();

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default authVendor;
