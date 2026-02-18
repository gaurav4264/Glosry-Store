import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SellerComplaints = () => {
    const { axios } = useAppContext();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const { data } = await axios.get('/api/complaint/all');
            if (data.success) {
                setComplaints(data.complaints);
            } else {
                toast.error(data.message);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const { data } = await axios.post('/api/complaint/update-status', { id, status });
            if (data.success) {
                toast.success("Status Updated");
                fetchComplaints();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    }

    if (loading) {
        return <div className="p-6">Loading complaints...</div>;
    }

    return (
        <div className="p-6 w-full max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">📢 Customer Complaints</h2>

            <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {complaints.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No complaints found.</td>
                            </tr>
                        ) : (
                            complaints.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                        <br />
                                        <span className="text-xs">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <p className="font-medium">{c.userName || 'Guest'}</p>
                                        <p className="text-xs text-gray-500">{c.userId}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={c.details}>
                                        {c.details}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold
                                            ${c.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={c.status}
                                            onChange={(e) => updateStatus(c._id, e.target.value)}
                                            className="border rounded text-xs p-1"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerComplaints;
