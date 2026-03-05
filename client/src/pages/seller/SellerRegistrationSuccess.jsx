import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SellerRegistrationSuccess = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state) {
        navigate('/seller-register');
        return null;
    }

    const { applicationNumber, shopRegNumber, sellerId, shopName, fullName } = state;

    const InfoCard = ({ icon, label, value, color }) => (
        <div className={`bg-white rounded-2xl p-6 border-2 ${color} shadow-lg text-center`}>
            <div className="text-4xl mb-3">{icon}</div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-xl font-bold text-gray-800 tracking-wider font-mono">{value}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-center px-4 py-12">
            {/* Success Animation */}
            <div className="mb-8 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-green-400">
                    <span className="text-5xl">🎉</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Application Submitted!</h1>
                <p className="text-gray-500 text-lg">Dear <strong>{fullName}</strong>, your application for <strong>{shopName}</strong> has been received.</p>
            </div>

            {/* ID Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl mb-8">
                <InfoCard icon="📋" label="Application Number" value={applicationNumber} color="border-blue-400" />
                <InfoCard icon="🏪" label="Shop Registration No." value={shopRegNumber} color="border-purple-400" />
                <InfoCard icon="👤" label="Your Seller ID" value={sellerId} color="border-green-400" />
            </div>

            {/* Important Note */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 max-w-3xl w-full mb-8 shadow">
                <h3 className="font-bold text-amber-800 text-lg mb-3 flex items-center gap-2">⚠️ Important — Save These Details</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span><strong>Application Number</strong> is used to track your application status</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span><strong>Seller ID</strong> is your login credential once approved</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span><strong>Review time:</strong> Admin will review your documents within 2–3 business days</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span><span>Once <strong>approved</strong>, you'll need to set a password to activate your seller account</span></li>
                </ul>
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-3xl w-full mb-8">
                <h3 className="font-bold text-gray-700 mb-4 text-lg">📅 What Happens Next?</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    {[
                        { step: '1', icon: '📤', title: 'Application Submitted', desc: 'Your documents are uploaded and under review', done: true },
                        { step: '2', icon: '🔍', title: 'Admin Review', desc: 'Our team verifies your KYC documents (2-3 days)', done: false },
                        { step: '3', icon: '✅', title: 'Approval', desc: 'You receive approval and set your login password', done: false },
                        { step: '4', icon: '🚀', title: 'Start Selling', desc: 'Login with Seller ID and manage your shop', done: false }
                    ].map(item => (
                        <div key={item.step} className={`flex-1 text-center p-4 rounded-xl ${item.done ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${item.done ? 'text-green-600' : 'text-gray-400'}`}>Step {item.step}</p>
                            <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => navigate('/seller-status')}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                >
                    🔍 Track Application Status
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                    🏠 Go to Homepage
                </button>
            </div>
        </div>
    );
};

export default SellerRegistrationSuccess;
