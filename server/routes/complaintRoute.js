import express from 'express';
import { createComplaint, getComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
import authSeller from '../middlewares/authSeller.js';

const complaintRouter = express.Router();

complaintRouter.post('/create', createComplaint);
complaintRouter.get('/all', authSeller, getComplaints); // Protect with authSeller
complaintRouter.post('/update-status', authSeller, updateComplaintStatus);

export default complaintRouter;
