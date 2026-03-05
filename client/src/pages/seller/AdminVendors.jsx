import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SHOP_CATEGORIES = ['All', 'Grocery', 'Vegetables', 'Fruits', 'Dairy', 'Snacks',
    'Household Items', 'Bakery', 'Beverages', 'Personal Care', 'Other'];

const STATUS_COLORS = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    hold: 'bg-gray-100 text-gray-600 border-gray-200',
};

const AdminVendors = () => {
    const navigate = useNavigate();
    const { axios: appAxios } = useAppContext();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterCity, setFilterCity] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSellers();
        fetchStats();
    }, []);

    const fetchSellers = async () => {
        try {
            const { data } = await appAxios.get('/api/admin/sellers?limit=200');
            if (data.success) setSellers(data.applications);
            else toast.error(data.message || 'Failed to load sellers');
        } catch (e) { toast.error('Failed to load sellers: ' + e.message); }
        finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const { data } = await appAxios.get('/api/admin/sellers/stats');
            if (data.success) setStats(data.stats);
        } catch { }
    };

    const openSellerProducts = async (seller) => {
        setSelectedSeller(seller);
        setSellerProducts([]);
        setProductsLoading(true);
        try {
            const { data } = await appAxios.get(`/api/admin/vendor-products/${seller._id}`);
            if (data.success) setSellerProducts(data.products);
            else toast.error(data.message);
        } catch { toast.error('Could not load products'); }
        finally { setProductsLoading(false); }
    };

    const filtered = useMemo(() => {
        let r = [...sellers];
        if (filterStatus !== 'all') r = r.filter(s => s.status === filterStatus);
        if (filterCategory !== 'All') r = r.filter(s => s.shopCategory === filterCategory);
        if (filterCity.trim()) r = r.filter(s => s.city?.toLowerCase().includes(filterCity.toLowerCase())
            || s.area?.toLowerCase().includes(filterCity.toLowerCase()));
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(s => s.shopName?.toLowerCase().includes(q)
                || s.fullName?.toLowerCase().includes(q)
                || s.sellerId?.toLowerCase().includes(q)
                || s.email?.toLowerCase().includes(q));
        }
        return r;
    }, [sellers, filterStatus, filterCategory, filterCity, search]);

    const statCards = [
        { label: 'Total Shops', value: stats?.total, icon: '🏪', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
        { label: 'Approved', value: stats?.approved, icon: '✅', color: 'text-green-700 bg-green-50 border-green-200' },
        { label: 'Pending', value: stats?.pending, icon: '⏳', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
        { label: 'Rejected/Hold', value: (stats?.rejected || 0) + (stats?.hold || 0), icon: '❌', color: 'text-red-700 bg-red-50 border-red-200' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-8 py-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">🏪 Registered Shops</h1>
                        <p className="text-indigo-200 text-sm mt-1">View all sellers, their products, and orders</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/seller/all-orders')}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all">
                            📦 All Orders
                        </button>
                        <button onClick={() => navigate('/seller/vendor-applications')}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all">
                            📋 Applications
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {statCards.map(c => (
                            <div key={c.label} className={`rounded-2xl p-4 border ${c.color}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-60">{c.label}</p>
                                        <p className="text-3xl font-bold mt-1">{c.value ?? '—'}</p>
                                    </div>
                                    <span className="text-3xl">{c.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 md:col-span-1">
                            <span>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search shop, name, seller ID..."
                                className="w-full text-sm outline-none bg-transparent placeholder-gray-400" />
                        </div>
                        {/* Status */}
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none">
                            <option value="all">All Status</option>
                            <option value="approved">✅ Approved</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="rejected">❌ Rejected</option>
                            <option value="hold">⏸️ On Hold</option>
                        </select>
                        {/* Category */}
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none">
                            {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? '🏷️ All Categories' : c}</option>)}
                        </select>
                        {/* City/Area */}
                        <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
                            placeholder="🏙️ Filter by City / Area"
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none" />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-sm text-gray-400">Showing <strong className="text-gray-700">{filtered.length}</strong> of {sellers.length} shops</p>
                        <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterCategory('All'); setFilterCity(''); }}
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">🔄 Reset Filters</button>
                    </div>
                </div>

                {/* Seller Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-100" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-3">🔍</p>
                        <p className="text-gray-500 font-medium">No shops found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(seller => (
                            <div key={seller._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                                {/* Shop Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    {seller.shopLogo
                                        ? <img src={seller.shopLogo} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                                        : <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">
                                            {seller.shopName?.[0] || '🏪'}
                                        </div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate">{seller.shopName}</p>
                                        <p className="text-xs text-gray-500 truncate">{seller.fullName}</p>
                                        <p className="text-xs font-mono text-indigo-500 mt-0.5">{seller.sellerId}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLORS[seller.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                        {seller.status}
                                    </span>
                                </div>

                                {/* Shop Info */}
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>🏷️</span><span className="font-medium">{seller.shopCategory}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📍</span>
                                        <span>{seller.city}{seller.area ? `, ${seller.area}` : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📧</span><span className="truncate">{seller.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>📅</span>
                                        <span>Registered: {new Date(seller.registrationDate || seller.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openSellerProducts(seller)}
                                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all"
                                    >
                                        📦 View Products
                                    </button>
                                    <button
                                        onClick={() => navigate(`/seller/all-orders?sellerId=${seller.sellerId}`)}
                                        className="flex-1 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-xs font-bold transition-all"
                                    >
                                        🛒 View Orders
                                    </button>
                                    <button
                                        onClick={() => navigate(`/seller/vendor-applications/${seller._id}`)}
                                        className="py-2 px-3 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Products Modal */}
            {selectedSeller && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSeller(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectedSeller.shopLogo
                                    ? <img src={selectedSeller.shopLogo} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                                    : <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{selectedSeller.shopName?.[0]}</div>
                                }
                                <div>
                                    <h2 className="font-bold text-gray-800">{selectedSeller.shopName}</h2>
                                    <p className="text-xs text-gray-400">{selectedSeller.shopCategory} · {selectedSeller.city}{selectedSeller.area ? `, ${selectedSeller.area}` : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedSeller(null)} className="text-gray-400 hover:text-gray-700 text-xl w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {productsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="text-4xl animate-spin mb-3">⌛</div>
                                    <p className="text-gray-400">Loading products...</p>
                                </div>
                            ) : sellerProducts.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-4xl mb-2">📭</p>
                                    <p className="font-medium">No products added yet</p>
                                    <p className="text-xs mt-1 text-gray-300">This seller hasn't added any products</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500 mb-4 font-semibold">{sellerProducts.length} product{sellerProducts.length !== 1 ? 's' : ''} listed</p>
                                    <div className="space-y-3">
                                        {sellerProducts.map(p => (
                                            <div key={p._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <img src={p.image?.[0] || 'https://placehold.co/48x48?text=?'} alt=""
                                                    className="w-14 h-14 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                                                    onError={e => e.target.src = 'https://placehold.co/48x48?text=?'} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                                                    <p className="text-xs text-indigo-500 font-medium">{p.category}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-bold text-gray-800 text-sm">₹{p.offerPrice}</span>
                                                        {p.price > p.offerPrice && <span className="text-xs text-gray-400 line-through">₹{p.price}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.inStock && p.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                        {p.inStock && p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of Stock'}
                                                    </span>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 flex gap-2">
                            <button
                                onClick={() => { setSelectedSeller(null); navigate(`/seller/all-orders?sellerId=${selectedSeller.sellerId}`); }}
                                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all"
                            >
                                🛒 View This Seller's Orders
                            </button>
                            <button onClick={() => setSelectedSeller(null)}
                                className="py-2.5 px-5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
