import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ProductList = () => {
    const { products, currency, axios: appAxios, fetchProducts } = useAppContext();

    // Vendor/Shop state
    const [vendors, setVendors] = useState([]);
    const [shopFilter, setShopFilter] = useState('all'); // 'all' | 'admin' | sellerId

    // Existing filter states
    const [editingStock, setEditingStock] = useState(null);
    const [stockValue, setStockValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStock, setFilterStock] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const { data } = await appAxios.get('/api/admin/sellers?limit=200');
            if (data.success) setVendors(data.applications || []);
        } catch (e) {
            console.error('fetchVendors error:', e.message);
        }
    };

    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await appAxios.post('/api/product/stock', { id, inStock });
            if (data.success) { fetchProducts(); toast.success(data.message); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
    };

    const deleteProduct = async (id, productName) => {
        if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
        try {
            const { data } = await appAxios.post('/api/product/remove', { id });
            if (data.success) { fetchProducts(); toast.success('Product deleted!'); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
    };

    const startEditStock = (product) => {
        setEditingStock(product._id);
        setStockValue(product.stockQuantity ?? 0);
    };

    const saveStock = async (id) => {
        const qty = Number(stockValue);
        if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity'); return; }
        try {
            const { data } = await appAxios.post('/api/product/update-stock', { id, stockQuantity: qty });
            if (data.success) { fetchProducts(); toast.success('Stock updated!'); setEditingStock(null); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
    };

    const getStockBadge = (product) => {
        const qty = product.stockQuantity ?? 0;
        if (!product.inStock || qty === 0) return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Out of Stock</span>;
        if (qty <= 10) return <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">⚠️ Low: {qty}</span>;
        return <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">{qty} units</span>;
    };

    // Vendor info map by vendorId → vendor
    const vendorMap = useMemo(() => {
        const map = {};
        vendors.forEach(v => { map[v._id.toString()] = v; });
        return map;
    }, [vendors]);

    const productCategories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return cats.sort();
    }, [products]);

    // Stats
    const stats = useMemo(() => ({
        total: products.length,
        inStock: products.filter(p => p.inStock && (p.stockQuantity ?? 0) > 0).length,
        outOfStock: products.filter(p => !p.inStock || (p.stockQuantity ?? 0) === 0).length,
        lowStock: products.filter(p => p.inStock && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10).length,
        byVendor: products.filter(p => p.vendorId).length,
        byAdmin: products.filter(p => !p.vendorId).length,
    }), [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Shop filter
        if (shopFilter === 'admin') result = result.filter(p => !p.vendorId);
        else if (shopFilter !== 'all') result = result.filter(p => p.vendorId === shopFilter);

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.vendorShopName?.toLowerCase().includes(q)
            );
        }

        // Category
        if (filterCategory !== 'all') result = result.filter(p => p.category === filterCategory);

        // Stock
        if (filterStock === 'inStock') result = result.filter(p => p.inStock && (p.stockQuantity ?? 0) > 0);
        else if (filterStock === 'outOfStock') result = result.filter(p => !p.inStock || (p.stockQuantity ?? 0) === 0);
        else if (filterStock === 'lowStock') result = result.filter(p => p.inStock && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 10);

        // Sort
        if (sortBy === 'priceAsc') result.sort((a, b) => (a.offerPrice ?? 0) - (b.offerPrice ?? 0));
        else if (sortBy === 'priceDesc') result.sort((a, b) => (b.offerPrice ?? 0) - (a.offerPrice ?? 0));
        else if (sortBy === 'nameAsc') result.sort((a, b) => a.name?.localeCompare(b.name));
        else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return result;
    }, [products, shopFilter, searchQuery, filterCategory, filterStock, sortBy]);

    const hasActiveFilters = filterCategory !== 'all' || filterStock !== 'all' || sortBy !== 'newest' || shopFilter !== 'all';

    const resetFilters = () => {
        setFilterCategory('all');
        setFilterStock('all');
        setSortBy('newest');
        setSearchQuery('');
        setShopFilter('all');
    };

    const selectedVendorInfo = shopFilter !== 'all' && shopFilter !== 'admin'
        ? vendors.find(v => v._id.toString() === shopFilter || v.sellerId === shopFilter)
        : null;

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
            <div className="w-full md:p-8 p-4">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">📦 Product List</h1>
                        <p className="text-gray-400 text-sm mt-0.5">{products.length} total products across all shops</p>
                    </div>
                    <button onClick={fetchProducts} className="px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all">
                        🔄 Refresh
                    </button>
                </div>

                {/* ── Live Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                    {[
                        { label: 'Total', val: stats.total, color: 'from-indigo-500 to-purple-600', icon: '📦', filter: () => { setShopFilter('all'); setFilterStock('all'); } },
                        { label: 'In Stock', val: stats.inStock, color: 'from-green-500 to-emerald-600', icon: '✅', filter: () => setFilterStock('inStock') },
                        { label: 'Out of Stock', val: stats.outOfStock, color: 'from-red-500 to-rose-500', icon: '❌', filter: () => setFilterStock('outOfStock') },
                        { label: 'Low Stock', val: stats.lowStock, color: 'from-orange-400 to-amber-500', icon: '⚠️', filter: () => setFilterStock('lowStock') },
                        { label: 'By Vendors', val: stats.byVendor, color: 'from-blue-500 to-cyan-500', icon: '🏪', filter: () => setShopFilter('') },
                        { label: 'By Admin', val: stats.byAdmin, color: 'from-gray-500 to-slate-600', icon: '👑', filter: () => setShopFilter('admin') },
                    ].map(s => (
                        <button key={s.label} onClick={s.filter}
                            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 text-base`}>{s.icon}</div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                                <p className="font-bold text-gray-800">{s.val}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ── Shop Filter ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">🏪 Filter by Shop / Seller</p>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select value={shopFilter} onChange={e => setShopFilter(e.target.value)}
                            className="flex-1 min-w-[220px] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 font-medium">
                            <option value="all">🏪 All Shops (Admin + Vendors)</option>
                            <option value="admin">👑 Admin Added Only</option>
                            {vendors.length === 0 && (
                                <option disabled>Loading vendors...</option>
                            )}
                            {vendors.map(v => (
                                <option key={v._id} value={v._id.toString()}>
                                    {v.shopName} — {v.city}{v.area ? `, ${v.area}` : ''} · {v.sellerId} [{v.status}]
                                </option>
                            ))}
                        </select>

                        {/* Selected vendor info badge */}
                        {selectedVendorInfo && (
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                                {selectedVendorInfo.shopLogo
                                    ? <img src={selectedVendorInfo.shopLogo} alt="" className="w-8 h-8 rounded-lg object-cover border border-indigo-200" />
                                    : <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{selectedVendorInfo.shopName?.[0]}</div>
                                }
                                <div>
                                    <p className="font-bold text-indigo-800 text-sm">{selectedVendorInfo.shopName}</p>
                                    <p className="text-xs text-indigo-400">{selectedVendorInfo.shopCategory} · 📍{selectedVendorInfo.city}{selectedVendorInfo.area ? `, ${selectedVendorInfo.area}` : ''}</p>
                                </div>
                                <button onClick={() => setShopFilter('all')} className="text-indigo-300 hover:text-indigo-600 ml-2">✕</button>
                            </div>
                        )}
                        {shopFilter === 'admin' && (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                                <span className="text-xl">👑</span>
                                <div>
                                    <p className="font-bold text-gray-700 text-sm">Admin Products</p>
                                    <p className="text-xs text-gray-400">Added directly by store admin</p>
                                </div>
                                <button onClick={() => setShopFilter('all')} className="text-gray-300 hover:text-gray-600 ml-2">✕</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Search + Filters ── */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center flex-1 min-w-[200px] border border-gray-200 rounded-xl bg-white px-3 py-2.5 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300 transition">
                        <span className="text-gray-400">🔍</span>
                        <input type="text" placeholder="Search product, category, shop name..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500 text-lg">✕</button>}
                    </div>

                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${showFilters || hasActiveFilters ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                        🔽 Filters {hasActiveFilters && <span className="bg-white text-indigo-600 rounded-full px-1.5 py-0.5 text-xs font-bold">✓</span>}
                    </button>

                    {(hasActiveFilters || searchQuery) && (
                        <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100 transition-all">
                            ✕ Clear All
                        </button>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">📦 Category</label>
                                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50">
                                    <option value="all">All Categories</option>
                                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">📊 Stock Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { val: 'all', label: 'All' },
                                        { val: 'inStock', label: '✅ In Stock' },
                                        { val: 'outOfStock', label: '❌ Out of Stock' },
                                        { val: 'lowStock', label: '⚠️ Low Stock' },
                                    ].map(opt => (
                                        <button key={opt.val} onClick={() => setFilterStock(opt.val)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${filterStock === opt.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">↕️ Sort By</label>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50">
                                    <option value="newest">Newest First</option>
                                    <option value="nameAsc">Name A → Z</option>
                                    <option value="priceAsc">Price: Low → High</option>
                                    <option value="priceDesc">Price: High → Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Count */}
                <p className="text-sm text-gray-400 mb-3">
                    Showing <strong className="text-gray-700">{filteredProducts.length}</strong> of <strong className="text-gray-700">{products.length}</strong> products
                    {shopFilter !== 'all' && <span className="ml-2 text-indigo-500 font-semibold">
                        {shopFilter === 'admin' ? '(Admin only)' : selectedVendorInfo ? `(${selectedVendorInfo.shopName})` : ''}
                    </span>}
                </p>

                {/* ── Product Table ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Product</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Category</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Shop / Seller</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Price</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Stock</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Toggle</th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-16 text-gray-400">
                                            <span className="text-4xl block mb-2">📭</span>
                                            <p className="font-medium">No products found</p>
                                            <button onClick={resetFilters} className="text-indigo-500 text-sm underline mt-1 hover:text-indigo-700">Clear all filters</button>
                                        </td>
                                    </tr>
                                ) : filteredProducts.map(product => {
                                    const vendor = product.vendorId ? vendorMap[product.vendorId] : null;
                                    return (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Product */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="border border-gray-200 rounded-xl p-1 bg-gray-50 flex-shrink-0">
                                                        <img src={product.image?.[0] || 'https://placehold.co/56x56?text=?'} alt=""
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                            onError={e => e.target.src = 'https://placehold.co/56x56?text=?'} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-800 truncate max-w-[160px]">{product.name}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3">
                                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">{product.category}</span>
                                            </td>

                                            {/* Shop/Seller */}
                                            <td className="px-4 py-3">
                                                {product.vendorId && vendor ? (
                                                    <div className="flex items-center gap-2">
                                                        {vendor.shopLogo
                                                            ? <img src={vendor.shopLogo} alt="" className="w-7 h-7 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                                                            : <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">{vendor.shopName?.[0]}</div>
                                                        }
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-700 truncate max-w-[100px]">{vendor.shopName || product.vendorShopName}</p>
                                                            <p className="text-[10px] font-mono text-indigo-500">{vendor.sellerId}</p>
                                                        </div>
                                                    </div>
                                                ) : product.vendorId ? (
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-600 truncate max-w-[110px]">{product.vendorShopName || 'Vendor'}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{product.vendorId?.slice(-6)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">👑 Admin</span>
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <p className="font-bold text-gray-800">{currency}{product.offerPrice}</p>
                                                {product.price > product.offerPrice && (
                                                    <p className="text-xs text-gray-400 line-through">{currency}{product.price}</p>
                                                )}
                                            </td>

                                            {/* Stock Qty */}
                                            <td className="px-4 py-3">
                                                {editingStock === product._id ? (
                                                    <div className="flex items-center gap-1">
                                                        <input type="number" min="0" value={stockValue}
                                                            onChange={e => setStockValue(e.target.value)}
                                                            className="w-16 border border-indigo-400 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                            autoFocus
                                                            onKeyDown={e => { if (e.key === 'Enter') saveStock(product._id); if (e.key === 'Escape') setEditingStock(null); }} />
                                                        <button onClick={() => saveStock(product._id)} className="w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-green-600 transition-all">✓</button>
                                                        <button onClick={() => setEditingStock(null)} className="w-6 h-6 bg-red-500 text-white rounded-md flex items-center justify-center text-xs hover:bg-red-600 transition-all">✕</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {getStockBadge(product)}
                                                        <button onClick={() => startEditStock(product)}
                                                            className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded-lg hover:bg-indigo-100 font-semibold transition-all">
                                                            ✏️
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Toggle */}
                                            <td className="px-4 py-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer"
                                                        checked={product.inStock}
                                                        onChange={() => toggleStock(product._id, !product.inStock)} />
                                                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                                                </label>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <button onClick={() => deleteProduct(product._id, product.name)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 hover:text-red-700 rounded-xl text-xs font-bold transition-all">
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductList;
