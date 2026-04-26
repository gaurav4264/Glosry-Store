import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ScanList = () => {
    const { axios, getCartCount, fetchCart, addToCart, cartItems, setCartItems } = useAppContext();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResults(null); // reset results on new image
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const handleScan = async () => {
        if (!image) {
            toast.error("Please select an image first!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const { data } = await axios.post('/api/scan/list', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                setResults(data.items);
                toast.success("List analyzed successfully!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        setAddingToCart(productId);
        try {
            addToCart(productId);
            // Small delay for button UI feedback
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(null);
        }
    };

    const addAllToCart = () => {
        const matchedItems = results.filter(r => r.matchedProduct);
        if (matchedItems.length === 0) return;

        setLoading(true);
        try {
            let cartData = structuredClone(cartItems);
            let addedCount = 0;

            for (const item of matchedItems) {
                const itemId = item.matchedProduct._id;
                if (cartData[itemId]) {
                    cartData[itemId] += 1;
                } else {
                    cartData[itemId] = 1;
                }
                addedCount++;
            }

            setCartItems(cartData);
            toast.success(`Added ${addedCount} items to your cart!`);
        } catch (error) {
            toast.error("Some items failed to add.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                    📝 Scan Grocery List
                </h1>
                <p className="text-gray-500 max-w-xl mx-auto md:text-lg">
                    Upload a photo of your handwritten or printed grocery list. Our AI will analyze it and instantly find the products for you!
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">

                {/* Upload Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">

                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="w-full h-80 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                        >
                            <span className="text-5xl mb-4">📸</span>
                            <h3 className="text-lg font-semibold text-gray-700">Tap to Upload Image</h3>
                            <p className="text-sm text-gray-400 mt-2">Supports JPG, PNG</p>
                        </div>
                    ) : (
                        <div className="w-full relative group">
                            <img
                                src={preview}
                                alt="Grocery List Preview"
                                className="w-full h-80 object-cover rounded-2xl border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium text-sm shadow-lg hover:scale-105 transition-transform"
                                >
                                    Choose Different Photo
                                </button>
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        onClick={handleScan}
                        disabled={!image || loading}
                        className={`mt-6 w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${!image || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dull shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Parsing List...
                            </>
                        ) : (
                            <>✨ Analyze List</>
                        )}
                    </button>
                    {!results && !loading && preview && (
                        <p className="text-xs text-gray-400 mt-3">Click Analyze to detect items using AI.</p>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px]">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                        <span>Detected Items</span>
                        {results && results.some(r => r.matchedProduct) && (
                            <button
                                onClick={addAllToCart}
                                disabled={loading}
                                className="text-sm font-semibold bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                🛒 Add All Available
                            </button>
                        )}
                    </h2>

                    {!results ? (
                        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
                            <span className="text-4xl mb-3 opacity-50">🤖</span>
                            <p>Upload a list and analyze it to see your results here.</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
                            <span className="text-4xl mb-3 opacity-50">❓</span>
                            <p>No items could be read clearly.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {results.map((item, index) => (
                                <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors group ${
                                    item.matchedProduct
                                        ? 'border-gray-100 hover:border-primary/30 bg-gray-50/50'
                                        : 'border-red-100 bg-red-50/40'
                                }`}>

                                    <div className="flex items-center gap-4">
                                        {/* Product Image */}
                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100 flex-shrink-0">
                                            {item.matchedProduct ? (
                                                <img
                                                    src={item.matchedProduct.image[0]}
                                                    alt={item.matchedProduct.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='🛒'; }}
                                                />
                                            ) : (
                                                <span className="text-2xl">❌</span>
                                            )}
                                        </div>

                                        <div>
                                            {/* Detected label */}
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                                                🤖 Detected: <span className="text-gray-500">{item.rawName}</span>
                                            </p>
                                            {/* Store match */}
                                            {item.matchedProduct ? (
                                                <>
                                                    <p className="font-bold text-gray-800 text-sm leading-tight">
                                                        {item.matchedProduct.name}
                                                    </p>
                                                    <p className="text-xs text-primary font-bold mt-0.5">₹{item.matchedProduct.offerPrice}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-gray-500 text-sm leading-tight">{item.rawName}</p>
                                                    <p className="text-xs text-red-400 font-medium mt-0.5">Not found in store</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {item.matchedProduct && (
                                        <button
                                            onClick={() => handleAddToCart(item.matchedProduct._id)}
                                            disabled={addingToCart === item.matchedProduct._id}
                                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200 text-gray-500 hover:text-primary hover:border-primary transition-colors disabled:opacity-50 flex-shrink-0"
                                        >
                                            {addingToCart === item.matchedProduct._id ? (
                                                <span className="animate-spin aspect-square border-2 border-primary border-t-transparent rounded-full w-4 h-4"></span>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            )}
                                        </button>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ScanList;
