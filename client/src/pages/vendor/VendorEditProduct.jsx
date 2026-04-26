import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { categories } from '../../assets/assets';

const VendorEditProduct = () => {
    const { vendor } = useOutletContext() || {};
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    // For images: 'existingImages' holds URLs of images already on server
    // 'newFiles' holds new File objects chosen by user.
    // If user changes images, they must upload new ones to replace the old ones.
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                // To save building a specific "get-single-vendor-product" route, 
                // we can just fetch all and find, since we are doing vendor dashboard locally.
                const { data } = await axios.get('/api/seller/vendor-products');
                if (data.success) {
                    const prod = data.products.find(p => p._id === id);
                    if (prod) {
                        setName(prod.name || '');
                        setDescription(prod.description ? prod.description.join('\n') : '');
                        setCategory(prod.category || '');
                        setPrice(prod.price || '');
                        setOfferPrice(prod.offerPrice || '');
                        setStockQuantity(prod.stockQuantity ?? '');

                        if (prod.manufacturingDate) setManufacturingDate(prod.manufacturingDate.substring(0, 10));
                        if (prod.expiryDate) setExpiryDate(prod.expiryDate.substring(0, 10));

                        setExistingImages(prod.image || []);
                        setNewFiles(new Array(4).fill(null));
                    } else {
                        toast.error('Product not found');
                        navigate('/vendor/products');
                    }
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [id, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();

        // Validation: At least one existing image OR one new file must be present
        const hasExisting = existingImages.some(img => img);
        const hasNew = newFiles.some(file => file);
        if (!hasExisting && !hasNew) {
            return toast.error('Please provide at least one product image');
        }

        setSaving(true);
        try {
            const productData = {
                id,
                name,
                description: description.split('\n').filter(line => line.trim() !== ''),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
                stockQuantity: Number(stockQuantity),
                manufacturingDate: manufacturingDate || null,
                expiryDate: expiryDate || null,
                // Pass existing images array so backend knows what to keep if not replaced
                existingImages: existingImages
            };

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));

            // Append new files
            newFiles.forEach((file, index) => {
                if (file) {
                    formData.append('images', file);
                    formData.append(`imageIndex_${index}`, 'true'); // track which index this file belongs to
                }
            });

            // Use the update endpoint built earlier, but upgraded to support upload
            const { data } = await axios.post('/api/seller/vendor-update-product', formData);
            if (data.success) {
                toast.success('Product updated successfully! 🎉');
                navigate('/vendor/products');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle image selection
    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const updatedFiles = [...newFiles];
            updatedFiles[index] = file;
            setNewFiles(updatedFiles);

            // If they upload a new file at an index where there was an existing image, we clear the existing view
            const updatedExisting = [...existingImages];
            updatedExisting[index] = '';
            setExistingImages(updatedExisting);
        }
    };

    if (loading) {
        return <div className="p-10 text-center"><span className="animate-pulse">Loading product details...</span></div>;
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">✏️ Edit Product</h1>
                    <p className="text-gray-400 text-sm mt-1">Update details for <strong>{name}</strong></p>
                </div>
                <button onClick={() => navigate('/vendor/products')} className="text-sm text-gray-500 hover:text-gray-800 underline">
                    Cancel & Back
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Product Images */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">🖼️ Product Images</h2>
                    <div className="flex flex-wrap gap-3">
                        {Array(4).fill('').map((_, i) => (
                            <label key={i} htmlFor={`vendor-img-${i}`} className="cursor-pointer">
                                <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${(newFiles[i] || existingImages[i]) ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'}`}>
                                    {newFiles[i] ? (
                                        <img src={URL.createObjectURL(newFiles[i])} alt="" className="w-full h-full object-cover" />
                                    ) : existingImages[i] ? (
                                        <img src={existingImages[i]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center"><span className="text-2xl">📷</span><p className="text-xs text-gray-400 mt-1">Photo {i + 1}</p></div>
                                    )}
                                </div>
                                <input type="file" id={`vendor-img-${i}`} accept="image/*" hidden onChange={(e) => handleImageChange(i, e)} />
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Click on a photo to replace it.</p>
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
                            <input value={price} onChange={e => setPrice(e.target.value)} type="number" required min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
                            <input value={offerPrice} onChange={e => setOfferPrice(e.target.value)} type="number" required min="0"
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Stock Qty <span className="text-red-500">*</span></label>
                            <input value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} type="number" min="0" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50" />
                        </div>
                    </div>
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
                <button type="submit" disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all disabled:opacity-60 text-lg flex items-center justify-center gap-3">
                    {saving ? <span className="animate-spin">⌛</span> : '💾'}
                    {saving ? 'Saving Changes...' : 'Save Product Updates'}
                </button>
            </form>
        </div>
    );
};

export default VendorEditProduct;
