import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import LeafletMap from '../components/LeafletMap';
import toast from 'react-hot-toast';

const VEHICLES = [
    { id: 'bicycle', icon: '🚲', label: 'Bicycle', desc: 'Zero emissions!', color: 'from-green-400 to-emerald-500' },
    { id: 'ev', icon: '🔋', label: 'Electric Vehicle', desc: 'Ultra-low emissions', color: 'from-blue-400 to-cyan-500' },
    { id: 'bike', icon: '🛵', label: 'Motorbike', desc: 'Low emissions', color: 'from-amber-400 to-orange-500' },
    { id: 'standard', icon: '🚗', label: 'Car', desc: 'Standard delivery', color: 'from-gray-400 to-gray-500' },
];

const EcoDelivery = () => {
    const { axios, user } = useAppContext();
    const [vehicle, setVehicle] = useState('ev');
    const [route, setRoute] = useState(null);
    const [ecoStats, setEcoStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [center, setCenter] = useState([25.5941, 85.1376]);
    const [animatedCO2, setAnimatedCO2] = useState(0);

    const fetchEcoStats = async () => {
        try {
            const { data } = await axios.get('/api/eco-route/stats');
            if (data.success) setEcoStats(data.stats);
        } catch (err) { console.log(err); }
    };

    useEffect(() => {
        if (user) fetchEcoStats();
    }, [user]);

    // Animate CO2 counter
    useEffect(() => {
        if (route) {
            let current = 0;
            const target = route.co2Saved * 1000; // in grams
            const step = target / 50;
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    setAnimatedCO2(target);
                    clearInterval(interval);
                } else {
                    setAnimatedCO2(Math.round(current));
                }
            }, 30);
            return () => clearInterval(interval);
        }
    }, [route]);

    const calculateRoute = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('/api/eco-route/calculate', { vehicle });
            if (data.success) {
                setRoute(data.route);
                // Set map markers
                setMarkers([
                    { position: [data.route.shopLocation.lat, data.route.shopLocation.lng], popup: '🏪 Shop Location' },
                    { position: [data.route.deliveryLocation.lat, data.route.deliveryLocation.lng], popup: '📍 Delivery Location' },
                ]);
                setCenter([
                    (data.route.shopLocation.lat + data.route.deliveryLocation.lat) / 2,
                    (data.route.shopLocation.lng + data.route.deliveryLocation.lng) / 2
                ]);
                toast.success('🌿 Eco route calculated!');
            }
        } catch (err) { toast.error(err.message); }
        setLoading(false);
    };

    if (!user) return (
        <div className="mt-20 text-center py-20">
            <p className="text-6xl mb-4">🔒</p>
            <p className="text-xl font-medium text-gray-600">Please login to access Eco Delivery</p>
        </div>
    );

    return (
        <div className="mt-16 pb-20">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-8 mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-10 w-40 h-40 bg-white/10 rounded-full translate-y-1/2"></div>
                <div className="absolute top-4 right-10 text-8xl opacity-20">🌍</div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">🌿 Eco Route Delivery</h1>
                    <p className="text-green-100 text-lg">Track your delivery's carbon footprint</p>
                </div>
            </div>

            {/* Eco Score & Stats */}
            {ecoStats && (
                <div className="mb-8">
                    {/* Eco Score Ring */}
                    <div className="flex items-center gap-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 mb-4">
                        <div className="relative flex-shrink-0">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ecoGrad)" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${(ecoStats.ecoScore / 100) * 264} 264`}
                                    className="transition-all duration-1000" />
                                <defs>
                                    <linearGradient id="ecoGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#10b981" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-green-600">{ecoStats.ecoScore}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-700 mb-1">Eco Score</h3>
                            <p className="text-sm text-green-600">{ecoStats.totalDeliveries} eco-friendly deliveries made</p>
                            <p className="text-sm text-emerald-600 mt-1">{ecoStats.co2SavedTotal} kg CO₂ saved total</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-green-600">{ecoStats.co2SavedTotal}</p>
                            <p className="text-xs text-green-700 font-medium mt-1">🌬️ kg CO₂ Saved</p>
                        </div>
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-teal-600">{ecoStats.treesPlanted}</p>
                            <p className="text-xs text-teal-700 font-medium mt-1">🌳 Trees Equivalent</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-blue-600">{ecoStats.fuelSavedLiters}L</p>
                            <p className="text-xs text-blue-700 font-medium mt-1">⛽ Fuel Saved</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                            <p className="text-3xl font-bold text-emerald-600">{ecoStats.totalDistanceKm}</p>
                            <p className="text-xs text-emerald-700 font-medium mt-1">📍 km Optimized</p>
                        </div>
                    </div>

                    {/* Badges */}
                    {ecoStats.badges.length > 0 && (
                        <div className="mt-4 flex gap-3 flex-wrap">
                            {ecoStats.badges.map((badge, idx) => (
                                <div key={idx} className="bg-white border border-green-100 rounded-xl px-4 py-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                    <p className="font-bold text-sm text-gray-700">{badge.name}</p>
                                    <p className="text-xs text-gray-400">{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Vehicle Selection */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🚗 Choose Delivery Vehicle</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {VEHICLES.map(v => (
                        <button key={v.id} onClick={() => setVehicle(v.id)} className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${vehicle === v.id ? `border-green-400 bg-gradient-to-br ${v.color} text-white shadow-lg scale-105` : 'border-gray-200 bg-white text-gray-700 hover:border-green-200'}`}>
                            <p className="text-3xl mb-2">{v.icon}</p>
                            <p className="font-bold text-sm">{v.label}</p>
                            <p className={`text-xs mt-1 ${vehicle === v.id ? 'text-white/80' : 'text-gray-400'}`}>{v.desc}</p>
                            {vehicle === v.id && <div className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs">✓</div>}
                        </button>
                    ))}
                </div>

                <button onClick={calculateRoute} disabled={loading} className="w-full mt-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-50">
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Calculating eco route...
                        </span>
                    ) : '🌿 Calculate Eco Route'}
                </button>
            </div>

            {/* Route Results */}
            {route && (
                <>
                    {/* CO2 Saved Hero */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 mb-8 text-center text-white">
                        <p className="text-sm text-green-100 mb-2">CO₂ Emissions Saved</p>
                        <p className="text-6xl font-black mb-2">{animatedCO2}g</p>
                        <p className="text-green-200 text-sm">by choosing {route.vehicle} on eco route</p>
                    </div>

                    {/* Route Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Standard Route */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-3 right-3 bg-gray-300 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">Standard</div>
                            <h4 className="text-lg font-bold text-gray-700 mb-4">🚗 Standard Route</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Distance</span>
                                    <span className="font-semibold text-gray-700">{route.standardDistance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Time</span>
                                    <span className="font-semibold text-gray-700">{route.standardTime} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">CO₂ Emissions</span>
                                    <span className="font-semibold text-red-500">{(route.standardCO2 * 1000).toFixed(0)}g</span>
                                </div>
                            </div>
                        </div>

                        {/* Eco Route */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">✨ Eco</div>
                            <h4 className="text-lg font-bold text-green-700 mb-4">🌿 Eco Route</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-green-600 text-sm">Distance</span>
                                    <span className="font-semibold text-green-700">{route.ecoDistance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600 text-sm">Time</span>
                                    <span className="font-semibold text-green-700">{route.ecoTime} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600 text-sm">CO₂ Emissions</span>
                                    <span className="font-semibold text-green-500">{(route.ecoCO2 * 1000).toFixed(0)}g</span>
                                </div>
                            </div>
                            <div className="mt-4 bg-green-100/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-green-600 font-medium">🌳 Equivalent to saving {route.treesEquivalent} trees/year</p>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg mb-8">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-3">
                            <h4 className="text-white font-bold">🗺️ Live Eco Route Map</h4>
                        </div>
                        <LeafletMap center={center} markers={markers} />
                    </div>

                    {/* Savings Summary */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-6">
                        <h4 className="text-lg font-bold text-teal-700 mb-3">📊 Route Savings Summary</h4>
                        <div className="flex gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">📏</span>
                                <div>
                                    <p className="font-bold text-teal-700">{route.distanceSaved} km</p>
                                    <p className="text-xs text-teal-500">Distance saved</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">⏱️</span>
                                <div>
                                    <p className="font-bold text-teal-700">{route.timeDiff} min</p>
                                    <p className="text-xs text-teal-500">Time difference</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm">🌬️</span>
                                <div>
                                    <p className="font-bold text-teal-700">{(route.co2Saved * 1000).toFixed(0)}g</p>
                                    <p className="text-xs text-teal-500">CO₂ reduced</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EcoDelivery;
