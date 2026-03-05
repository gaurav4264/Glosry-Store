import React, { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_COLORS = {
    'Order Placed': 'bg-blue-100 text-blue-700 border-blue-200',
    'Packing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Shipped': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Out for Delivery': 'bg-orange-100 text-orange-700 border-orange-200',
    'Delivered': 'bg-green-100 text-green-700 border-green-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    'Return Requested': 'bg-purple-100 text-purple-700 border-purple-200',
    'Returned': 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_OPTIONS = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Return Requested', 'Returned', 'Cancelled'];

const Orders = () => {
    const { currency, axios: appAxios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [vendorsLoading, setVendorsLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null); // full vendor object
    const [vendorProducts, setVendorProducts] = useState([]);
    const [vendorProductsLoading, setVendorProductsLoading] = useState(false);
    const [showProductPanel, setShowProductPanel] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [shopFilter, setShopFilter] = useState('all'); // sellerId
    const [paymentFilter, setPaymentFilter] = useState('all');

    // Stats
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await appAxios.get('/api/order/seller');
            if (data.success) setOrders(data.orders);
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const fetchVendors = async () => {
        setVendorsLoading(true);
        try {
            const { data } = await appAxios.get('/api/admin/sellers?limit=200');
            if (data.success) setVendors(data.applications || []);
        } catch (e) {
            console.error('fetchVendors error:', e.message);
        } finally {
            setVendorsLoading(false);
        }
    };

    const fetchVendorProducts = async (vendorDbId) => {
        setVendorProductsLoading(true);
        setVendorProducts([]);
        try {
            const { data } = await axios.get(`/api/admin/vendor-products/${vendorDbId}`);
            if (data.success) setVendorProducts(data.products);
        } catch { }
        finally { setVendorProductsLoading(false); }
    };

    useEffect(() => { fetchOrders(); fetchVendors(); }, []);

    const handleVendorSelect = (e) => {
        const sId = e.target.value;
        setShopFilter(sId);
        if (sId !== 'all') {
            const v = vendors.find(v => v.sellerId === sId);
            setSelectedVendor(v || null);
        } else {
            setSelectedVendor(null);
            setShowProductPanel(false);
        }
    };

    const openProductPanel = () => {
        if (!selectedVendor) return;
        setShowProductPanel(true);
        fetchVendorProducts(selectedVendor._id);
    };

    const statusHandler = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            const { data } = await appAxios.post('/api/order/status', { orderId, status });
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
                toast.success(`Status → ${status}`);
            } else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
        finally { setUpdatingId(null); }
    };

    const updateOrderSlot = async (orderId, date, time) => {
        try {
            const { data } = await appAxios.post('/api/order/status', { orderId, date, time });
            if (data.success) { toast.success("Slot Updated"); fetchOrders(); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
    };

    // Derived stats
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        return {
            total: orders.length,
            todayOrders: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
            pending: orders.filter(o => ['Order Placed', 'Packing'].includes(o.status)).length,
            delivered: orders.filter(o => o.status === 'Delivered').length,
            revenue: orders.filter(o => o.isPaid).reduce((s, o) => s + (o.amount || 0), 0),
            cancelled: orders.filter(o => o.status === 'Cancelled').length,
        };
    }, [orders]);

    // Filtered list
    const filtered = useMemo(() => {
        let r = [...orders];
        if (statusFilter !== 'all') r = r.filter(o => o.status === statusFilter);
        if (paymentFilter === 'paid') r = r.filter(o => o.isPaid);
        if (paymentFilter === 'unpaid') r = r.filter(o => !o.isPaid);
        if (shopFilter !== 'all') r = r.filter(o => o.sellerId === shopFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(o =>
                o._id.toLowerCase().includes(q) ||
                (o.address?.firstName + ' ' + o.address?.lastName).toLowerCase().includes(q) ||
                o.items?.some(i => i.product?.name?.toLowerCase().includes(q))
            );
        }
        return r;
    }, [orders, statusFilter, paymentFilter, shopFilter, searchQuery]);

    // Export to CSV
    const exportToCSV = () => {
        if (!filtered.length) return toast.error("No orders to export");
        const headers = ["Order ID", "Date", "Customer", "Amount", "Status", "Payment", "Shop", "Items"];
        const rows = filtered.map(o => [
            o._id,
            new Date(o.createdAt).toLocaleDateString(),
            o.address ? `${o.address.firstName} ${o.address.lastName}` : 'N/A',
            o.amount,
            o.status,
            o.paymentType,
            o.sellerId || 'Admin',
            o.items?.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join('; ')
        ]);
        const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (!filtered.length) return toast.error("No orders to export");
        const doc = new jsPDF();
        doc.setFontSize(20); doc.setTextColor(79, 70, 229);
        doc.text("SABZIKART — Order Report", 105, 15, { align: "center" });
        doc.setFontSize(9); doc.setTextColor(120);
        doc.text(`Generated: ${new Date().toLocaleString()}  |  Total: ${filtered.length} orders`, 105, 22, { align: "center" });
        autoTable(doc, {
            head: [["#", "Date", "Customer", "Amount", "Status", "Shop"]],
            body: filtered.map((o, i) => [
                i + 1,
                new Date(o.createdAt).toLocaleDateString(),
                o.address ? `${o.address.firstName} ${o.address.lastName}` : 'N/A',
                `${currency}${o.amount}`,
                o.status,
                o.sellerId || 'Admin'
            ]),
            startY: 28,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 8 }
        });
        doc.save(`orders_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
            <div className="md:p-8 p-4">
                {/* ── Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">🛒 Orders Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Manage all customer orders & vendor shops</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={exportToCSV} className="px-3 py-2 text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all">📄 CSV</button>
                        <button onClick={exportToPDF} className="px-3 py-2 text-xs font-bold bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-all">📄 PDF</button>
                        <button onClick={fetchOrders} className="px-3 py-2 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all">🔄 Refresh</button>
                    </div>
                </div>

                {/* ── Live Stats Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {[
                        { label: 'Total', val: stats.total, icon: '📦', color: 'from-indigo-500 to-purple-600' },
                        { label: "Today's", val: stats.todayOrders, icon: '🌅', color: 'from-blue-400 to-cyan-500' },
                        { label: 'Pending', val: stats.pending, icon: '⏳', color: 'from-yellow-400 to-amber-500' },
                        { label: 'Delivered', val: stats.delivered, icon: '✅', color: 'from-green-500 to-emerald-600' },
                        { label: 'Cancelled', val: stats.cancelled, icon: '❌', color: 'from-red-500 to-rose-600' },
                        { label: 'Revenue', val: `${currency}${stats.revenue.toLocaleString()}`, icon: '💰', color: 'from-orange-400 to-pink-500' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                                <p className="font-bold text-gray-800 text-sm">{loading ? '...' : s.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Shop Filter + Product Panel ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🏪 Filter by Registered Shop</p>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select value={shopFilter} onChange={handleVendorSelect}
                            className="flex-1 min-w-[220px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 font-medium">
                            <option value="all">🏪 All Shops (Show All Orders)</option>
                            {vendorsLoading && <option disabled>Loading shops...</option>}
                            {!vendorsLoading && vendors.length === 0 && <option disabled>No registered shops found</option>}
                            {vendors.map(v => (
                                <option key={v._id} value={v.sellerId}>
                                    {v.shopName} — {v.city}{v.area ? `, ${v.area}` : ''} · {v.shopCategory} [{v.status}]
                                </option>
                            ))}
                        </select>

                        {selectedVendor && (
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
                                {selectedVendor.shopLogo
                                    ? <img src={selectedVendor.shopLogo} alt="" className="w-8 h-8 rounded-lg object-cover border border-indigo-200" />
                                    : <div className="w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">{selectedVendor.shopName?.[0]}</div>
                                }
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-indigo-800 text-sm truncate">{selectedVendor.shopName}</p>
                                    <p className="text-xs text-indigo-500">{selectedVendor.city} · {selectedVendor.shopCategory} · <span className="font-mono">{selectedVendor.sellerId}</span></p>
                                </div>
                                <button onClick={openProductPanel}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all whitespace-nowrap">
                                    📦 Products
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Product Panel (inline) */}
                    {showProductPanel && selectedVendor && (
                        <div className="mt-4 border border-indigo-100 rounded-xl bg-indigo-50/40 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-indigo-700 text-sm">📦 {selectedVendor.shopName}'s Products</p>
                                <button onClick={() => setShowProductPanel(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                            </div>
                            {vendorProductsLoading ? (
                                <div className="flex items-center gap-2 text-indigo-500 text-sm py-3">
                                    <span className="animate-spin">⌛</span> Loading...
                                </div>
                            ) : vendorProducts.length === 0 ? (
                                <p className="text-gray-400 text-sm py-4 text-center">No products added yet by this seller</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-1">
                                    {vendorProducts.map(p => (
                                        <div key={p._id} className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col gap-1 shadow-sm hover:shadow-md transition-all">
                                            <img src={p.image?.[0] || 'https://placehold.co/60x60?text=?'} alt=""
                                                className="w-full h-14 object-cover rounded-lg border border-gray-100"
                                                onError={e => e.target.src = 'https://placehold.co/60x60?text=?'} />
                                            <p className="text-xs font-bold text-gray-800 truncate leading-tight">{p.name}</p>
                                            <p className="text-xs text-indigo-500 font-medium">₹{p.offerPrice}</p>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-center ${p.inStock && p.stockQuantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                {p.inStock && p.stockQuantity > 0 ? `${p.stockQuantity} left` : 'OOS'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Smart Filters ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 flex-1 min-w-[180px]">
                            <span className="text-gray-400">🔍</span>
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search order ID, customer, product..."
                                className="w-full text-sm outline-none bg-transparent placeholder-gray-400" />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500">✕</button>}
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none min-w-[140px]">
                            <option value="all">All Status</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none">
                            <option value="all">All Payments</option>
                            <option value="paid">✅ Paid</option>
                            <option value="unpaid">⏳ Unpaid</option>
                        </select>
                        {(searchQuery || statusFilter !== 'all' || shopFilter !== 'all' || paymentFilter !== 'all') && (
                            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setShopFilter('all'); setPaymentFilter('all'); setSelectedVendor(null); setShowProductPanel(false); }}
                                className="px-3 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
                                🔄 Clear All
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Showing <strong className="text-gray-700">{filtered.length}</strong> of {orders.length} orders</p>
                </div>

                {/* ── Orders List ── */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="text-gray-500 font-medium">No orders found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting the filters above</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(order => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                {/* Order Header Bar */}
                                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <p className="font-mono text-xs font-bold text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                        {order.sellerId && (
                                            <span className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-mono font-bold border border-indigo-100">
                                                🏪 {order.sellerId}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {order.isPaid ? '💳 Paid' : '⏳ Unpaid'}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="flex flex-col md:flex-row gap-4 p-5">
                                    {/* Items */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                                                    {item.product?.image?.[0] && (
                                                        <img src={item.product.image[0]} alt="" className="w-7 h-7 rounded-lg object-cover border border-gray-200" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">{item.product?.name || 'Item Removed'}</p>
                                                        <p className="text-xs text-gray-400">×{item.quantity} — ₹{(item.product?.offerPrice || 0) * item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-lg font-bold text-gray-800">{currency}{order.amount}
                                            {order.discount > 0 && <span className="text-xs text-green-500 font-normal ml-2">(-₹{order.discount} off)</span>}
                                        </p>
                                    </div>

                                    {/* Customer + Delivery */}
                                    <div className="flex flex-col gap-1 text-sm text-gray-600 min-w-[180px]">
                                        {order.address && (
                                            <p className="font-semibold text-gray-800">👤 {order.address.firstName} {order.address.lastName}</p>
                                        )}
                                        <p className="text-xs text-gray-400">{order.paymentType}</p>
                                        {order.scheduledDeliveryDate && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-xs text-blue-600 mt-1">
                                                📅 {new Date(order.scheduledDeliveryDate).toDateString()}<br />
                                                ⏰ {order.deliveryTimeSlot}
                                            </div>
                                        )}
                                        {/* Slot Editor */}
                                        <div className="flex gap-1.5 mt-2">
                                            <input type="date" className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none bg-gray-50 flex-1"
                                                defaultValue={order.scheduledDeliveryDate && !isNaN(new Date(order.scheduledDeliveryDate)) ? new Date(order.scheduledDeliveryDate).toISOString().split('T')[0] : ""}
                                                onChange={e => updateOrderSlot(order._id, e.target.value, order.deliveryTimeSlot)} />
                                            <select className="border border-gray-200 rounded-lg px-1 py-1 text-xs outline-none bg-gray-50"
                                                defaultValue={order.deliveryTimeSlot || ""}
                                                onChange={e => updateOrderSlot(order._id, order.scheduledDeliveryDate, e.target.value)}>
                                                <option value="" disabled>Slot</option>
                                                <option value="Morning (9AM-12PM)">🌅 Morning</option>
                                                <option value="Afternoon (12PM-4PM)">☀️ Afternoon</option>
                                                <option value="Evening (4PM-8PM)">🌆 Evening</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status Control */}
                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Update Status</p>
                                        <select
                                            value={order.status}
                                            disabled={updatingId === order._id}
                                            onChange={e => statusHandler(order._id, e.target.value)}
                                            className={`px-3 py-2 text-sm font-semibold rounded-xl border focus:outline-none transition-all ${STATUS_COLORS[order.status] || 'bg-gray-50 border-gray-200 text-gray-700'} ${updatingId === order._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        {updatingId === order._id && <p className="text-xs text-indigo-500 animate-pulse">Updating...</p>}

                                        {order.status === 'Cancelled' && order.cancellationReason && (
                                            <div className="p-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                                                ❌ {order.cancellationReason}
                                            </div>
                                        )}
                                        {['Return Requested', 'Returned'].includes(order.status) && order.returnReason && (
                                            <div className="p-2 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-600">
                                                ↩️ {order.returnReason}
                                                {order.returnImages?.length > 0 && (
                                                    <div className="flex gap-1 mt-1 flex-wrap">
                                                        {order.returnImages.map((img, i) => (
                                                            <a key={i} href={img} target="_blank" rel="noreferrer">
                                                                <img src={img} alt="" className="w-8 h-8 rounded-lg border border-purple-200 object-cover hover:opacity-80" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {order.trackingId && (
                                            <div className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-600 font-mono">
                                                🚚 {order.trackingId}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
