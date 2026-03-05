import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { categories } from '../../assets/assets';

const VendorAddProduct = () => {
    const { vendor } = useOutletContext() || {};
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState(100);
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setName(''); setDescription(''); setCategory('');
        setPrice(''); setOfferPrice(''); setStockQuantity(100);
        setManufacturingDate(''); setExpiryDate(''); setFiles([]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!files.length) return toast.error('Please upload at least one product image');
        setLoading(true);
        try {
            const productData = {
                name, description: description.split('\n'), category,
                price, offerPrice,
                stockQuantity: Number(stockQuantity) || 100,
                manufacturingDate: manufacturingDate || null,
                expiryDate: expiryDate || null
            };
            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            files.forEach(f => { if (f) formData.append('images', f); });

            // Use dedicated vendor endpoint — ensures vendorId is always saved correctly
            const { data } = await axios.post('/api/seller/vendor-add-product', formData);
            if (data.success) {
                toast.success('Product added successfully! 🎉');
                resetForm();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">➕ Add New Product</h1>
                <p className="text-gray-400 text-sm mt-1">Fill in the details to list a product in <strong>{vendor?.shopName}</strong></p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Product Images */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">🖼️ Product Images</h2>
                    <div className="flex flex-wrap gap-3">
                        {Array(4).fill('').map((_, i) => (
                            <label key={i} htmlFor={`vendor-img-${i}`} className="cursor-pointer">
                                <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${files[i] ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'}`}>
                                    {files[i]
                                        ? <img src={URL.createObjectURL(files[i])} alt="" className="w-full h-full object-cover" />
                                        : <div className="text-center"><span className="text-2xl">📷</span><p className="text-xs text-gray-400 mt-1">Photo {i + 1}</p></div>
                                    }
                                </div>
                                <input type="file" id={`vendor-img-${i}`} accept="image/*" hidden
                                    onChange={(e) => {
                                        const updated = [...files];
                                        updated[i] = e.target.files[0];
                                        setFiles(updated);
                                    }}
                                />
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">First image will be the main product photo</p>
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">📝 Product Details</h2>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Product Name <span className="text-red-500">*</span></label>
                        <input value={name} onChange={e => setName(e.target.value)} required
                            placeholder="e.g. Fresh Amul Milk 500ml"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                            placeholder="Describe the product (each line = one bullet point)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 resize-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                        <select value={category} onChange={e => setCategory(e.target.value)} required
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50">
                            <option value="">Select Category</option>
                            {categories.map((c, i) => <option key={i} value={c.path}>{c.path}</option>)}
                        </select>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">💰 Pricing & Stock</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">MRP Price (₹) <span className="text-red-500">*</span></label>
                            <input value={price} onChange={e => setPrice(e.target.value)} type="number" required
                                placeholder="100" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
                            <input value={offerPrice} onChange={e => setOfferPrice(e.target.value)} type="number" required
                                placeholder="85" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Stock Qty <span className="text-red-500">*</span></label>
                            <input value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} type="number" min="0" required
                                placeholder="100" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                    </div>
                    {price && offerPrice && Number(price) > Number(offerPrice) && (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 font-medium">
                            ✅ Discount: {Math.round(((price - offerPrice) / price) * 100)}% off ({`₹${price - offerPrice} savings`})
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">📅 Manufacturing & Expiry</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Mfg. Date</label>
                            <input value={manufacturingDate} onChange={e => setManufacturingDate(e.target.value)} type="date"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Expiry Date</label>
                            <input value={expiryDate} onChange={e => setExpiryDate(e.target.value)} type="date"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all disabled:opacity-60 text-lg flex items-center justify-center gap-3">
                    {loading ? <span className="animate-spin">⌛</span> : '🚀'}
                    {loading ? 'Adding Product...' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default VendorAddProduct;
