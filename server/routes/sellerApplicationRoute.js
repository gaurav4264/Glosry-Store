import express from 'express';
import multer from 'multer';
import os from 'os';
import {
    registerSeller,
    checkApplicationStatus,
    setSellerPassword,
    sendOtp,
    verifyOtp
} from '../controllers/sellerApplicationController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'shopLogo', maxCount: 1 }
]);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', uploadFields, registerSeller);
router.get('/status/:appNum', checkApplicationStatus);
router.post('/set-password', setSellerPassword);

export default router;
