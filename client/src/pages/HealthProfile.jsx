import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';

const CONDITIONS = [
    { id: 'Diabetes', icon: '🩸', color: 'from-red-400 to-rose-500' },
    { id: 'High Blood Pressure', icon: '💓', color: 'from-orange-400 to-red-500' },
    { id: 'Low Blood Pressure', icon: '💔', color: 'from-blue-400 to-indigo-500' },
    { id: 'Thyroid', icon: '🦋', color: 'from-purple-400 to-violet-500' },
    { id: 'Heart Disease', icon: '❤️', color: 'from-pink-400 to-rose-500' },
    { id: 'Kidney Disease', icon: '🫘', color: 'from-amber-400 to-orange-500' },
    { id: 'Obesity', icon: '⚖️', color: 'from-teal-400 to-cyan-500' },
    { id: 'Arthritis', icon: '🦴', color: 'from-lime-400 to-green-500' },
    { id: 'Anaemia', icon: '🩺', color: 'from-fuchsia-400 to-pink-500' },
];

const ALLERGIES = [
    { id: 'Nuts', icon: '🥜' },
    { id: 'Dairy', icon: '🥛' },
    { id: 'Gluten', icon: '🌾' },
    { id: 'Shellfish', icon: '🦐' },
    { id: 'Eggs', icon: '🥚' },
    { id: 'Soy', icon: '🫘' },
];

const CURATED_CATEGORIES = [
    { id: 'Diabetic Friendly', icon: '🩸', match: ['sugar free', 'diabetic', 'oats', 'quinoa', 'bitter gourd', 'jamun', 'brown rice', 'millets', 'apple'] },
    { id: 'Heart Healthy', icon: '❤️', match: ['olive oil', 'walnut', 'almond', 'salmon', 'oats', 'berry', 'garlic', 'spinach', 'apple'] },
    { id: 'High Protein', icon: '💪', match: ['paneer', 'egg', 'chicken', 'soya', 'dal', 'lens', 'protein', 'peanut', 'cheese'] },
    { id: 'Gluten Free', icon: '🌾', match: ['gluten free', 'millet', 'rice', 'quinoa', 'corn', 'amaranth'] },
    { id: 'Weight Loss', icon: '⚖️', match: ['green tea', 'apple cider', 'oats', 'makhana', 'salad', 'detox', 'chia', 'flax'] },
    { id: 'Immunity Builder', icon: '🛡️', match: ['amla', 'honey', 'tulsi', 'ginger', 'turmeric', 'citrus', 'orange', 'lemon'] },
    { id: 'Bone Health', icon: '🦴', match: ['milk', 'cheese', 'calcium', 'curd', 'almond', 'sesame', 'ragi'] },
];

