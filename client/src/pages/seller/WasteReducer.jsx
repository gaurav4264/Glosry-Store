import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const WasteReducer = () => {
    const { axios, currency } = useAppContext();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('critical');
    const [showSetExpiry, setShowSetExpiry] = useState(null);
    const [expiryInput, setExpiryInput] = useState('');
    const [mfgInput, setMfgInput] = useState('');

    const fetchDashboard = async () => {
        try {
            const { data } = await axios.get('/api/pantry/dashboard');
            if (data.success) setDashboard(data.dashboard);
        } catch (err) { console.log(err); }
        setLoading(false);
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleSetExpiry = async (productId) => {
        if (!expiryInput && !mfgInput) return toast.error('Please set expiry or manufacturing date');
        try {
            const { data } = await axios.post('/api/pantry/set-expiry', {
                productId,
                expiryDate: expiryInput || undefined,
                manufacturingDate: mfgInput || undefined
            });
            if (data.success) {
                toast.success('Expiry date updated!');
                setShowSetExpiry(null); setExpiryInput(''); setMfgInput('');
                fetchDashboard();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleQuickDiscount = async (productId, percent) => {
        try {
            const { data } = await axios.post('/api/pantry/quick-discount', { productId, discountPercent: percent });
            if (data.success) {
                toast.success(data.message);
                fetchDashboard();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const getDaysLeft = (expiryDate) => {
        if (!expiryDate) return null;
        return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    };

    const getStatusStyle = (expiryDate) => {
        const days = getDaysLeft(expiryDate);
        if (days === null) return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500', label: 'No Expiry', badge: 'bg-gray-200 text-gray-600' };
        if (days <= 0) return { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-600', label: '❌ EXPIRED', badge: 'bg-red-500 text-white' };
        if (days <= 2) return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', label: `⚡ ${days}d left`, badge: 'bg-red-400 text-white' };
        if (days <= 5) return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-600', label: `⚠️ ${days}d left`, badge: 'bg-amber-400 text-white' };
        return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600', label: `✅ ${days}d left`, badge: 'bg-green-500 text-white' };
    };

    if (loading) return <div className="flex-1 flex items-center justify-center h-[95vh]"><div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div></div>;

    const s = dashboard?.summary;
    const tabs = [
        { id: 'critical', label: '🚨 Critical', count: (s?.expired || 0) + (s?.critical || 0), color: 'red' },
        { id: 'expiring', label: '⚠️ Expiring', count: s?.expiringSoon || 0, color: 'amber' },
        { id: 'fresh', label: '✅ Fresh', count: s?.fresh || 0, color: 'green' },
        { id: 'no-expiry', label: '📝 No Date', count: s?.withoutExpiry || 0, color: 'gray' },
    ];

    const getTabProducts = () => {
        if (!dashboard) return [];
        switch (tab) {
            case 'critical': return [...(dashboard.expired || []), ...(dashboard.critical || [])];
            case 'expiring': return dashboard.expiringSoon || [];
            case 'fresh': return dashboard.fresh || [];
            case 'no-expiry': return dashboard.withoutExpiry || [];
            default: return [];
        }
    };

    return (
        <div className="flex-1 h-[95vh] overflow-y-scroll no-scrollbar">
            <div className="p-6 max-w-5xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <h1 className="text-2xl font-bold mb-1">🧠 Smart Waste Reducer</h1>
                    <p className="text-green-100 text-sm">AI-powered expiry tracking — sell before it spoils!</p>
                </div>

                {/* Summary Cards */}
                {s && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{s.expired}</p>
                            <p className="text-xs text-red-500 font-medium">Expired</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-orange-600">{s.critical}</p>
                            <p className="text-xs text-orange-500 font-medium">Critical (2d)</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">{s.expiringSoon}</p>
                            <p className="text-xs text-amber-500 font-medium">Expiring (5d)</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{s.fresh}</p>
                            <p className="text-xs text-green-500 font-medium">Fresh</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">{currency}{s.atRiskValue}</p>
                            <p className="text-xs text-purple-500 font-medium">At Risk Value</p>
                        </div>
                    </div>
                )}

                {/* Estimated Loss Alert */}
                {s && s.estimatedLoss > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-6 flex items-center gap-3">
                        <span className="text-3xl">💸</span>
                        <div>
                            <p className="font-bold text-red-700">Estimated Loss: {currency}{s.estimatedLoss}</p>
                            <p className="text-sm text-red-500">{s.expired} expired products still in stock — remove or discount immediately!</p>
                        </div>
                    </div>
                )}

                {/* AI Tips */}
                {dashboard?.tips && dashboard.tips.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 mb-6">
                        <h3 className="font-bold text-blue-800 mb-3">🤖 AI Recommendations</h3>
                        <div className="space-y-2">
                            {dashboard.tips.map((tip, idx) => (
                                <div key={idx} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${tip.type === 'danger' ? 'bg-red-100/60 text-red-700' : tip.type === 'warning' ? 'bg-amber-100/60 text-amber-700' : tip.type === 'action' ? 'bg-purple-100/60 text-purple-700' : tip.type === 'success' ? 'bg-green-100/60 text-green-700' : 'bg-blue-100/60 text-blue-700'}`}>
                                    {tip.icon} {tip.tip}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${tab === t.id ? `bg-${t.color}-500 text-white shadow-lg` : `bg-${t.color}-50 text-${t.color}-600 hover:bg-${t.color}-100`}`}>
                            {t.label}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : `bg-${t.color}-100`}`}>{t.count}</span>
                        </button>
                    ))}
                </div>

                {/* Product List */}
                <div className="space-y-3">
                    {getTabProducts().length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-4xl mb-3">✅</p>
                            <p className="font-medium">No products in this category</p>
                        </div>
                    ) : (
                        getTabProducts().map(product => {
                            const style = getStatusStyle(product.expiryDate);
                            const days = getDaysLeft(product.expiryDate);
                            return (
                                <div key={product._id} className={`${style.bg} border-l-4 ${style.border} rounded-r-xl p-4 flex flex-col md:flex-row md:items-center gap-4`}>
                                    {/* Product Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <img src={product.image?.[0]} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-bold text-gray-800 truncate">{product.name}</h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {product.category} · Stock: {product.stockQuantity} · Price: {currency}{product.offerPrice}
                                                {product.expiryDate && ` · Expires: ${new Date(product.expiryDate).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap items-center">
                                        {/* Quick Discount Buttons for expiring/expired products */}
                                        {days !== null && days <= 5 && (
                                            <>
                                                <button onClick={() => handleQuickDiscount(product._id, 20)} className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all">
                                                    -20%
                                                </button>
                                                <button onClick={() => handleQuickDiscount(product._id, 40)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all">
                                                    -40%
                                                </button>
                                                <button onClick={() => handleQuickDiscount(product._id, 60)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all">
                                                    -60%
                                                </button>
                                            </>
                                        )}

                                        {/* Set Expiry Button */}
                                        <button onClick={() => { setShowSetExpiry(product._id); setExpiryInput(''); setMfgInput(''); }} className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all">
                                            📅 {product.expiryDate ? 'Update' : 'Set'} Expiry
                                        </button>
                                    </div>

                                    {/* Inline Set Expiry Form */}
                                    {showSetExpiry === product._id && (
                                        <div className="w-full bg-white rounded-xl p-4 mt-2 border border-gray-200 shadow-sm">
                                            <div className="flex gap-3 flex-wrap items-end">
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Manufacturing Date</label>
                                                    <input type="date" value={mfgInput} onChange={e => setMfgInput(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 block mb-1">Expiry Date</label>
                                                    <input type="date" value={expiryInput} onChange={e => setExpiryInput(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                                                </div>
                                                <button onClick={() => handleSetExpiry(product._id)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-medium">
                                                    ✓ Save
                                                </button>
                                                <button onClick={() => setShowSetExpiry(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs px-4 py-2 rounded-lg font-medium">
                                                    ✕ Cancel
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">💡 Tip: Set manufacturing date and expiry auto-calculates based on category shelf life!</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Category Risk Map */}
                {dashboard?.categoryRisk && Object.keys(dashboard.categoryRisk).length > 0 && (
                    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-700 mb-3">📊 Category Risk Map</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(dashboard.categoryRisk).map(([cat, info]) => (
                                <div key={cat} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="font-medium text-gray-700 text-sm">{cat}</p>
                                    <div className="flex gap-3 mt-1 text-xs">
                                        <span className="text-green-600">{info.total} total</span>
                                        {info.atRisk > 0 && <span className="text-amber-600">⚠️ {info.atRisk} at risk</span>}
                                        {info.expired > 0 && <span className="text-red-600">❌ {info.expired} expired</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WasteReducer;
