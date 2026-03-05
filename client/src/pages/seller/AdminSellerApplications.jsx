import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS = {
    all: { color: 'bg-gray-100 text-gray-700', label: 'All' },
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: '⏳' },
    approved: { color: 'bg-green-100 text-green-700', label: 'Approved', icon: '✅' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: '❌' },
    hold: { color: 'bg-orange-100 text-orange-700', label: 'On Hold', icon: '⏸️' }
};

const AdminSellerApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const [appsRes, statsRes] = await Promise.all([
                axios.get(`/api/admin/sellers${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`),
                axios.get('/api/admin/sellers/stats')
            ]);
            if (appsRes.data.success) setApplications(appsRes.data.applications);
            if (statsRes.data.success) setStats(statsRes.data.stats);
        } catch (error) {
            toast.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, [filterStatus]);

    const filtered = applications.filter(a =>
        !search || a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.shopName?.toLowerCase().includes(search.toLowerCase()) ||
        a.applicationNumber?.toLowerCase().includes(search.toLowerCase()) ||
        a.sellerId?.toLowerCase().includes(search.toLowerCase())
    );

    const StatCard = ({ label, count, color, icon }) => (
        <div className={`rounded-2xl p-5 ${color} border`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
                    <p className="text-3xl font-bold mt-1">{count ?? '—'}</p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">🏪 Vendor Applications</h1>
                        <p className="text-indigo-200 text-sm mt-1">Manage seller registrations and approvals</p>
                    </div>
                    <button onClick={() => navigate('/seller')} className="text-indigo-200 hover:text-white text-sm font-medium">← Admin Dashboard</button>
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard label="Total" count={stats.total} color="bg-gray-100 border-gray-200 text-gray-700" icon="📊" />
                    <StatCard label="Pending" count={stats.pending} color="bg-yellow-50 border-yellow-200 text-yellow-700" icon="⏳" />
                    <StatCard label="Approved" count={stats.approved} color="bg-green-50 border-green-200 text-green-700" icon="✅" />
                    <StatCard label="Rejected" count={stats.rejected} color="bg-red-50 border-red-200 text-red-700" icon="❌" />
                    <StatCard label="On Hold" count={stats.hold} color="bg-orange-50 border-orange-200 text-orange-700" icon="⏸️" />
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Status Filter */}
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(STATUS).map(([key, val]) => (
                                <button
                                    key={key}
                                    onClick={() => setFilterStatus(key)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${filterStatus === key ? 'ring-2 ring-indigo-400 ' + val.color : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                >
                                    {val.icon ? val.icon + ' ' : ''}{val.label}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by name, shop, App No. or Seller ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                        />
                        <button onClick={fetchApplications} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all">🔄 Refresh</button>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-4xl mb-3 animate-spin">⌛</div>
                                <p className="text-gray-500">Loading applications...</p>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-5xl mb-3">📭</span>
                            <p className="font-medium">No applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Photo', 'App No. / Seller ID', 'Shop Details', 'Shop Reg No.', 'Location', 'Date', 'Status', 'Action'].map(h => (
                                            <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(app => {
                                        const s = STATUS[app.status] || STATUS.pending;
                                        return (
                                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    {app.passportPhoto
                                                        ? <img src={app.passportPhoto} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 shadow-sm" />
                                                        : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-400 font-bold text-lg">{app.fullName?.[0]?.toUpperCase()}</div>
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-gray-800 font-mono text-xs">{app.applicationNumber}</p>
                                                    <p className="text-indigo-600 font-mono text-xs mt-0.5">{app.sellerId}</p>
                                                    <p className="text-gray-500 text-xs mt-0.5">{app.fullName}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-gray-800">{app.shopName}</p>
                                                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-medium">{app.shopCategory}</span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{app.shopRegNumber}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{app.city}, {app.state}</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                    {new Date(app.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>
                                                        {s.icon} {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => navigate(`/seller/vendor-applications/${app._id}`)}
                                                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
                                                    >
                                                        View →
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!loading && <p className="text-xs text-gray-400 mt-3 text-right">Showing {filtered.length} of {applications.length} applications</p>}
            </div>
        </div>
    );
};

export default AdminSellerApplications;
