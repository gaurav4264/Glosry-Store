import express from 'express';
import { upload } from '../configs/multer.js';
import { sendMessage, getOwnerProfile, getMessages, markAsRead, deleteMessage, updateOwnerProfile, uploadOwnerPhoto } from '../controllers/contactController.js';

const contactRouter = express.Router();

// Public routes
contactRouter.post('/send', sendMessage);
contactRouter.get('/owner-profile', getOwnerProfile);

// Seller routes (page is already behind seller auth in frontend)
contactRouter.get('/messages', getMessages);
contactRouter.put('/mark-read', markAsRead);
contactRouter.delete('/delete', deleteMessage);
contactRouter.put('/update-profile', updateOwnerProfile);
contactRouter.post('/upload-photo', upload.single('photo'), uploadOwnerPhoto);

export default contactRouter;
