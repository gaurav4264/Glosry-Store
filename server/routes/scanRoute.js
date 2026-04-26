import express from 'express';
import multer from 'multer';
import { parseGroceryList, lookupByBarcode } from '../controllers/scanController.js';

const router = express.Router();

// Setup Multer to temporarily save uploaded images
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/scan/list
router.post('/list', upload.single('image'), parseGroceryList);

// Route: GET /api/scan/barcode?code=<barcode>
router.get('/barcode', lookupByBarcode);

export default router;
