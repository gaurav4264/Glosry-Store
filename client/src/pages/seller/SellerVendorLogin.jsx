import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerVendorLogin = () => {
    const navigate = useNavigate();
    const [sellerId, setSellerId] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!sellerId.trim() || !password) return toast.error('Please fill all fields');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/seller/vendor-login', { sellerId: sellerId.trim(), password });
            if (data.success) {
                toast.success('Welcome back, ' + data.seller.shopName + '!');
                navigate('/vendor');
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <span className="text-4xl">🛒</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Seller Login</h1>
                    <p className="text-gray-500 text-sm mt-1">Login with your Seller ID to manage your shop</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Seller ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={sellerId}
                                onChange={e => setSellerId(e.target.value.toUpperCase())}
                                placeholder="e.g. SEL20261001"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-400 bg-gray-50 uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 pr-12"
                                />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xl">{show ? '🙈' : '👁️'}</button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <span className="animate-spin">⌛</span> : '🚀'}
                            {loading ? 'Logging In...' : 'Login to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                        <button onClick={() => navigate('/seller-status')} className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm">
                            🔍 Track Application Status
                        </button>
                        <button onClick={() => navigate('/seller-register')} className="w-full py-3 border-2 border-indigo-100 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all text-sm">
                            ➕ Register as New Seller
                        </button>
                        <button onClick={() => navigate('/seller')} className="w-full py-3 text-gray-400 font-medium rounded-xl hover:text-gray-600 transition-all text-sm text-center">
                            Admin Login →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerVendorLogin;
