import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const BudgetBag = () => {
    const { axios, user, navigate, currency, addToCart, products, cartItems, setCartItems } = useAppContext();
    const [budget, setBudget] = useState(500);
    const [smartBag, setSmartBag] = useState([]);
    const [stats, setStats] = useState(null);
    const [tips, setTips] = useState([]);
    const [tipSummary, setTipSummary] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/budget/categories');
            if (data.success) setCategories(data.categories);
        } catch (err) { console.log(err); }
    };

    const fetchTips = async () => {
        try {
            const { data } = await axios.get('/api/budget/tips');
            if (data.success) {
                setTips(data.tips);
                setTipSummary(data.summary);
            }
        } catch (err) { console.log(err); }
    };

    useEffect(() => {
        if (user) {
            fetchCategories();
            fetchTips();
        }
    }, [user]);

    const generateSmartBag = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/budget/smart-bag', { budget, priorities: selectedPriorities });
            if (data.success) {
                setSmartBag(data.smartBag);
                setStats(data.stats);
                setGenerated(true);
                toast.success(`🤖 AI found ${data.smartBag.length} items within your budget!`);
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    const addAllToCart = () => {
        // Build all items into cart at once (avoids React state batching issue)
        const newCartItems = structuredClone(cartItems);
        smartBag.forEach(item => {
            const id = item.product._id;
            if (newCartItems[id]) {
                newCartItems[id] += 1;
            } else {
                newCartItems[id] = 1;
            }
        });
        setCartItems(newCartItems);
        toast.success(`Added ${smartBag.length} items to cart! 🛒`);
    };

    const togglePriority = (cat) => {
        setSelectedPriorities(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const budgetPercentUsed = stats ? (stats.budgetUsed / budget) * 100 : 0;

    if (!user) return (
        <div className="mt-20 text-center py-20">
            <p className="text-6xl mb-4">🔒</p>
            <p className="text-xl font-medium text-gray-600">Please login to use Budget Bag</p>
        </div>
    );

    return (
        <div className="mt-16 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-8 mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-32 h-32 bg-white/10 rounded-full translate-y-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">💰 Interactive Budget Bag</h1>
                    <p className="text-purple-100 text-lg">AI maximizes your grocery value within budget</p>
                </div>
            </div>

            {/* Budget Slider Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 Set Your Budget</h3>

                {/* Budget Amount Display */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-baseline gap-1">
                        <span className="text-lg text-gray-400">{currency}</span>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="text-5xl font-bold text-purple-600 bg-transparent text-center w-48 outline-none focus:border-b-2 focus:border-purple-400"
                            min="50"
                            max="50000"
                        />
                    </div>
                </div>

                {/* Slider */}
                <div className="relative mb-8">
                    <input
                        type="range"
                        min="50"
                        max="5000"
                        step="50"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full h-3 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #a855f7 ${(budget / 5000) * 100}%, #e5e7eb ${(budget / 5000) * 100}%, #e5e7eb 100%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>{currency}50</span>
                        <span>{currency}1000</span>
                        <span>{currency}2500</span>
                        <span>{currency}5000</span>
                    </div>
                </div>

                {/* Quick Budget Buttons */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {[200, 500, 1000, 2000, 3000, 5000].map(amt => (
                        <button key={amt} onClick={() => setBudget(amt)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${budget === amt ? 'bg-purple-500 text-white shadow-lg scale-105' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                            {currency}{amt}
                        </button>
                    ))}
                </div>

                {/* Priority Categories */}
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">📌 Priority Categories <span className="text-gray-400 font-normal">(optional — AI picks essentials by default)</span></h4>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button key={cat.name} onClick={() => togglePriority(cat.name)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${selectedPriorities.includes(cat.name) ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {cat.name} ({cat.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button onClick={generateSmartBag} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            AI is optimizing your bag...
                        </span>
                    ) : '🤖 Generate Smart Bag'}
                </button>
            </div>

            {/* Results */}
            {generated && stats && (
                <>
                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-violet-600">{stats.totalItems}</p>
                            <p className="text-sm text-violet-700 font-medium">🛒 Items Found</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-green-600">{currency}{stats.totalSaved}</p>
                            <p className="text-sm text-green-700 font-medium">💰 You Save</p>
                        </div>
                        <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-fuchsia-600">{stats.savingsPercentage}%</p>
                            <p className="text-sm text-fuchsia-700 font-medium">📊 Savings Rate</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-amber-600">{stats.categoriesCovered}</p>
                            <p className="text-sm text-amber-700 font-medium">📦 Categories</p>
                        </div>
                    </div>

                    {/* Budget Gauge */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-gray-700">Budget Usage</span>
                            <span className="text-sm text-gray-400">{currency}{stats.budgetUsed} / {currency}{budget}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out" style={{ width: `${budgetPercentUsed}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-gray-400 mt-2">{currency}{stats.remainingBudget} remaining</p>
                    </div>

                    {/* Add All to Cart Button */}
                    <button onClick={addAllToCart} className="w-full mb-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                        🛒 Add All {stats.totalItems} Items to Cart — {currency}{stats.totalCost}
                    </button>

                    {/* Smart Bag Items */}
                    <div className="space-y-3">
                        {smartBag.map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.product.image && item.product.image[0] ? (
                                        <img src={item.product.image[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate">{item.product.name}</h4>
                                    <p className="text-xs text-gray-400">{item.product.category}</p>
                                    <p className="text-xs text-purple-500 font-medium mt-1">🤖 {item.reason}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-purple-600">{currency}{item.product.offerPrice}</p>
                                    {item.product.price !== item.product.offerPrice && (
                                        <p className="text-xs text-gray-400 line-through">{currency}{item.product.price}</p>
                                    )}
                                </div>
                                <button onClick={() => { addToCart(item.product._id); toast.success('Added!'); }} className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:shadow-md">
                                    ➕
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Savings Tips */}
            {tips.length > 0 && (
                <div className="mt-10 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-amber-800 mb-4">💡 AI Savings Tips</h3>
                    {tipSummary && (
                        <div className="flex gap-4 mb-4 flex-wrap">
                            <span className="bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700">📦 {tipSummary.totalOrders} orders</span>
                            <span className="bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-green-700">💰 {currency}{tipSummary.totalSaved} saved</span>
                            <span className="bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-purple-700">📊 Avg: {currency}{tipSummary.avgOrderValue}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        {tips.map((tip, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 text-amber-700 text-sm font-medium border border-amber-100/50">
                                {tip.icon} {tip.tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetBag;