const HealthProfile = () => {
    const { axios, user, navigate, addToCart, products } = useAppContext();

    const [step, setStep] = useState('shop'); // 'form' | 'results' | 'shop'
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCurated, setSelectedCurated] = useState('Diabetic Friendly');
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        conditions: [],
        allergies: [],
        notes: '',
    });

    const [recommendations, setRecommendations] = useState(null);

    // Load saved profile on mount
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const loadProfile = async () => {
            try {
                const { data } = await axios.get('/api/health/profile');
                if (data.success && data.profile) {
                    const p = data.profile;
                    setForm({
                        name: p.name || '',
                        age: p.age || '',
                        gender: p.gender || '',
                        height: p.height || '',
                        weight: p.weight || '',
                        conditions: p.conditions || [],
                        allergies: p.allergies || [],
                        notes: p.notes || '',
                    });
                }
            } catch (e) {
                console.log('Failed to load health profile:', e.message);
            }
            finally { setLoading(false); }
        };
        loadProfile();
    }, [user, axios]);

    const toggleCondition = (id) => {
        setForm(prev => ({
            ...prev,
            conditions: prev.conditions.includes(id)
                ? prev.conditions.filter(c => c !== id)
                : [...prev.conditions, id]
        }));
    };

    const toggleAllergy = (id) => {
        setForm(prev => ({
            ...prev,
            allergies: prev.allergies.includes(id)
                ? prev.allergies.filter(a => a !== id)
                : [...prev.allergies, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.age || !form.gender) {
            toast.error('Name, Age, and Gender are required fields.');
            return;
        }
        setSaving(true);
        try {
            // Save profile
            const saveRes = await axios.post('/api/health/save', form);
            if (!saveRes.data.success) {
                toast.error(saveRes.data.message);
                setSaving(false);
                return;
            }

            // Get AI recommendations
            toast.loading('🤖 AI is analysing your health profile...', { id: 'ai-loading' });
            const recRes = await axios.post('/api/health/recommend', {});
            toast.dismiss('ai-loading');

            if (recRes.data.success) {
                setRecommendations(recRes.data);
                setStep('results');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                toast.success('✅ Recommendations ready!');
            } else {
                toast.error(recRes.data.message);
            }
        } catch (err) {
            toast.dismiss('ai-loading');
            toast.error(err.message || 'Analysis failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = (productName) => {
        const found = products.find(p =>
            p.name.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(p.name.toLowerCase())
        );
        if (found) {
            addToCart(found._id);
            toast.success('Added to cart!');
        } else {
            toast.error('Product not found in store');
        }
    };

    const curatedProducts = useMemo(() => {
        if (!selectedCurated) return [];
        const cat = CURATED_CATEGORIES.find(c => c.id === selectedCurated);
        if (!cat) return [];
        return products.filter(p => {
            const searchString = `${p.name} ${p.category} ${p.description?.join(' ')}`.toLowerCase();
            return cat.match.some(keyword => searchString.includes(keyword.toLowerCase()));
        }).slice(0, 15); // Show top 15 matches
    }, [selectedCurated, products]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pb-20">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-8 mb-8 shadow-lg">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">🩺</span>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Health & Wellness Hub</h1>
                            <p className="text-teal-100 text-sm mt-1">Smart Groceries for Better Health</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs / Sub Navigation ─────────────────────────── */}
            <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-xl inline-flex flex-wrap border border-gray-100">
                <button
                    onClick={() => setStep('shop')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${step === 'shop' ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🛒 Shop by Health Goal
                </button>
                <button
                    onClick={() => {
                        if (!user) {
                            toast.error('Please login to use AI features');
                            setTimeout(() => navigate('/'), 1000); // Redirect to login modal on home
                            return;
                        }
                        setStep('form');
                    }}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${step === 'form' ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🤖 AI Health Profile
                </button>
                {recommendations && (
                    <button
                        onClick={() => setStep('results')}
                        className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${step === 'results' ? 'bg-white text-teal-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✅ My AI Plan
                    </button>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* SHOP BY CATEGORY STEP                               */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 'shop' && (
                <div className="mb-10 animate-in fade-in duration-500">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            Select Focus Area
                        </h2>
                        <div className="flex overflow-x-auto pb-4 gap-3 snap-x hide-scrollbar">
                            {CURATED_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCurated(cat.id)}
                                    className={`snap-start flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedCurated === cat.id
                                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                                        }`}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span>{cat.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                Best picks for <span className="text-teal-600">{selectedCurated}</span>
                            </h3>
                            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-500">
                                {curatedProducts.length} Items Found
                            </span>
                        </div>
                        {curatedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {curatedProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <p className="text-5xl mb-3">🔍</p>
                                <p className="text-gray-500 font-bold text-lg">No products found matching this goal yet.</p>
                                <p className="text-gray-400 text-sm mt-1">Try selecting another health category above.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* FORM STEP                                          */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl mb-6">
                        <h3 className="font-bold text-teal-800 flex items-center gap-2">
                            <span className="text-xl">🤖</span> AI Dietician
                        </h3>
                        <p className="text-teal-700 text-sm mt-1">
                            Fill out your health profile below, and our AI will analyze your dietary needs to suggest exactly what you should eat (and avoid) from our store.
                        </p>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">👤</span>
                                Personal Information
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Please provide accurate details for the best AI recommendations.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 mb-2">Full Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Age <span className="text-red-400">*</span></label>
                                <input
                                    type="number" min="1" max="150"
                                    value={form.age}
                                    onChange={e => setForm({ ...form, age: e.target.value })}
                                    placeholder="e.g. 35"
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Gender <span className="text-red-400">*</span></label>
                                <select
                                    value={form.gender}
                                    onChange={e => setForm({ ...form, gender: e.target.value })}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm font-medium"
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Height (cm)</label>
                                <input
                                    type="number" min="50" max="300"
                                    value={form.height}
                                    onChange={e => setForm({ ...form, height: e.target.value })}
                                    placeholder="e.g. 175"
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">Weight (kg)</label>
                                <input
                                    type="number" step="0.1" min="10" max="300"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    placeholder="e.g. 70"
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Health Conditions */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">🩺</span>
                                Medical Conditions
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {CONDITIONS.map(c => {
                                const selected = form.conditions.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleCondition(c.id)}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${selected
                                            ? `border-transparent bg-gradient-to-br ${c.color} text-white shadow-md scale-105`
                                            : 'border-gray-100 bg-gray-50 hover:bg-white hover:border-teal-300 text-gray-600'
                                            }`}
                                    >
                                        {selected && (
                                            <span className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px]">✓</span>
                                        )}
                                        <span className="text-2xl">{c.icon}</span>
                                        <span className="text-xs font-bold text-center leading-tight">{c.id}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">⚠️</span>
                                Food Allergies
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {ALLERGIES.map(a => {
                                const selected = form.allergies.includes(a.id);
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => toggleAllergy(a.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all duration-200 font-bold text-sm ${selected
                                            ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm scale-105'
                                            : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-white hover:border-amber-300'
                                            }`}
                                    >
                                        <span>{a.icon}</span>
                                        {a.id}
                                        {selected && <span className="text-amber-500">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📝</span>
                            Specific Diet or Notes
                        </h2>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            placeholder="Example: I'm on a Keto diet, or I need low-sodium items..."
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 bg-gray-50 focus:bg-white transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-teal-600 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <>
                                <span className="w-6 h-6 border-2 border-teal-300 border-t-white rounded-full animate-spin"></span>
                                Generating AI Plan...
                            </>
                        ) : (
                            <>🪄 Generate AI Diet & Grocery Plan</>
                        )}
                    </button>
                </form>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* AI RESULTS STEP                                    */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 'results' && recommendations && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">

                    {/* Profile Summary Badge */}
                    <div className="flex flex-wrap gap-2 items-center bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-5">
                        <span className="text-sm font-bold text-gray-700 mr-2">Your Profile:</span>
                        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-teal-200">
                            👤 {form.name || 'User'} ({form.age}y, {form.gender})
                        </span>
                        {(form.height || form.weight) && (
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                📏 {form.height ? `${form.height}cm` : ''} {form.height && form.weight ? '|' : ''} {form.weight ? `${form.weight}kg` : ''}
                            </span>
                        )}
                        {form.conditions.map(c => (
                            <span key={c} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{c}</span>
                        ))}
                        {form.allergies.map(a => (
                            <span key={a} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">⚠️ {a} allergy</span>
                        ))}
                        <button onClick={() => setStep('form')} className="ml-auto text-xs text-rose-500 hover:text-rose-700 font-medium underline underline-offset-2">
                            ✏️ Edit Profile
                        </button>
                    </div>

                    {/* Tips */}
                    {recommendations.tips && recommendations.tips.length > 0 && (
                        <div className="bg-white border-2 border-indigo-50 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-indigo-50 px-6 py-4 flex items-center gap-3">
                                <span className="text-2xl">👨‍⚕️</span>
                                <h3 className="text-lg font-bold text-indigo-900">Dr. AI's Diet Rules</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                {recommendations.tips.map((tip, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </span>
                                        <p className="text-gray-700 text-sm font-medium pt-1.5">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Items */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">✅</div>
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-800">Eat More of These</h3>
                                <p className="text-sm text-gray-500 font-medium">Grocery staples highly recommended for your profile.</p>
                            </div>
                        </div>
                        {recommendations.recommended && recommendations.recommended.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {recommendations.recommended.map((item, idx) => {
                                    const product = item.product;
                                    return (
                                        <div key={idx} className="bg-white border-2 border-emerald-50 rounded-3xl p-5 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-gradient-to-b from-white to-emerald-50/30">
                                            <div className="flex items-start justify-between mb-4">
                                                <h4 className="font-bold text-emerald-900 text-lg leading-tight pr-4">{item.name}</h4>
                                                <span className="bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-wider px-2 py-1 rounded-md shrink-0">SUPERFOOD</span>
                                            </div>

                                            <p className="text-sm text-gray-600 mb-6 flex-1 font-medium bg-white/50 rounded-xl p-3">{item.reason}</p>

                                            {product ? (
                                                <div className="mt-auto">
                                                    <div className="flex pb-4 gap-3 items-center">
                                                        <img src={product.image?.[0] || 'https://placehold.co/60'} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-white border border-gray-100 shadow-sm" />
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-800 line-clamp-1">{product.name}</p>
                                                            <p className="text-emerald-600 font-black text-sm">₹{product.offerPrice}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleAddToCart(product.name)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2">
                                                        <span className="text-lg">🛒</span> Add to Cart
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">NOT IN STORE</span>
                                                    <span className="text-sm">🥦</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No specific recommendations yet. Update your conditions.</p>
                            </div>
                        )}
                    </div>

                    {/* Avoid Items */}
                    {recommendations.avoid && recommendations.avoid.length > 0 && (
                        <div className="pt-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-2xl">🚫</div>
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-800">Strictly Avoid</h3>
                                    <p className="text-sm text-gray-500 font-medium">These degrade your health based on your profile.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendations.avoid.map((item, idx) => (
                                    <div key={idx} className="bg-white border border-rose-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm mix-blend-multiply relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-rose-50/50 -skew-x-12 translate-x-10 pointer-events-none"></div>
                                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0 font-bold border border-rose-100">✕</div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-base mb-1">{item.name}</h4>
                                            <p className="text-xs text-rose-600 font-medium">{item.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HealthProfile;
