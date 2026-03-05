import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { categories } from '../../assets/assets';

const VendorProducts = () => {
    const { vendor } = useOutletContext() || {};
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStock, setFilterStock] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null); // for review modal

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/seller/vendor-products');
            if (data.success) setProducts(data.products);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const deleteProduct = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            const { data } = await axios.post('/api/seller/vendor-delete-product', { id });
            if (data.success) { toast.success('Product deleted!'); setProducts(prev => prev.filter(p => p._id !== id)); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
        finally { setDeletingId(null); }
    };

    const productCategories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))].sort(), [products]);

    const filtered = useMemo(() => {
        let r = [...products];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
        }
        if (filterCategory !== 'all') r = r.filter(p => p.category === filterCategory);
        if (filterStock === 'inStock') r = r.filter(p => p.inStock && (p.stockQuantity || 0) > 0);
        else if (filterStock === 'outOfStock') r = r.filter(p => !p.inStock || (p.stockQuantity || 0) === 0);
        else if (filterStock === 'lowStock') r = r.filter(p => p.inStock && (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10);
        if (sortBy === 'priceAsc') r.sort((a, b) => (a.offerPrice || 0) - (b.offerPrice || 0));
        else if (sortBy === 'priceDesc') r.sort((a, b) => (b.offerPrice || 0) - (a.offerPrice || 0));
        else if (sortBy === 'nameAsc') r.sort((a, b) => a.name?.localeCompare(b.name));
        else r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return r;
    }, [products, searchQuery, filterCategory, filterStock, sortBy]);

    const getStockBadge = (p) => {
        const qty = p.stockQuantity || 0;
        if (!p.inStock || qty === 0) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Out of Stock</span>;
        if (qty <= 10) return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">⚠️ {qty} left</span>;
        return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">{qty} units</span>;
    };

    const avgRating = (p) => {
        if (!p.ratings?.length) return '0.0';
        const avg = p.ratings.reduce((s, r) => s + r.rating, 0) / p.ratings.length;
        return avg.toFixed(1);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📦 My Products <span className="text-base text-gray-400 font-normal">({products.length})</span></h1>
                <a href="/vendor/add-product" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    ➕ Add Product
                </a>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center flex-1 min-w-[180px] border border-gray-200 rounded-xl bg-white px-3 py-2 gap-2">
                    <span>🔍</span>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search products..." className="w-full text-sm outline-none bg-transparent placeholder-gray-400" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-300 hover:text-gray-500">✕</button>}
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none min-w-[140px]">
                    <option value="all">All Categories</option>
                    {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="all">All Stock</option>
                    <option value="inStock">✅ In Stock</option>
                    <option value="outOfStock">❌ Out of Stock</option>
                    <option value="lowStock">⚠️ Low Stock</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="newest">Newest First</option>
                    <option value="nameAsc">Name A→Z</option>
                    <option value="priceAsc">Price: Low→High</option>
                    <option value="priceDesc">Price: High→Low</option>
                </select>
            </div>

            <p className="text-sm text-gray-400 mb-4">Showing <strong className="text-gray-700">{filtered.length}</strong> of {products.length} products</p>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400">No products found</p>
                    <a href="/vendor/add-product" className="inline-block mt-3 text-indigo-500 text-sm hover:underline">Add your first product →</a>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map(product => (
                        <div key={product._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4 hover:shadow-md transition group">
                            <img
                                src={product.image?.[0] || 'https://placehold.co/80x80?text=?'}
                                alt={product.name}
                                className="w-20 h-20 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                                onError={e => e.target.src = 'https://placehold.co/80x80?text=?'}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 truncate">{product.name}</p>
                                <p className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">{product.category}</p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className="font-bold text-indigo-600">₹{product.offerPrice}</span>
                                    <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                    {getStockBadge(product)}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                        ⭐ {avgRating(product)} ({product.ratings?.length || 0})
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => setSelectedProduct(product)}
                                        className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition">
                                        💬 Reviews ({product.ratings?.length || 0})
                                    </button>
                                    <button onClick={() => deleteProduct(product._id, product.name)}
                                        disabled={deletingId === product._id}
                                        className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg font-semibold hover:bg-red-100 transition disabled:opacity-50">
                                        {deletingId === product._id ? '...' : '🗑️ Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-gray-800">⭐ Customer Reviews</h2>
                                <p className="text-sm text-gray-400">{selectedProduct.name}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <div className="p-5">
                            {!selectedProduct.ratings?.length ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p className="text-3xl mb-2">💬</p>
                                    <p>No reviews yet for this product</p>
                                </div>
                            ) : (
                                <>
                                    {/* Avg rating */}
                                    <div className="bg-indigo-50 rounded-xl p-4 mb-5 flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-4xl font-bold text-indigo-600">{avgRating(selectedProduct)}</p>
                                            <div className="flex justify-center gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <span key={s} className={`text-lg ${s <= Math.round(parseFloat(avgRating(selectedProduct))) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = selectedProduct.ratings.filter(r => Math.round(r.rating) === star).length;
                                                const pct = Math.round((count / selectedProduct.ratings.length) * 100);
                                                return (
                                                    <div key={star} className="flex items-center gap-2 text-xs">
                                                        <span className="w-4 text-right text-gray-500">{star}</span>
                                                        <span className="text-yellow-400">★</span>
                                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                            <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="w-6 text-gray-400">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Individual reviews */}
                                    <div className="space-y-3">
                                        {selectedProduct.ratings.map((r, i) => (
                                            <div key={i} className="border border-gray-100 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                                                    </div>
                                                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProducts;
