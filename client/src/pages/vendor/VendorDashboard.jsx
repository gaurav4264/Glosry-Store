import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VendorDashboard = () => {
    const { vendor } = useOutletContext() || {};
    const navigate = useNavigate();
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0, delivered: 0, reviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodRes, orderRes] = await Promise.all([
                    axios.get('/api/seller/vendor-products'),
                    axios.get('/api/seller/vendor-orders'),
                ]);
                const products = prodRes.data.success ? prodRes.data.products : [];
                const orderStats = orderRes.data.success ? orderRes.data.stats : {};
                const totalReviews = products.reduce((sum, p) => sum + (p.ratings?.length || 0), 0);
                setStats({
                    products: products.length,
                    orders: orderStats.total || 0,
                    revenue: orderStats.revenue || 0,
                    pending: orderStats.pending || 0,
                    delivered: orderStats.delivered || 0,
                    reviews: totalReviews,
                });
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const statCards = [
        { icon: '📦', label: 'My Products', value: stats.products, color: 'from-indigo-500 to-purple-600', path: '/vendor/products' },
        { icon: '🛒', label: 'Total Orders', value: stats.orders, color: 'from-green-500 to-emerald-600', path: '/vendor/orders' },
        { icon: '💰', label: 'Revenue (₹)', value: `₹${stats.revenue.toLocaleString()}`, color: 'from-orange-400 to-amber-500', path: '/vendor/orders' },
        { icon: '⏳', label: 'Pending Orders', value: stats.pending, color: 'from-blue-500 to-cyan-600', path: '/vendor/orders' },
        { icon: '✅', label: 'Delivered', value: stats.delivered, color: 'from-teal-500 to-green-600', path: '/vendor/orders' },
        { icon: '⭐', label: 'Total Reviews', value: stats.reviews, color: 'from-yellow-400 to-orange-500', path: '/vendor/reviews' },
    ];

    const quickLinks = [
        { icon: '➕', label: 'Add Product', desc: 'List a new product', path: '/vendor/add-product', color: 'from-indigo-500 to-purple-600' },
        { icon: '📦', label: 'My Products', desc: 'Manage your listings', path: '/vendor/products', color: 'from-blue-500 to-indigo-600' },
        { icon: '🛒', label: 'Orders', desc: 'Track incoming orders', path: '/vendor/orders', color: 'from-green-500 to-emerald-600' },
        { icon: '⭐', label: 'Reviews', desc: 'Customer feedback', path: '/vendor/reviews', color: 'from-yellow-400 to-orange-500' },
    ];

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-6 mb-7 shadow-lg">
                <div className="flex items-center gap-4">
                    {vendor?.shopLogo
                        ? <img src={vendor.shopLogo} alt="Shop Logo" className="w-16 h-16 rounded-xl object-cover border-4 border-white/30 shadow-lg" />
                        : vendor?.passportPhoto
                            ? <img src={vendor.passportPhoto} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white/30 shadow-lg" />
                            : <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">{vendor?.shopName?.[0] || '🛒'}</div>
                    }
                    <div>
                        <p className="text-indigo-200 text-sm">Welcome back,</p>
                        <h1 className="text-2xl font-bold">{vendor?.shopName}</h1>
                        <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">{vendor?.shopCategory}</span>
                            <span className="text-indigo-200 text-xs">📍 {vendor?.city}{vendor?.area ? `, ${vendor.area}` : ''}{vendor?.pinCode ? ` - ${vendor.pinCode}` : ''}</span>
                            <span className="bg-white/10 font-mono text-xs px-2 py-0.5 rounded-full">{vendor?.sellerId}</span>
                        </div>
                        {vendor?.pickupAddress && (
                            <p className="text-indigo-200 text-xs mt-1">🏠 Pickup: {vendor.pickupAddress}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <h2 className="text-lg font-bold text-gray-700 mb-4">Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {statCards.map(card => (
                    <button key={card.label} onClick={() => navigate(card.path)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                            {card.icon}
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                            {loading ? <span className="inline-block w-10 h-6 bg-gray-100 rounded animate-pulse" /> : card.value}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{card.label}</p>
                    </button>
                ))}
            </div>

            {/* Quick Links */}
            <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map(link => (
                    <button key={link.path} onClick={() => navigate(link.path)}
                        className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group text-left">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center text-xl shadow group-hover:scale-110 transition-transform flex-shrink-0`}>
                            {link.icon}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{link.label}</p>
                            <p className="text-xs text-gray-400">{link.desc}</p>
                        </div>
                        <span className="ml-auto text-gray-200 group-hover:text-indigo-400 transition-colors text-xl">→</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VendorDashboard;
