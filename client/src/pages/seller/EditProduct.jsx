import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios, products, fetchProducts } = useAppContext();

    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [shopId, setShopId] = useState('');
    const [manufacturingDate, setManufacturingDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [stockQuantity, setStockQuantity] = useState(100);
    const [shops, setShops] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchShops();
        // We find the product from the already fetched Products context
        if (products && products.length > 0) {
            const prod = products.find(p => p._id === id);
            if (prod) {
                setName(prod.name || '');
                setDescription(prod.description ? prod.description.join('\n') : '');
                setCategory(prod.category || '');
                setPrice(prod.price || '');
                setOfferPrice(prod.offerPrice || '');
                setShopId(prod.shopId || '');
                setStockQuantity(prod.stockQuantity ?? 100);

                if (prod.manufacturingDate) setManufacturingDate(prod.manufacturingDate.substring(0, 10));
                if (prod.expiryDate) setExpiryDate(prod.expiryDate.substring(0, 10));

                setExistingImages(prod.image || []);
                setNewFiles(new Array(4).fill(null));
                setLoading(false);
            } else {
                // If not found in context, might need to wait or it doesn't exist
                toast.error('Product not found in current list');
                setLoading(false);
            }
        }
    }, [id, products]);

    const fetchShops = async () => {
        try {
            const { data } = await axios.get('/api/shop/all');
            if (data.success) {
                setShops(data.shops);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const updatedFiles = [...newFiles];
            updatedFiles[index] = file;
            setNewFiles(updatedFiles);

            const updatedExisting = [...existingImages];
            updatedExisting[index] = '';
            setExistingImages(updatedExisting);
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

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
                description: description.split('\n').filter(l => l.trim() !== ''),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
                stockQuantity: Number(stockQuantity) || 0,
                shopId: shopId || null,
                manufacturingDate: manufacturingDate || null,
                expiryDate: expiryDate || null,
                existingImages: existingImages
            };

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));

            newFiles.forEach((file, index) => {
                if (file) {
                    formData.append('images', file);
                    formData.append(`imageIndex_${index}`, 'true');
                }
            });

            // Using new update endpoint for admin
            const { data } = await axios.post('/api/product/update', formData);

            if (data.success) {
                toast.success('Product updated successfully!');
                fetchProducts(); // Refresh global products context
                navigate('/seller/product-list');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading product details...</div>;

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50">
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">✏️ Edit Product</h1>
                        <p className="text-gray-500 text-sm mt-1">Update details for <strong>{name}</strong></p>
                    </div>
                    <button onClick={() => navigate('/seller/product-list')} className="text-sm font-semibold text-gray-500 hover:text-gray-800">
                        ✕ Cancel
                    </button>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* Images Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Product Images</h2>
                        <div className="flex flex-wrap items-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                            {Array(4).fill('').map((_, index) => (
                                <label key={index} htmlFor={`image${index}`} className="cursor-pointer group relative">
                                    <input onChange={(e) => handleImageChange(index, e)} type="file" id={`image${index}`} accept="image/*" hidden />
                                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center group-hover:border-indigo-400 group-hover:shadow-md transition-all">
                                        {newFiles[index] ? (
                                            <img className="w-full h-full object-cover" src={URL.createObjectURL(newFiles[index])} alt="" />
                                        ) : existingImages[index] ? (
                                            <img className="w-full h-full object-cover" src={existingImages[index]} alt="" />
                                        ) : (
                                            <img className="w-8 opacity-40" src={assets.upload_area} alt="" />
                                        )}
                                    </div>
                                    <div className="absolute inset-x-0 -bottom-6 text-center text-[10px] text-gray-400 group-hover:text-indigo-600 transition-colors">
                                        {(newFiles[index] || existingImages[index]) ? 'Replace' : 'Upload'}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-700">Basic Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Product Name *</label>
                                <input onChange={(e) => setName(e.target.value)} value={name} type="text"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Category *</label>
                                <select onChange={(e) => setCategory(e.target.value)} value={category} required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all">
                                    <option value="">Select Category</option>
                                    {categories.map((item, index) => <option key={index} value={item.path}>{item.path}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} rows={3}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none" placeholder="Bullet points..."></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Assign to Shop</label>
                            <select onChange={(e) => setShopId(e.target.value)} value={shopId}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all">
                                <option value="">👑 Admin Product (No Vendor)</option>
                                {shops.map((shop) => <option key={shop._id} value={shop._id}>{shop.name} - {shop.address}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-700">Pricing & Inventory</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Original Price (₹) *</label>
                                <input onChange={(e) => setPrice(e.target.value)} value={price} type="number" min="0" required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Offer Price (₹) *</label>
                                <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} type="number" min="0" required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Stock Quantity *</label>
                                <input onChange={(e) => setStockQuantity(e.target.value)} value={stockQuantity} type="number" min="0" required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-700">Dates (Optional)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Manufacturing Date</label>
                                <input onChange={(e) => setManufacturingDate(e.target.value)} value={manufacturingDate} type="date"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Expiry Date</label>
                                <input onChange={(e) => setExpiryDate(e.target.value)} value={expiryDate} type="date"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white" />
                            </div>
                        </div>
                    </div>

                    <div className="pb-10">
                        <button type="submit" disabled={saving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                            {saving ? 'Saving Changes...' : 'Save Product Updates'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;
