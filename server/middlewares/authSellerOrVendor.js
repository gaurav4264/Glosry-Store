import jwt from 'jsonwebtoken';
import SellerApplication from '../models/SellerApplication.js';

// Allows BOTH admin (sellerToken) AND approved vendor (vendorToken) to access
const authSellerOrVendor = async (req, res, next) => {
    try {
        const { sellerToken, vendorToken } = req.cookies;

        // ── 1. Try Admin Token first ────────────────────────────────
        if (sellerToken) {
            const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
            if (decoded.email === process.env.SELLER_EMAIL) {
                req.isAdmin = true;
                return next();
            }
        }

        // ── 2. Try Vendor Token ──────────────────────────────────────
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

        // ── 3. Neither token present ─────────────────────────────────
        return res.json({ success: false, message: 'Not Authorized - Please login' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export default authSellerOrVendor;
