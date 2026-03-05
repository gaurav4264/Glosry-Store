import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_MAP = {
    pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳', label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-700 border-green-300', icon: '✅', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: '❌', label: 'Rejected' },
    hold: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '⏸️', label: 'On Hold' }
};

const CONFIRM_CONFIG = {
    approved: {
        icon: '✅',
        title: 'Approve Application?',
        desc: 'Seller will be notified and can set their password to begin selling.',
        confirmLabel: 'Yes, Approve',
        btnClass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
        iconBg: 'bg-green-100',
    },
    rejected: {
        icon: '❌',
        title: 'Reject Application?',
        desc: "This action will reject the seller's registration. They can re-apply with correct documents.",
        confirmLabel: 'Yes, Reject',
        btnClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        iconBg: 'bg-red-100',
    },
    hold: {
        icon: '⏸️',
        title: 'Put on Hold?',
        desc: 'Application will be paused for further review. Seller will see "On Hold" status.',
        confirmLabel: 'Yes, Put on Hold',
        btnClass: 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600',
        iconBg: 'bg-orange-100',
    },
    pending: {
        icon: '↩️',
        title: 'Reset to Pending?',
        desc: 'Application status will be reset back to Pending for re-review.',
        confirmLabel: 'Yes, Reset',
        btnClass: 'bg-gray-600 hover:bg-gray-700',
        iconBg: 'bg-gray-100',
    },
};

