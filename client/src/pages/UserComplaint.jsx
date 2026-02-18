import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserComplaint = () => {
    const { user } = useAppContext();
    const [formData, setFormData] = useState({
        contact: user ? user.email : '',
        type: 'General',
        details: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                userId: user ? user._id : 'Guest',
                userName: user ? user.name : 'Guest User',
                contact: formData.contact,
                type: formData.type,
                details: formData.details
            };

            const { data } = await axios.post('/api/complaint/create', payload);

            if (data.success) {
                toast.success('Complaint Registered Successfully!');
                setFormData({
                    contact: user ? user.email : '',
                    type: 'General',
                    details: ''
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20 px-4">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Raise a Complaint</h2>
                    <p className="text-gray-500 mt-2">We are here to help! Let us know your issue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info (Email/Phone)</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            placeholder="Your email or phone number"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Complaint Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition bg-white"
                        >
                            <option value="General">General Inquiry</option>
                            <option value="Product">Product Issue</option>
                            <option value="Delivery">Delivery Problem</option>
                            <option value="Service">Service Complaint</option>
                            <option value="Payment">Payment Issue</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Details</label>
                        <textarea
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            required
                            rows="4"
                            placeholder="Please describe your issue in detail..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primary-dull transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Need immediate help? Cal us at <span className="font-semibold text-gray-700">6207364264</span>
                </div>
            </div>
        </div>
    );
};

export default UserComplaint;
