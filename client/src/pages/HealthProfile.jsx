import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const CONDITIONS = [
    { id: 'Diabetes (Type 1 or 2)', icon: '🩸', color: 'from-red-400 to-rose-500' },
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

const HealthProfile = () => {
    const { axios, user, navigate, addToCart, products } = useAppContext();

    const [step, setStep] = useState('form'); // 'form' | 'results'
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        age: '',
        gender: '',
        conditions: [],
        allergies: [],
        notes: '',
    });

    const [recommendations, setRecommendations] = useState(null);

    // Load saved profile on mount
    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const { data } = await axios.get('/api/health/profile');
                if (data.success && data.profile) {
                    const p = data.profile;
                    setForm({
                        age: p.age || '',
                        gender: p.gender || '',
                        conditions: p.conditions || [],
                        allergies: p.allergies || [],
                        notes: p.notes || '',
                    });
                }
            } catch (e) { console.log(e); }
            finally { setLoading(false); }
        };
        loadProfile();
    }, [user]);

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
        if (!form.age || !form.gender) {
            toast.error('Please enter your age and gender');
            return;
        }
        setSaving(true);
        try {
            // Save profile
            const saveRes = await axios.post('/api/health/save', form);
            if (!saveRes.data.success) {
                toast.error(saveRes.data.message);
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
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = (productName) => {
        // Find product in products list
        const found = products.find(p =>
            p.name.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(p.name.toLowerCase())
        );
        if (found) {
            addToCart(found._id);
        } else {
            toast.error('Product not found in store');
        }
    };

    if (!user) return (
        <div className="mt-20 text-center py-20">
            <p className="text-6xl mb-4">🔒</p>
            <p className="text-xl font-medium text-gray-600">Please login to access Health Advisor</p>
            <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-full">
                Go Home
            </button>
        </div>
    );

    if (loading) return (
        <div className="mt-20 text-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your health profile...</p>
        </div>
    );

    return (
        <div className="mt-16 pb-20">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 p-8 mb-8">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">🩺</span>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Health Advisor</h1>
                            <p className="text-pink-100 text-sm">AI-Powered Grocery Recommendations for Patients & Senior Citizens</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">🫀 Heart-Friendly</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">🩸 Diabetes-Safe</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">💊 Doctor-Approved Diet Tips</span>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">🚫 Allergy Aware</span>
                    </div>
                </div>
            </div>

            {/* ── Step Tabs ──────────────────────────────────────── */}
            <div className="flex gap-2 mb-8">
                <button onClick={() => setStep('form')} className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${step === 'form' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    📝 Health Profile
                </button>
                <button onClick={() => { if (recommendations) setStep('results'); }} className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${step === 'results' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : recommendations ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}>
                    🤖 AI Recommendations
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* FORM STEP                                          */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Personal Info */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">👤</span>
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Age <span className="text-red-400">*</span></label>
                                <input
                                    type="number" min="1" max="120"
                                    value={form.age}
                                    onChange={e => setForm({ ...form, age: e.target.value })}
                                    placeholder="e.g. 65"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">Gender <span className="text-red-400">*</span></label>
                                <select
                                    value={form.gender}
                                    onChange={e => setForm({ ...form, gender: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-gray-700"
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Health Conditions */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">💊</span>
                            Health Conditions
                        </h2>
                        <p className="text-sm text-gray-400 mb-5">Select all conditions that apply to you</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {CONDITIONS.map(c => {
                                const selected = form.conditions.includes(c.id);
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleCondition(c.id)}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${selected
                                            ? `border-transparent bg-gradient-to-br ${c.color} text-white shadow-lg scale-105`
                                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {selected && (
                                            <span className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-[10px]">✓</span>
                                        )}
                                        <span className="text-2xl">{c.icon}</span>
                                        <span className="text-xs font-semibold text-center leading-tight">{c.id}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">⚠️</span>
                            Food Allergies
                        </h2>
                        <p className="text-sm text-gray-400 mb-5">Select any foods you are allergic to</p>
                        <div className="flex flex-wrap gap-3">
                            {ALLERGIES.map(a => {
                                const selected = form.allergies.includes(a.id);
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => toggleAllergy(a.id)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all duration-300 font-medium text-sm ${selected
                                            ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-md scale-105'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
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
                        <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">📝</span>
                            Additional Notes
                        </h2>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            rows={3}
                            placeholder="Any other health details, medications, or dietary restrictions..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                Analysing with AI...
                            </>
                        ) : (
                            <>🤖 Save & Get AI Recommendations</>
                        )}
                    </button>
                </form>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* RESULTS STEP                                        */}
            {/* ═══════════════════════════════════════════════════ */}
            {step === 'results' && recommendations && (
                <div className="space-y-8">

                    {/* Profile Summary Badge */}
                    <div className="flex flex-wrap gap-2 items-center bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-5">
                        <span className="text-sm font-bold text-gray-700 mr-2">Your Profile:</span>
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-medium">👤 Age {form.age}, {form.gender}</span>
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

                    {/* ── Health Tips ──────────────────────────────── */}
                    {recommendations.tips && recommendations.tips.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">💡</span> Personalised Health Tips
                            </h3>
                            <div className="space-y-2">
                                {recommendations.tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-3 border border-blue-100/50">
                                        <span className="text-blue-500 font-bold text-sm mt-0.5">{idx + 1}.</span>
                                        <p className="text-blue-700 text-sm font-medium">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Recommended Groceries ─────────────────────── */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Recommended for You</h3>
                                <p className="text-sm text-gray-400">These items are beneficial for your health conditions</p>
                            </div>
                        </div>
                        {recommendations.recommended && recommendations.recommended.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {recommendations.recommended.map((item, idx) => {
                                    const product = item.product;
                                    return (
                                        <div key={idx} className="bg-white border border-emerald-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                                            {product && product.image && product.image[0] ? (
                                                <img src={product.image[0]} alt={product.name} className="w-full h-32 object-contain rounded-xl mb-3 bg-gray-50" />
                                            ) : (
                                                <div className="w-full h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl mb-3 flex items-center justify-center text-5xl">🛒</div>
                                            )}
                                            <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">✓ GOOD</span>
                                            <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.name}</h4>
                                            {product && (
                                                <p className="text-emerald-600 font-bold text-sm mb-2">₹{product.offerPrice}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{item.reason}</p>
                                            <button
                                                onClick={() => handleAddToCart(item.name)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs py-2.5 rounded-xl font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                                            >
                                                🛒 Add to Cart
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl">
                                <p className="text-4xl mb-2">🥬</p>
                                <p>No specific product recommendations found. Add your health conditions to see personalised picks.</p>
                            </div>
                        )}
                    </div>

                    {/* ── Items to Avoid ────────────────────────────── */}
                    {recommendations.avoid && recommendations.avoid.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">🚫</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Items to Avoid</h3>
                                    <p className="text-sm text-gray-400">These items may be harmful based on your health conditions</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {recommendations.avoid.map((item, idx) => {
                                    const product = item.product;
                                    return (
                                        <div key={idx} className="bg-white border border-red-100 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-rose-500"></div>
                                            {product && product.image && product.image[0] ? (
                                                <div className="relative w-full h-32 mb-3">
                                                    <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain rounded-xl bg-gray-50 opacity-50 grayscale" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-5xl">🚫</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-32 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl mb-3 flex items-center justify-center text-5xl">🚫</div>
                                            )}
                                            <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AVOID</span>
                                            <h4 className="font-bold text-gray-700 text-sm leading-tight mb-1">{item.name}</h4>
                                            <p className="text-xs text-red-500 leading-relaxed">{item.reason}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 text-center">
                        <p className="text-gray-600 text-sm mb-4">These recommendations are based on common dietary guidelines. Always consult your doctor before making major dietary changes.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <button onClick={() => navigate('/products')} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                                🛒 Shop Healthy Now
                            </button>
                            <button onClick={() => setStep('form')} className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-all">
                                ✏️ Update Health Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthProfile;
