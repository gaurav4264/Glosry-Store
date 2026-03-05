import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: '⏳', label: 'Pending Review' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✅', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '❌', label: 'Rejected' },
    hold: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: '⏸️', label: 'On Hold' }
};

const SellerStatus = () => {
    const navigate = useNavigate();
    const [appNum, setAppNum] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleCheck = async (e) => {
        e.preventDefault();
        if (!appNum.trim()) return toast.error('Please enter your Application Number');
        setLoading(true);
        setResult(null);
        try {
            const { data } = await axios.get(`/api/seller-application/status/${appNum.trim()}`);
            if (data.success) {
                setResult(data.application);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const statusStyle = result ? STATUS_STYLES[result.status] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 px-4 text-center shadow-lg">
                <h1 className="text-3xl font-bold mb-2">🔍 Track Your Application</h1>
                <p className="text-blue-200 text-sm">Enter your Application Number to check the status</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-5">Enter Application Number</h2>
                    <form onSubmit={handleCheck} className="flex gap-3">
                        <input
                            type="text"
                            value={appNum}
                            onChange={e => setAppNum(e.target.value.toUpperCase())}
                            placeholder="e.g. APP20261001"
                            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 bg-gray-50 uppercase"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60"
                        >
                            {loading ? '⏳' : '🔍'} {loading ? 'Checking...' : 'Check'}
                        </button>
                    </form>
                </div>

                {/* Result Card */}
                {result && statusStyle && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Status Banner */}
                        <div className={`${statusStyle.bg} ${statusStyle.border} border-b-2 p-6 text-center`}>
                            <div className="text-5xl mb-3">{statusStyle.icon}</div>
                            <h2 className={`text-2xl font-bold ${statusStyle.text} mb-1`}>{statusStyle.label}</h2>
                            <p className="text-gray-500 text-sm">{result.applicationNumber}</p>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ['Applicant Name', result.fullName],
                                    ['Shop Name', result.shopName],
                                    ['Category', result.shopCategory],
                                    ['City', result.city],
                                    ['Seller ID', result.sellerId],
                                    ['Shop Reg No.', result.shopRegNumber],
                                    ['Applied On', new Date(result.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                                    ['Approved On', result.approvedAt ? new Date(result.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—']
                                ].map(([k, v]) => (
                                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 font-semibold uppercase">{k}</p>
                                        <p className="text-sm font-bold text-gray-700 mt-0.5">{v}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Admin Remarks */}
                            {result.adminRemarks && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Admin Remarks</p>
                                    <p className="text-sm text-blue-800">{result.adminRemarks}</p>
                                </div>
                            )}

                            {/* Action buttons based on status */}
                            {result.status === 'approved' && !result.passwordSet && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-sm text-green-700 font-medium mb-3">🎉 Congratulations! Your application is approved. Set your password to start selling.</p>
                                    <button onClick={() => navigate('/seller-set-password', { state: { sellerId: result.sellerId } })} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                        🔐 Set My Password & Activate Account
                                    </button>
                                </div>
                            )}
                            {result.status === 'approved' && result.passwordSet && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-sm text-green-700 font-medium mb-3">✅ Your account is active! Login with your Seller ID.</p>
                                    <button onClick={() => navigate('/seller-vendor-login')} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                        🚀 Login to Seller Dashboard
                                    </button>
                                </div>
                            )}
                            {result.status === 'pending' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                                    <p className="text-sm text-yellow-700">⏳ Your application is under review. Please check back in 2-3 business days.</p>
                                </div>
                            )}
                            {result.status === 'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                                    <p className="text-sm text-red-700">❌ Application rejected. Please register again with correct documents.</p>
                                    <button onClick={() => navigate('/seller-register')} className="mt-3 px-6 py-2 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-all">
                                        Re-Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Help Links */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-sm text-gray-500">Don't have an Application Number?</p>
                    <button onClick={() => navigate('/seller-register')} className="text-indigo-600 font-semibold hover:underline text-sm">
                        → Register as a New Seller
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellerStatus;
