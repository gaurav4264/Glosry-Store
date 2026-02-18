import Complaint from "../models/Complaint.js";

// Create a new complaint
export const createComplaint = async (req, res) => {
    try {
        const { userId, userName, contact, details, type } = req.body;

        const newComplaint = new Complaint({
            userId,
            userName,
            contact,
            details,
            type
        });

        await newComplaint.save();

        res.json({ success: true, message: "Complaint registered successfully. We will contact you soon." });
    } catch (error) {
        console.error("Create Complaint Error:", error);
        res.json({ success: false, message: error.message });
    }
}

// Get all complaints (Seller)
export const getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({}).sort({ createdAt: -1 });
        res.json({ success: true, complaints });
    } catch (error) {
        console.error("Get Complaints Error:", error);
        res.json({ success: false, message: error.message });
    }
}

// Update status
export const updateComplaintStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await Complaint.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
