import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Packing': 'bg-yellow-100 text-yellow-700',
    'Shipped': 'bg-indigo-100 text-indigo-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Returned': 'bg-gray-100 text-gray-600',
};

const VENDOR_STATUS_COLORS = {
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'Packed': 'bg-purple-100 text-purple-700 border-purple-200',
    'Shipped': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-green-100 text-green-700 border-green-200',
};

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, delivered: 0 });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState(null); // orderId being updated

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/seller/vendor-orders');
            if (data.success) {
                setOrders(data.orders);
                setStats(data.stats);
            }
        } catch (e) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateOrderStatus = async (orderId, vendorStatus) => {
        setUpdating(orderId);
        try {
            const { data } = await axios.post('/api/seller/vendor-update-order', { orderId, vendorStatus });
            if (data.success) {
                toast.success(`Order ${vendorStatus}! ${data.trackingId ? '📦 Tracking: ' + data.trackingId : ''}`);
                fetchOrders(); // Refresh
            } else {
                toast.error(data.message);
            }
        } catch (e) { toast.error(e.message); }
        finally { setUpdating(null); }
    };

    const filtered = useMemo(() => {
        let result = [...orders];
        if (filterStatus !== 'all') result = result.filter(o => o.vendorStatus === filterStatus);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o._id.toString().includes(q) ||
                o.myItems.some(i => i.productName.toLowerCase().includes(q)) ||
                (o.trackingId && o.trackingId.toLowerCase().includes(q))
            );
        }
        return result;
    }, [orders, filterStatus, searchQuery]);

    const statCards = [
        { icon: '🛒', label: 'Total Orders', value: stats.total, color: 'text-indigo-600 bg-indigo-50' },
        { icon: '💰', label: 'Revenue', value: `₹${stats.revenue?.toLocaleString()}`, color: 'text-green-600 bg-green-50' },
        { icon: '⏳', label: 'Pending', value: stats.pending, color: 'text-orange-600 bg-orange-50' },
        { icon: '✅', label: 'Delivered', value: stats.delivered, color: 'text-teal-600 bg-teal-50' },
    ];

    const getNextStatuses = (vendorStatus) => {
        switch (vendorStatus) {
            case 'Pending': return [
                { label: '✅ Accept', status: 'Accepted', className: 'bg-green-600 hover:bg-green-700 text-white' },
                { label: '❌ Reject', status: 'Rejected', className: 'bg-red-500 hover:bg-red-600 text-white' }
            ];
            case 'Accepted': return [
                { label: '📦 Mark Packed', status: 'Packed', className: 'bg-purple-600 hover:bg-purple-700 text-white' }
            ];
            case 'Packed': return [
                { label: '🚚 Mark Shipped', status: 'Shipped', className: 'bg-indigo-600 hover:bg-indigo-700 text-white' }
            ];
            case 'Shipped': return [
                { label: '🏠 Mark Delivered', status: 'Delivered', className: 'bg-teal-600 hover:bg-teal-700 text-white' }
            ];
            default: return [];
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 My Orders</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {statCards.map(c => (
                    <div key={c.label} className={`rounded-2xl p-4 ${c.color} border border-current/10`}>
                        <p className="text-2xl font-bold">{c.value}</p>
                        <p className="text-xs font-medium opacity-70 mt-1">{c.icon} {c.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center flex-1 min-w-[180px] border border-gray-200 rounded-xl bg-white px-3 py-2 gap-2">
                    <span>🔍</span>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID, product or tracking..."
                        className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="all">All Status</option>
                    {Object.keys(VENDOR_STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-300 animate-pulse text-4xl">⌛</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400 font-medium">No orders found</p>
                    <p className="text-xs text-gray-300 mt-1">Orders appear here when customers buy your products</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => {
                        const actions = getNextStatuses(order.vendorStatus);
                        const isUpdating = updating === order._id;
                        return (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Vendor Status Badge */}
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${VENDOR_STATUS_COLORS[order.vendorStatus] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.vendorStatus}
                                        </span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tracking ID */}
                                {order.trackingId && (
                                    <div className="mb-3 bg-indigo-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-indigo-100">
                                        <span className="text-indigo-500">🚚</span>
                                        <span className="text-xs text-indigo-700 font-semibold">Tracking ID: </span>
                                        <span className="text-xs font-mono text-indigo-900 font-bold">{order.trackingId}</span>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                {order.address && (
                                    <div className="mb-3 bg-gray-50 rounded-xl px-4 py-2.5 flex items-start gap-2 border border-gray-100">
                                        <span className="text-gray-400 mt-0.5">📍</span>
                                        <div className="text-xs text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-700">Deliver to: </span>
                                            {[order.address.street, order.address.city, order.address.state, order.address.zipcode].filter(Boolean).join(', ')}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="space-y-2 mb-4">
                                    {order.myItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                            <img src={item.productImage || 'https://placehold.co/48x48?text=?'} alt=""
                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                onError={e => e.target.src = 'https://placehold.co/48x48?text=?'} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-700 text-sm truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                            <p className="font-bold text-indigo-600 text-sm">₹{item.subtotal}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer — Revenue + Actions */}
                                <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 gap-3">
                                    <p className="font-bold text-green-600">My Revenue: ₹{order.myRevenue.toLocaleString()}</p>
                                    {/* Action Buttons */}
                                    {actions.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {actions.map(action => (
                                                <button
                                                    key={action.status}
                                                    onClick={() => updateOrderStatus(order._id, action.status)}
                                                    disabled={isUpdating}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${action.className} disabled:opacity-50`}
                                                >
                                                    {isUpdating ? '⏳...' : action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {order.vendorStatus === 'Delivered' && (
                                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">🎉 Order Completed</span>
                                    )}
                                    {order.vendorStatus === 'Rejected' && (
                                        <span className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-1.5 rounded-full border border-red-200">❌ Order Rejected</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
