import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerSetPassword = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [sellerId, setSellerId] = useState(state?.sellerId || '');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sellerId.trim()) return toast.error('Enter your Seller ID');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        if (password !== confirm) return toast.error('Passwords do not match');

        setLoading(true);
        try {
            const { data } = await axios.post('/api/seller-application/set-password', { sellerId: sellerId.trim(), password });
            if (data.success) {
                toast.success('Password set! You can now login.');
                navigate('/seller-vendor-login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-green-300">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Set Your Password</h1>
                    <p className="text-gray-500 text-sm mt-2">Create a secure password to activate your seller account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Seller ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={sellerId}
                                onChange={e => setSellerId(e.target.value.toUpperCase())}
                                placeholder="e.g. SEL20261001"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-green-400 bg-gray-50 uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-gray-50 pr-12"
                                />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl">{show ? '🙈' : '👁️'}</button>
                            </div>
                            <div className="mt-1 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length > i * 2 ? (password.length >= 10 ? 'bg-green-400' : password.length >= 6 ? 'bg-yellow-400' : 'bg-red-300') : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none bg-gray-50 ${confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-green-400'}`}
                            />
                            {confirm && confirm !== password && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="animate-spin">⌛</span> : '🔐'}
                            {loading ? 'Setting Password...' : 'Set Password & Activate'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-sm text-gray-400 mt-5">
                    <button onClick={() => navigate('/seller-status')} className="text-indigo-600 font-medium hover:underline">← Back to Application Status</button>
                </p>
            </div>
        </div>
    );
};

export default SellerSetPassword;
