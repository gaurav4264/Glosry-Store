import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SHOP_CATEGORIES = ['Grocery', 'Vegetables', 'Fruits', 'Dairy', 'Snacks',
    'Household Items', 'Bakery', 'Beverages', 'Personal Care', 'Other'];

const ORDER_STATUSES = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

const STATUS_COLORS = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Packing': 'bg-yellow-100 text-yellow-700',
    'Shipped': 'bg-indigo-100 text-indigo-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Returned': 'bg-gray-100 text-gray-600',
};

const AdminAllOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revenueStats, setRevenueStats] = useState(null);

    // Pre-fill sellerId from URL params (when coming from AdminVendors)
    const urlSellerId = new URLSearchParams(location.search).get('sellerId') || '';

    const [filters, setFilters] = useState({ city: '', sellerId: urlSellerId, status: 'all', startDate: '', endDate: '', shopCategory: '' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 30 });
            if (filters.city) params.append('city', filters.city);
            if (filters.sellerId) params.append('sellerId', filters.sellerId);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.shopCategory) params.append('shopCategory', filters.shopCategory);

            const { data } = await axios.get(`/api/admin/all-orders?${params.toString()}`);
            if (data.success) {
                setOrders(data.orders);
                setTotal(data.total);
                setStats({ totalRevenue: data.totalRevenue, commission: data.commission });
            }
        } catch { toast.error('Failed to fetch orders'); }
        finally { setLoading(false); }
    };

    const fetchRevenueStats = async () => {
        try {
            const { data } = await axios.get('/api/admin/revenue-stats');
            if (data.success) setRevenueStats(data.stats);
        } catch { /* silent */ }
    };

    useEffect(() => { fetchOrders(); }, [filters, page]);
    useEffect(() => { fetchRevenueStats(); }, []);

    const filtered = useMemo(() => {
        if (!search) return orders;
        const q = search.toLowerCase();
        return orders.filter(o =>
            o._id?.toString().includes(q) ||
            o.sellerId?.toLowerCase().includes(q) ||
            o.sellerInfo?.shopName?.toLowerCase().includes(q) ||
            o.trackingId?.toLowerCase().includes(q)
        );
    }, [orders, search]);

    const handleFilterChange = (e) => {
        setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({ city: '', sellerId: '', status: 'all', startDate: '', endDate: '', shopCategory: '' });
        setSearch('');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-8 py-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">📦 All Orders — Admin View</h1>
                        <p className="text-indigo-200 text-sm mt-1">Track orders across all sellers and cities</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/seller/vendors')} className="text-indigo-200 hover:text-white text-sm font-semibold px-3 py-1.5 bg-white/10 rounded-xl">🏪 Shops</button>
                        <button onClick={() => navigate('/seller')} className="text-indigo-200 hover:text-white text-sm font-medium">← Dashboard</button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* Revenue Stats */}
                {revenueStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Total Orders', value: revenueStats.totalOrders, icon: '🛒', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                            { label: 'Total Revenue', value: `₹${revenueStats.totalRevenue?.toLocaleString()}`, icon: '💰', color: 'bg-green-50 border-green-200 text-green-700' },
                            { label: 'Commission (5%)', value: `₹${revenueStats.totalCommission?.toLocaleString()}`, icon: '🏦', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                            { label: 'Delivered', value: revenueStats.delivered, icon: '✅', color: 'bg-teal-50 border-teal-200 text-teal-700' },
                        ].map(c => (
                            <div key={c.label} className={`rounded-2xl p-5 border ${c.color}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{c.label}</p>
                                        <p className="text-2xl font-bold mt-1">{c.value ?? '—'}</p>
                                    </div>
                                    <span className="text-3xl">{c.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <input name="city" value={filters.city} onChange={handleFilterChange}
                            placeholder="🏙️ City / Area"
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        <input name="sellerId" value={filters.sellerId} onChange={handleFilterChange}
                            placeholder="🔑 Seller ID"
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        <select name="shopCategory" value={filters.shopCategory} onChange={handleFilterChange}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-gray-50">
                            <option value="">🏷️ All Categories</option>
                            {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-gray-50">
                            <option value="all">All Status</option>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                    </div>
                    <div className="flex gap-3 mt-3">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="🔍 Search by Order ID, Seller ID, Tracking ID..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        <button onClick={resetFilters}
                            className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
                            🔄 Reset
                        </button>
                    </div>
                    {(filters.sellerId || filters.shopCategory || filters.city) && (
                        <div className="flex gap-2 flex-wrap mt-3">
                            {filters.sellerId && <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">🔑 {filters.sellerId} <button onClick={() => setFilters(p => ({ ...p, sellerId: '' }))} className="ml-1 opacity-60 hover:opacity-100">✕</button></span>}
                            {filters.shopCategory && <span className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full">🏷️ {filters.shopCategory} <button onClick={() => setFilters(p => ({ ...p, shopCategory: '' }))} className="ml-1 opacity-60 hover:opacity-100">✕</button></span>}
                            {filters.city && <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">🏙️ {filters.city} <button onClick={() => setFilters(p => ({ ...p, city: '' }))} className="ml-1 opacity-60 hover:opacity-100">✕</button></span>}
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-4xl mb-3 animate-spin">⌛</div>
                                <p className="text-gray-500">Loading orders...</p>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-5xl mb-3">📭</span>
                            <p className="font-medium">No orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {['Order ID', 'Date', 'Seller / Shop', 'City', 'Amount', 'Status', 'Tracking ID'].map(h => (
                                            <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-mono text-xs text-gray-700 font-bold">#{order._id.slice(-8).toUpperCase()}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.sellerInfo ? (
                                                    <div className="flex items-center gap-2">
                                                        {order.sellerInfo.shopLogo
                                                            ? <img src={order.sellerInfo.shopLogo} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                                                            : <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xs font-bold">{order.sellerInfo.shopName?.[0]}</div>}
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-xs">{order.sellerInfo.shopName}</p>
                                                            <p className="font-mono text-xs text-indigo-500">{order.sellerId}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">{order.sellerId || 'Unassigned'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {order.sellerInfo?.city || order.address?.city || '—'}
                                                {order.sellerInfo?.area && <p className="text-gray-400">{order.sellerInfo.area}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-800">₹{order.amount?.toLocaleString()}</p>
                                                {order.discount > 0 && <p className="text-xs text-green-500">-₹{order.discount} off</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {order.trackingId
                                                    ? <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{order.trackingId}</span>
                                                    : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && total > 30 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400">Showing {filtered.length} of {total} orders</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40">← Prev</button>
                                <span className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg">Page {page}</span>
                                <button onClick={() => setPage(p => p + 1)} disabled={filtered.length < 30}
                                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40">Next →</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Sellers by Revenue */}
                {revenueStats?.revenueBySeller?.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-700 mb-4">🏆 Top Sellers by Revenue</h3>
                        <div className="space-y-2">
                            {revenueStats.revenueBySeller.slice(0, 5).map((s, i) => (
                                <div key={s.sellerId} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}.`}</span>
                                        <span className="font-mono text-xs text-indigo-600 font-bold">{s.sellerId}</span>
                                    </div>
                                    <span className="font-bold text-gray-800">₹{s.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monthly Revenue */}
                {revenueStats?.monthlyRevenue?.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-700 mb-4">📈 Monthly Revenue (Last 6 Months)</h3>
                        <div className="flex gap-3 items-end justify-between">
                            {revenueStats.monthlyRevenue.map(m => {
                                const max = Math.max(...revenueStats.monthlyRevenue.map(x => x.revenue), 1);
                                const height = Math.max(8, Math.round((m.revenue / max) * 100));
                                return (
                                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-gray-700">₹{m.revenue > 999 ? (m.revenue / 1000).toFixed(1) + 'k' : m.revenue}</span>
                                        <div className="w-full bg-indigo-600 rounded-t-lg transition-all" style={{ height: `${height}px` }} />
                                        <span className="text-xs text-gray-500 font-medium">{m.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAllOrders;
