import express from 'express';
import multer from 'multer';
import { parseGroceryList } from '../controllers/scanController.js';

const router = express.Router();

// Setup Multer to temporarily save uploaded images
const upload = multer({ dest: 'uploads/' });

// Route: POST /api/scan/list
router.post('/list', upload.single('image'), parseGroceryList);

export default router;