// ─── Beautiful Custom Confirm Modal ───────────────────────────────────────────
const ConfirmModal = ({ status, sellerName, onConfirm, onCancel, loading }) => {
    const cfg = CONFIRM_CONFIG[status];
    if (!cfg) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={loading ? null : onCancel}
            />
            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10"
                style={{ animation: 'modal-in .2s ease' }}
            >
                {/* Icon */}
                <div className={`w-20 h-20 ${cfg.iconBg} rounded-full flex items-center justify-center text-4xl mx-auto mb-5 shadow-sm`}>
                    {cfg.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">{cfg.title}</h2>
                <p className="text-sm text-gray-500 text-center leading-relaxed mb-4">{cfg.desc}</p>

                {/* Seller Name Badge */}
                {sellerName && (
                    <div className="flex justify-center mb-5">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm px-5 py-2 rounded-full">
                            👤 {sellerName}
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-5" />

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3.5 rounded-xl text-white font-bold transition-all shadow-lg text-sm ${cfg.btnClass} disabled:opacity-60 flex items-center justify-center gap-2`}
                    >
                        {loading ? <span className="animate-spin inline-block">⌛</span> : null}
                        {loading ? 'Processing...' : cfg.confirmLabel}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.92) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AdminSellerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [updating, setUpdating] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);

    // Confirm modal state
    const [confirmModal, setConfirmModal] = useState({ open: false, status: null });

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const { data } = await axios.get(`/api/admin/sellers/${id}`);
                if (data.success) {
                    setApp(data.application);
                    setRemarks(data.application.adminRemarks || '');
                } else {
                    toast.error(data.message);
                }
            } catch (e) {
                toast.error(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [id]);

    // Open custom modal instead of window.confirm
    const askConfirm = (status) => {
        setConfirmModal({ open: true, status });
    };

    const handleConfirm = async () => {
        const status = confirmModal.status;
        setUpdating(true);
        try {
            const { data } = await axios.put(`/api/admin/sellers/${id}/status`, {
                status,
                adminRemarks: remarks
            });
            if (data.success) {
                setApp(prev => ({
                    ...prev,
                    status: data.application.status,
                    adminRemarks: data.application.adminRemarks,
                    approvedAt: data.application.approvedAt
                }));
                toast.success(`Application ${status} successfully! ✅`);
                setConfirmModal({ open: false, status: null });
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelModal = () => {
        if (!updating) setConfirmModal({ open: false, status: null });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="text-5xl animate-spin mb-3">⌛</div>
                <p className="text-gray-400">Loading application...</p>
            </div>
        </div>
    );

    if (!app) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <span className="text-5xl">⚠️</span>
                <p className="text-gray-500 mt-3">Application not found</p>
            </div>
        </div>
    );

    const st = STATUS_MAP[app.status] || STATUS_MAP.pending;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-6 py-5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {app.passportPhoto
                            ? <img src={app.passportPhoto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/50 shadow-lg" />
                            : <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{app.fullName?.[0]}</div>
                        }
                        <div>
                            <h1 className="text-xl font-bold">{app.fullName}</h1>
                            <p className="text-indigo-200 text-sm">{app.email} · {app.mobileNumber}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/seller/vendor-applications')} className="text-indigo-200 hover:text-white text-sm">← Back to List</button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* ID Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '📋', label: 'Application Number', value: app.applicationNumber, col: 'bg-blue-50 border-blue-200' },
                        { icon: '🏪', label: 'Shop Reg Number', value: app.shopRegNumber, col: 'bg-purple-50 border-purple-200' },
                        { icon: '👤', label: 'Seller ID', value: app.sellerId, col: 'bg-green-50 border-green-200' }
                    ].map(item => (
                        <div key={item.label} className={`rounded-xl p-4 border ${item.col}`}>
                            <p className="text-xs font-bold text-gray-500 mb-1">{item.icon} {item.label}</p>
                            <p className="font-bold font-mono text-gray-800">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Current Status */}
                <div className={`rounded-xl p-4 border ${st.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{st.icon}</span>
                        <div>
                            <p className="text-xs font-bold uppercase opacity-70">Current Status</p>
                            <p className="text-xl font-bold">{st.label}</p>
                        </div>
                    </div>
                    <div className="text-right text-xs opacity-70">
                        <p>Applied: {new Date(app.registrationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        {app.approvedAt && <p>Approved: {new Date(app.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">👤 Personal Information</h2>
                        {[
                            ['Full Name', app.fullName], ['Mobile', app.mobileNumber], ['Email', app.email],
                            ['Aadhaar No.', app.aadhaarNumber], ['PAN No.', app.panNumber],
                            ['Bank Account', app.bankAccountNumber], ['IFSC Code', app.ifscCode],
                            ['GST Number', app.gstNumber || 'Not Provided']
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="text-gray-400 text-sm">{k}</span>
                                <span className="text-gray-800 text-sm font-semibold text-right max-w-[55%] break-all">{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Shop Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🏪 Shop Details</h2>
                        {[
                            ['Shop Name', app.shopName], ['Category', app.shopCategory],
                            ['Address', app.shopAddress], ['City', app.city], ['State', app.state],
                            ['PIN Code', app.pinCode], ['Landmark', app.landmark || 'N/A']
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="text-gray-400 text-sm">{k}</span>
                                <span className="text-gray-800 text-sm font-semibold text-right max-w-[55%]">{v}</span>
                            </div>
                        ))}
                        {app.location?.coordinates?.[0] !== 0 && (
                            <a
                                href={`https://www.google.com/maps?q=${app.location.coordinates[1]},${app.location.coordinates[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-600 font-semibold hover:underline"
                            >
                                📍 View on Google Maps →
                            </a>
                        )}
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">📄 Uploaded Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            ['Aadhaar Card', app.aadhaarImage],
                            ['PAN Card', app.panImage],
                            ['Passport Photo', app.passportPhoto]
                        ].map(([label, url]) => (
                            <div key={label} className="text-center">
                                <p className="text-sm font-semibold text-gray-600 mb-3">{label}</p>
                                {url ? (
                                    <button onClick={() => setSelectedImg(url)} className="w-full">
                                        <img
                                            src={url}
                                            alt={label}
                                            className="w-full h-36 object-cover rounded-xl border-2 border-indigo-200 shadow hover:shadow-lg hover:border-indigo-400 transition-all cursor-zoom-in"
                                        />
                                        <p className="text-xs text-indigo-500 mt-2 font-medium">Click to enlarge</p>
                                    </button>
                                ) : (
                                    <div className="w-full h-36 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                        <div className="text-center"><span className="text-3xl">📁</span><p className="text-xs mt-2">Not uploaded</p></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin Action Panel */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">⚙️ Admin Action</h2>
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Remarks (optional)</label>
                        <textarea
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            rows={3}
                            placeholder="Write remarks for the seller (e.g., reason for rejection, additional info needed...)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => askConfirm('approved')}
                            disabled={updating || app.status === 'approved'}
                            className="flex-1 min-w-[130px] py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            ✅ {app.status === 'approved' ? 'Already Approved' : 'Approve'}
                        </button>
                        <button
                            onClick={() => askConfirm('hold')}
                            disabled={updating || app.status === 'hold'}
                            className="flex-1 min-w-[130px] py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            ⏸️ Put on Hold
                        </button>
                        <button
                            onClick={() => askConfirm('rejected')}
                            disabled={updating || app.status === 'rejected'}
                            className="flex-1 min-w-[130px] py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            ❌ Reject
                        </button>
                        <button
                            onClick={() => askConfirm('pending')}
                            disabled={updating || app.status === 'pending'}
                            className="flex-1 min-w-[130px] py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            ↩️ Reset to Pending
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Custom Confirm Modal ─── */}
            {confirmModal.open && (
                <ConfirmModal
                    status={confirmModal.status}
                    sellerName={app?.shopName}
                    onConfirm={handleConfirm}
                    onCancel={handleCancelModal}
                    loading={updating}
                />
            )}

            {/* Image Lightbox */}
            {selectedImg && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
                    <div className="relative max-w-3xl max-h-[90vh] w-full">
                        <img src={selectedImg} alt="document" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
                        <button onClick={() => setSelectedImg(null)} className="absolute top-3 right-3 bg-white text-gray-800 rounded-full w-10 h-10 text-xl font-bold hover:bg-gray-100 transition-all shadow-lg">✕</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSellerDetail;
