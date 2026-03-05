import React from 'react';
import { useOutletContext } from 'react-router-dom';

const VendorProfile = () => {
    const { vendor } = useOutletContext() || {};

    if (!vendor) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center"><span className="text-4xl">⌛</span><p className="mt-2">Loading...</p></div>
        </div>
    );

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">🏪 Shop Profile</h1>

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-6 mb-6 shadow-lg flex items-center gap-5">
                {vendor.passportPhoto
                    ? <img src={vendor.passportPhoto} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg" />
                    : <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/20">{vendor.fullName?.[0]}</div>
                }
                <div>
                    <h2 className="text-2xl font-bold">{vendor.shopName}</h2>
                    <p className="text-indigo-200 text-sm">{vendor.fullName}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{vendor.shopCategory}</span>
                        <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">📍 {vendor.city}</span>
                    </div>
                </div>
            </div>

            {/* IDs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { icon: '👤', label: 'Seller ID', value: vendor.sellerId, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                ].map(item => (
                    <div key={item.label} className={`rounded-xl p-4 border ${item.color} md:col-span-3`}>
                        <p className="text-xs font-bold opacity-60 uppercase mb-1">{item.icon} {item.label}</p>
                        <p className="font-bold font-mono text-lg">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-700 mb-4">📋 Account Information</h2>
                {[
                    ['Full Name', vendor.fullName],
                    ['Shop Name', vendor.shopName],
                    ['Category', vendor.shopCategory],
                    ['City', vendor.city],
                    ['Seller ID', vendor.sellerId],
                ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-400 text-sm">{k}</span>
                        <span className="font-semibold text-gray-800 text-sm">{v}</span>
                    </div>
                ))}
            </div>

            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-600">
                    💡 To update your shop details or documents, please contact the marketplace admin.
                </p>
            </div>
        </div>
    );
};

export default VendorProfile;
