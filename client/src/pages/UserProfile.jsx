import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const UserProfile = () => {
    const { axios, user, setUser, navigate, currency } = useAppContext()
    const [profile, setProfile] = useState(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '' })
    const [uploading, setUploading] = useState(false)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }
        fetchProfile()
        fetchOrders()
    }, [user])

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get('/api/user/is-auth')
            if (data.success) {
                setProfile(data.user)
                setForm({ name: data.user.name || '', phone: data.user.phone || '' })
            }
        } catch (err) { console.log(err) }
    }

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user')
            if (data.success) setOrders(data.orders)
        } catch (err) { console.log(err) }
    }

    const handleSave = async () => {
        try {
            const { data } = await axios.put('/api/user/update-profile', form)
            if (data.success) {
                toast.success('Profile updated!')
                setProfile(prev => ({ ...prev, ...data.user }))
                setUser(prev => ({ ...prev, name: data.user.name }))
                setEditing(false)
            } else toast.error(data.message)
        } catch (err) { toast.error(err.message) }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB')
            return
        }
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('profilePhoto', file)
            const { data } = await axios.post('/api/user/upload-photo', formData)
            if (data.success) {
                toast.success('Photo updated!')
                setProfile(prev => ({ ...prev, profilePhoto: data.user.profilePhoto }))
            } else toast.error(data.message)
        } catch (err) { toast.error(err.message) }
        setUploading(false)
    }

    if (!profile) return (
        <div className="mt-20 flex justify-center items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?'
    const tierConfig = {
        Bronze: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', bar: 'bg-amber-500', next: 'Silver', target: 5000 },
        Silver: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', bar: 'bg-gray-500', next: 'Gold', target: 10000 },
        Gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', bar: 'bg-yellow-500', next: null, target: null },
    }
    const tier = tierConfig[profile.membershipTier] || tierConfig.Bronze
    const progress = tier.target ? Math.min((profile.totalSpent / tier.target) * 100, 100) : 100
    const memberDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'N/A'

    return (
        <div className="mt-12 pb-16 max-w-4xl mx-auto">

            {/* ── Top Section: Avatar + Info ── */}
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Left: Photo Card */}
                <div className="flex flex-col items-center gap-3 min-w-[200px]">
                    <div className="relative group">
                        {profile.profilePhoto ? (
                            <img src={profile.profilePhoto} alt={profile.name}
                                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl" />
                        ) : (
                            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                                {initial}
                            </div>
                        )}
                        <label className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition border border-gray-200">
                            {uploading ? (
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                        <p className="text-sm text-gray-400">{profile.email}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${tier.bg} ${tier.text} border ${tier.border}`}>
                        {profile.membershipTier} Member
                    </span>
                </div>

                {/* Right: Stats + Tier Progress */}
                <div className="flex-1 w-full space-y-5">

                    {/* Membership Progress */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Membership Progress</h3>
                                {tier.next ? (
                                    <p className="text-xs text-gray-400 mt-0.5">Spend {currency}{tier.target - profile.totalSpent} more to reach {tier.next}</p>
                                ) : (
                                    <p className="text-xs text-yellow-600 mt-0.5 font-medium">You've reached the highest tier!</p>
                                )}
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.bg} ${tier.text}`}>
                                {profile.membershipTier}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${tier.bar} transition-all duration-1000`}
                                style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
                            <span>Bronze</span>
                            <span>{currency}5,000 → Silver</span>
                            <span>{currency}10,000 → Gold</span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                            <p className="text-2xl font-extrabold text-primary">{profile.loyaltyPoints || 0}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">Loyalty Points</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                            <p className="text-2xl font-extrabold text-gray-800">{currency}{profile.totalSpent || 0}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">Total Spent</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                            <p className="text-2xl font-extrabold text-gray-800">{orders.length}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">Total Orders</p>
                        </div>
                    </div>

                    {/* How Points Work */}
                    <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
                        <h4 className="text-xs font-bold text-primary mb-2">How Loyalty Points Work</h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                Earn 1 pt per {currency}10 spent
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                Redeem 100 pts = {currency}10 off
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                Silver at {currency}5,000 spent
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                                Gold at {currency}10,000 spent
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Profile Details Section ── */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <h2 className="text-base font-bold text-gray-800">Personal Information</h2>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="text-sm text-primary font-medium hover:underline cursor-pointer">
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => { setEditing(false); setForm({ name: profile.name || '', phone: profile.phone || '' }) }}
                                className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer">Cancel</button>
                            <button onClick={handleSave}
                                className="text-sm bg-primary text-white px-4 py-1.5 rounded-lg font-medium hover:bg-primary-dull cursor-pointer transition">Save</button>
                        </div>
                    )}
                </div>

                <div className="divide-y divide-gray-50">
                    {/* Name */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Full Name</p>
                            {editing ? (
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="text-sm font-semibold text-gray-800 border-b-2 border-primary outline-none bg-transparent pb-0.5 w-full" />
                            ) : (
                                <p className="text-sm font-semibold text-gray-800">{profile.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Email</p>
                            <p className="text-sm font-semibold text-gray-800">{profile.email}</p>
                        </div>
                        <span className="text-[10px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded">Cannot change</span>
                    </div>

                    {/* Phone */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Phone</p>
                            {editing ? (
                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    className="text-sm font-semibold text-gray-800 border-b-2 border-primary outline-none bg-transparent pb-0.5 w-full" />
                            ) : (
                                <p className={`text-sm font-semibold ${profile.phone ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                                    {profile.phone || 'Not added yet'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Member Since</p>
                            <p className="text-sm font-semibold text-gray-800">{memberDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'My Orders', path: '/my-orders', icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        )
                    },
                    {
                        label: 'Wishlist', path: '/wishlist', icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'Redeem Points', path: '/loyalty', icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )
                    },
                    {
                        label: 'Contact Us', path: '/contact', icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        )
                    },
                ].map(item => (
                    <button key={item.label} onClick={() => navigate(item.path)}
                        className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-sm transition cursor-pointer group">
                        <span className="text-gray-400 group-hover:text-primary transition">{item.icon}</span>
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-primary transition">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Recent Orders ── */}
            {orders.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
                        <button onClick={() => navigate('/my-orders')} className="text-sm text-primary font-medium hover:underline cursor-pointer">
                            View All
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {orders.slice(0, 3).map(order => (
                            <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status === 'Delivered' ? 'bg-green-500' :
                                            order.status === 'Shipped' ? 'bg-blue-500' :
                                                order.status === 'Order Placed' ? 'bg-amber-500' : 'bg-gray-400'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">{currency}{order.amount}</p>
                                    <p className={`text-[11px] font-medium ${order.status === 'Delivered' ? 'text-green-600' :
                                            order.status === 'Shipped' ? 'text-blue-600' : 'text-amber-600'
                                        }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserProfile
