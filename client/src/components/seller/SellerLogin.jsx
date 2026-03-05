import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';

const SellerLogin = () => {
    const { isSeller, setIsSeller, navigate, axios } = useAppContext()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            setLoading(true);
            const { data } = await axios.post('/api/seller/login', { email, password })
            if (data.success) {
                setIsSeller(true)
                navigate('/seller')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isSeller) {
            navigate("/seller")
        }
    }, [isSeller])

    return !isSeller && (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4'>
            <div className='w-full max-w-md'>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <span className="text-3xl">🛒</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-gray-400 text-sm mt-1">Marketplace Admin Panel</p>
                </div>

                <form onSubmit={onSubmitHandler} className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5'>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email}
                            type="email" placeholder="admin@example.com"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} value={password}
                            type="password" placeholder="••••••••"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" required />
                    </div>
                    <button disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
                        {loading ? "Logging in..." : "Login as Admin"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Seller Options */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/seller-vendor-login')}
                        className="w-full py-3 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        🚀 Login as Seller (Vendor)
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/seller-register')}
                            className="py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1"
                        >
                            ➕ Register Shop
                        </button>
                        <button
                            onClick={() => navigate('/seller-status')}
                            className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-1"
                        >
                            🔍 Track Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SellerLogin

