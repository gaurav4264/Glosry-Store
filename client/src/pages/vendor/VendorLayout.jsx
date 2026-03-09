import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorLayout = () => {
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.get('/api/seller/vendor-is-auth');
                if (data.success) {
                    setVendor(data.seller);
                    fetchLowStock();
                } else {
                    toast.error('Please login as a seller');
                    navigate('/seller-vendor-login');
                }
            } catch {
                navigate('/seller-vendor-login');
            }
        };
        checkAuth();
    }, []);

    const fetchLowStock = async () => {
        try {
            const { data } = await axios.get('/api/seller/vendor-low-stock');
            if (data.success) {
                setLowStockCount(data.count);
                if (data.count > 0) {
                    toast.error(`⚠️ Alert: ${data.count} product(s) are low on stock!`, {
                        duration: 5000,
                        position: 'top-right',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching low stock:', error);
        }
    };

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/vendor-logout');
            if (data.success) {
                toast.success('Logged out successfully');
                navigate('/seller-vendor-login');
            }
        } catch {
            toast.error('Logout failed');
        }
    };

    const navLinks = [
        { name: 'Dashboard', path: '/vendor', icon: '📊' },
        { name: 'Add Product', path: '/vendor/add-product', icon: '➕' },
        { name: 'My Products', path: '/vendor/products', icon: '📦', badge: lowStockCount },
        { name: 'Orders', path: '/vendor/orders', icon: '🛒' },
        { name: 'Reviews', path: '/vendor/reviews', icon: '⭐' },
        { name: 'Shop Profile', path: '/vendor/profile', icon: '🏪' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* ── Sidebar ── */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-indigo-700 to-purple-800 text-white flex flex-col transition-all duration-300 shadow-xl flex-shrink-0`}>
                {/* Brand */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🛒</div>
                    {sidebarOpen && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm leading-tight">Seller Panel</p>
                            <p className="text-indigo-200 text-xs truncate">{vendor?.shopName || 'My Shop'}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 space-y-1 px-2">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === '/vendor'}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${isActive
                                    ? 'bg-white/20 text-white shadow-sm'
                                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-lg flex-shrink-0">{link.icon}</span>
                                {sidebarOpen && <span className="truncate">{link.name}</span>}
                            </div>
                            {link.badge > 0 && sidebarOpen && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {link.badge}
                                </span>
                            )}
                            {link.badge > 0 && !sidebarOpen && (
                                <span className="absolute ml-5 -mt-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"></span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Seller Info at Bottom */}
                {vendor && sidebarOpen && (
                    <div className="mx-3 mb-3 p-3 bg-white/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            {vendor.passportPhoto
                                ? <img src={vendor.passportPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-white/30" />
                                : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{vendor.fullName?.[0]}</div>
                            }
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{vendor.fullName}</p>
                                <p className="text-xs text-indigo-300 font-mono truncate">{vendor.sellerId}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-all">
                            Logout →
                        </button>
                    </div>
                )}
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500"
                        >
                            ☰
                        </button>
                        <div>
                            <p className="font-bold text-gray-800 leading-tight">{vendor?.shopName || '...'}</p>
                            <p className="text-xs text-gray-400">{vendor?.shopCategory} · {vendor?.city}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-xs text-indigo-600 hover:underline font-medium">View Store →</Link>
                        <button onClick={logout} className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl text-xs hover:bg-red-100 transition-all border border-red-100">
                            🚪 Logout
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <Outlet context={{ vendor }} />
                </div>
            </div>
        </div>
    );
};

export default VendorLayout;
