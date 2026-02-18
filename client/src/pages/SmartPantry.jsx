import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Frozen', 'Beverages', 'Snacks', 'Grains', 'Spices', 'Canned', 'Instant Food', 'Organic'];
const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'dozen', 'pack'];

const SmartPantry = () => {
    const { axios, user, navigate, currency } = useAppContext();
    const [items, setItems] = useState([]);
    const [alerts, setAlerts] = useState(null);
    const [wasteStats, setWasteStats] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', category: 'Vegetables', quantity: 1, unit: 'pcs', expiryDate: '', notes: '' });

    const fetchItems = async () => {
        try {
            const { data } = await axios.get('/api/user-pantry/items');
            if (data.success) setItems(data.items);
        } catch (err) { console.log(err); }
    };

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get('/api/user-pantry/alerts');
            if (data.success) setAlerts(data.alerts);
        } catch (err) { console.log(err); }
    };

    const fetchWasteStats = async () => {
        try {
            const { data } = await axios.get('/api/user-pantry/waste-stats');
            if (data.success) setWasteStats(data.stats);
        } catch (err) { console.log(err); }
    };

    useEffect(() => {
        if (user) {
            Promise.all([fetchItems(), fetchAlerts(), fetchWasteStats()]).then(() => setLoading(false));
        }
    }, [user]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/user-pantry/add', form);
            if (data.success) {
                toast.success('Item added to pantry!');
                setShowAddForm(false);
                setForm({ name: '', category: 'Vegetables', quantity: 1, unit: 'pcs', expiryDate: '', notes: '' });
                fetchItems(); fetchAlerts(); fetchWasteStats();
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handleConsume = async (itemId) => {
        try {
            const { data } = await axios.put('/api/user-pantry/update', { itemId, status: 'consumed' });
            if (data.success) { toast.success('Marked as consumed!'); fetchItems(); fetchWasteStats(); }
        } catch (err) { toast.error(err.message); }
    };

    const handleDelete = async (itemId) => {
        try {
            const { data } = await axios.delete('/api/user-pantry/delete', { data: { itemId } });
            if (data.success) { toast.success('Item removed!'); fetchItems(); fetchAlerts(); fetchWasteStats(); }
        } catch (err) { toast.error(err.message); }
    };

    const getDaysLeft = (expiryDate) => {
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'fresh': return 'from-emerald-400 to-green-500';
            case 'expiring-soon': return 'from-amber-400 to-orange-500';
            case 'expired': return 'from-red-400 to-rose-500';
            case 'consumed': return 'from-blue-400 to-indigo-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'fresh': return '🟢 Fresh';
            case 'expiring-soon': return '🟡 Expiring Soon';
            case 'expired': return '🔴 Expired';
            case 'consumed': return '🔵 Consumed';
            default: return status;
        }
    };

    const getProgressWidth = (item) => {
        const totalDays = Math.ceil((new Date(item.expiryDate) - new Date(item.purchaseDate)) / (1000 * 60 * 60 * 24));
        const daysLeft = getDaysLeft(item.expiryDate);
        const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
        return progress;
    };

    const filteredItems = items.filter(i => {
        if (filter === 'all') return true;
        return i.status === filter;
    });

    if (!user) return (
        <div className="mt-20 text-center py-20">
            <p className="text-6xl mb-4">🔒</p>
            <p className="text-xl font-medium text-gray-600">Please login to access Smart Pantry</p>
        </div>
    );

    return (
        <div className="mt-16 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">🧠 Smart Pantry</h1>
                    <p className="text-green-100 text-lg">AI-Powered Inventory & Expiry Tracker</p>
                    <div className="flex gap-3 mt-4 flex-wrap">
                        <button onClick={() => setShowAddForm(true)} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                            ➕ Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Waste Stats Cards */}
            {wasteStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <p className="text-3xl font-bold text-green-600 mb-1">{wasteStats.fresh}</p>
                        <p className="text-sm text-green-700 font-medium">🟢 Fresh Items</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <p className="text-3xl font-bold text-amber-600 mb-1">{wasteStats.expiringSoon}</p>
                        <p className="text-sm text-amber-700 font-medium">🟡 Expiring Soon</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <p className="text-3xl font-bold text-blue-600 mb-1">{currency}{wasteStats.estimatedSavings}</p>
                        <p className="text-sm text-blue-700 font-medium">💰 Estimated Savings</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <p className="text-3xl font-bold text-teal-600 mb-1">{wasteStats.co2Prevented}kg</p>
                        <p className="text-sm text-teal-700 font-medium">🌍 CO₂ Prevented</p>
                    </div>
                </div>
            )}

            {/* AI Tips */}
            {wasteStats && wasteStats.tips.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">🤖 AI Smart Tips</h3>
                    <div className="space-y-2">
                        {wasteStats.tips.map((tip, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-purple-700 text-sm font-medium border border-purple-100/50 hover:bg-white transition-all">
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">➕ Add Pantry Item</h3>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Item Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tomatoes" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
                                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                                    <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Expiry Date <span className="text-gray-400">(optional)</span></label>
                                    <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                                Add to Pantry
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'fresh', 'expiring-soon', 'expired', 'consumed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${filter === f ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f === 'all' ? '📋 All' : f === 'fresh' ? '🟢 Fresh' : f === 'expiring-soon' ? '🟡 Expiring' : f === 'expired' ? '🔴 Expired' : '🔵 Consumed'}
                    </button>
                ))}
            </div>

            {/* Pantry Items */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading pantry...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-6xl mb-4">🥬</p>
                    <p className="text-lg font-medium">No items in pantry</p>
                    <p className="text-sm mt-1">Add items to start tracking freshness & reduce waste!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => {
                        const daysLeft = getDaysLeft(item.expiryDate);
                        const progress = getProgressWidth(item);
                        return (
                            <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                                        <p className="text-sm text-gray-400">{item.category} · {item.quantity} {item.unit}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(item.status)} text-white`}>
                                        {getStatusBadge(item.status)}
                                    </span>
                                </div>

                                {/* Expiry Progress Bar */}
                                {item.status !== 'consumed' && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Purchased {new Date(item.purchaseDate).toLocaleDateString()}</span>
                                            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-full rounded-full bg-gradient-to-r ${daysLeft <= 0 ? 'from-red-400 to-red-500' : daysLeft <= 3 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-green-500'} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}

                                {item.notes && <p className="text-xs text-gray-400 italic mb-3">📝 {item.notes}</p>}

                                {/* Actions */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {item.status !== 'consumed' && (
                                        <button onClick={() => handleConsume(item._id)} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs py-2 rounded-lg font-medium hover:shadow-md transition-all">
                                            ✅ Consumed
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(item._id)} className="flex-1 bg-gradient-to-r from-red-400 to-rose-500 text-white text-xs py-2 rounded-lg font-medium hover:shadow-md transition-all">
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Expiry Alerts Panel */}
            {alerts && alerts.total > 0 && (
                <div className="mt-10 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-red-700 mb-4">⚠️ Expiry Alerts ({alerts.total})</h3>
                    <div className="space-y-3">
                        {alerts.expired.length > 0 && (
                            <div className="bg-red-100/50 rounded-xl p-3">
                                <p className="font-semibold text-red-700 text-sm">🔴 Expired ({alerts.expired.length})</p>
                                <p className="text-red-600 text-xs mt-1">{alerts.expired.map(i => i.name).join(', ')}</p>
                            </div>
                        )}
                        {alerts.expiringToday.length > 0 && (
                            <div className="bg-orange-100/50 rounded-xl p-3">
                                <p className="font-semibold text-orange-700 text-sm">🟠 Expiring Today ({alerts.expiringToday.length})</p>
                                <p className="text-orange-600 text-xs mt-1">{alerts.expiringToday.map(i => i.name).join(', ')}</p>
                            </div>
                        )}
                        {alerts.expiring3Days.length > 0 && (
                            <div className="bg-amber-100/50 rounded-xl p-3">
                                <p className="font-semibold text-amber-700 text-sm">🟡 Within 3 Days ({alerts.expiring3Days.length})</p>
                                <p className="text-amber-600 text-xs mt-1">{alerts.expiring3Days.map(i => i.name).join(', ')}</p>
                            </div>
                        )}
                        {alerts.expiring7Days.length > 0 && (
                            <div className="bg-yellow-100/50 rounded-xl p-3">
                                <p className="font-semibold text-yellow-700 text-sm">⏳ Within 7 Days ({alerts.expiring7Days.length})</p>
                                <p className="text-yellow-600 text-xs mt-1">{alerts.expiring7Days.map(i => i.name).join(', ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartPantry;
