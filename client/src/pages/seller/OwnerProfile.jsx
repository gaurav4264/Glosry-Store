import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const OwnerProfile = () => {
    const { axios } = useAppContext();
    const [tab, setTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [uploading, setUploading] = useState(false);
    const [expandedMsg, setExpandedMsg] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchMessages();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get('/api/contact/owner-profile');
            if (data.success) {
                setProfile(data.profile);
                setForm(data.profile);
            }
        } catch (err) { console.log(err); }
    };

    const fetchMessages = async () => {
        try {
            const { data } = await axios.get('/api/contact/messages');
            if (data.success) {
                setMessages(data.messages);
                setUnreadCount(data.unreadCount);
            } else {
                console.log('Messages fetch failed:', data.message);
            }
        } catch (err) { console.log('Messages error:', err); }
    };

    const handleSaveProfile = async () => {
        try {
            const { data } = await axios.put('/api/contact/update-profile', form);
            if (data.success) {
                toast.success('Profile updated!');
                setProfile(data.profile);
                setEditing(false);
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const { data } = await axios.post('/api/contact/upload-photo', formData);
            if (data.success) {
                toast.success('Photo uploaded!');
                setProfile(data.profile);
                setForm(prev => ({ ...prev, photo: data.profile.photo }));
            } else toast.error(data.message);
        } catch (err) { toast.error(err.message); }
        setUploading(false);
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.put('/api/contact/mark-read', { messageId: id });
            fetchMessages();
        } catch (err) { console.log(err); }
    };

    const handleDeleteMsg = async (id) => {
        try {
            const { data } = await axios.delete('/api/contact/delete', { data: { messageId: id } });
            if (data.success) {
                toast.success('Message deleted');
                fetchMessages();
            }
        } catch (err) { toast.error(err.message); }
    };

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const ownerInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'S';

    return (
        <div className="p-6 max-w-5xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-8 w-24 h-24 bg-white/10 rounded-full translate-y-1/2"></div>
                <div className="relative flex items-center gap-5">
                    <div className="relative group">
                        {profile?.photo ? (
                            <img src={profile.photo} alt="Owner" className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                {ownerInitial}
                            </div>
                        )}
                        <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300">
                            <span className="text-white text-sm font-medium">{uploading ? '⏳' : '📷'}</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{profile?.name || 'Store Owner'}</h1>
                        <p className="text-purple-200 text-sm">{profile?.businessName || 'My Grocery Store'}</p>
                        <p className="text-purple-300 text-xs mt-1">{profile?.email || 'Set your email'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('profile')} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${tab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    👤 My Profile
                </button>
                <button onClick={() => setTab('messages')} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 relative ${tab === 'messages' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    📩 Messages
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Profile Settings</h2>
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition cursor-pointer">
                                ✏️ Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(false); setForm(profile); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleSaveProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition cursor-pointer">
                                    💾 Save
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {[
                            { label: 'Full Name', key: 'name', icon: '👤', placeholder: 'Your name' },
                            { label: 'Email Address', key: 'email', icon: '📧', placeholder: 'your@email.com' },
                            { label: 'Phone Number', key: 'phone', icon: '📞', placeholder: '+91 XXXXXXXXXX' },
                            { label: 'Business Name', key: 'businessName', icon: '🏪', placeholder: 'Store name' },
                            { label: 'Store Address', key: 'address', icon: '📍', placeholder: 'Full address' },
                            { label: 'Business Hours', key: 'businessHours', icon: '🕐', placeholder: 'Mon-Sat: 8AM-9PM' },
                            { label: 'Sunday Hours', key: 'sundayHours', icon: '📅', placeholder: 'Sunday: 9AM-6PM' },
                        ].map(field => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    {field.icon} {field.label}
                                </label>
                                {editing ? (
                                    <input
                                        type="text"
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                                    />
                                ) : (
                                    <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium">
                                        {profile?.[field.key] || <span className="text-gray-400 italic">Not set</span>}
                                    </p>
                                )}
                            </div>
                        ))}
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                💬 About / Bio
                            </label>
                            {editing ? (
                                <textarea
                                    value={form.about || ''}
                                    onChange={(e) => setForm({ ...form, about: e.target.value })}
                                    placeholder="Tell customers about yourself and your store..."
                                    rows="3"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                                />
                            ) : (
                                <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium">
                                    {profile?.about || <span className="text-gray-400 italic">Not set</span>}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">📷 Profile Photo</h3>
                        <div className="flex items-center gap-4">
                            {profile?.photo ? (
                                <img src={profile.photo} alt="Owner" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">{ownerInitial}</div>
                            )}
                            <label className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition cursor-pointer">
                                {uploading ? '⏳ Uploading...' : '📤 Upload New Photo'}
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Tab */}
            {tab === 'messages' && (
                <div>
                    {/* Messages Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
                            <p className="text-xs text-blue-600 font-medium">Total Messages</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-amber-600">{unreadCount}</p>
                            <p className="text-xs text-amber-600 font-medium">Unread</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{messages.length - unreadCount}</p>
                            <p className="text-xs text-green-600 font-medium">Read</p>
                        </div>
                    </div>

                    {/* Messages List */}
                    {messages.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <p className="text-5xl mb-3">📭</p>
                            <p className="text-lg font-semibold text-gray-500">No messages yet</p>
                            <p className="text-sm text-gray-400 mt-1">User messages from the contact page will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map(msg => (
                                <div key={msg._id}
                                    className={`border rounded-2xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer ${!msg.isRead ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-100'
                                        }`}
                                    onClick={() => {
                                        setExpandedMsg(expandedMsg === msg._id ? null : msg._id);
                                        if (!msg.isRead) handleMarkRead(msg._id);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${!msg.isRead ? 'bg-indigo-500' : 'bg-gray-400'}`}>
                                                {msg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-800 text-sm">{msg.name}</p>
                                                    {!msg.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>}
                                                </div>
                                                <p className="text-xs text-gray-400">{msg.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteMsg(msg._id); }}
                                                className="text-gray-300 hover:text-red-500 transition cursor-pointer text-sm"
                                            >🗑️</button>
                                        </div>
                                    </div>

                                    {msg.subject && (
                                        <p className="mt-2 text-sm font-semibold text-gray-700">📌 {msg.subject}</p>
                                    )}

                                    {expandedMsg === msg._id ? (
                                        <div className="mt-3 p-4 bg-white rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                                                <a href={`mailto:${msg.email}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition">
                                                    📧 Reply via Email
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs text-gray-500 truncate">{msg.message}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OwnerProfile;
