import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ShopsByCategory = () => {
    const { axios } = useAppContext();
    const navigate = useNavigate();
    const [shops, setShops] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Fresh Fruits');
    const [loading, setLoading] = useState(false);

    const categories = [
        'Fresh Fruits',
        'Organic Veggies',
        'Dairy Products',
        'Bakery & Breads',
        'Instant Food',
        'Cold Drinks',
        'Grains & Cereals'
    ];

    const fetchShopsByCategory = async (category) => {
        setLoading(true);
        try {
            // Try to get user's location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const { data } = await axios.post('/api/shop/category', {
                            lat: latitude,
                            lng: longitude,
                            category
                        });

                        if (data.success) {
                            setShops(data.shops);
                            if (data.shops.length === 0) {
                                toast.error(`No shops selling ${category} found within 30km`);
                            }
                        } else {
                            toast.error(data.message);
                        }
                        setLoading(false);
                    },
                    () => {
                        // Fallback to default location (Patna)
                        fetchWithDefaultLocation(category);
                    }
                );
            } else {
                fetchWithDefaultLocation(category);
            }
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const fetchWithDefaultLocation = async (category) => {
        try {
            const { data } = await axios.post('/api/shop/category', {
                lat: 25.5941,
                lng: 85.1376,
                category
            });

            if (data.success) {
                setShops(data.shops);
                if (data.shops.length === 0) {
                    toast.error(`No shops selling ${category} found within 30km`);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShopsByCategory(selectedCategory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    return (
        <div className="pt-14 container mx-auto px-4 mb-20">
            <h2 className="text-2xl font-bold mb-6">Find Shops by Category (Within 30km)</h2>

            {/* Category Filter */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Category:</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center text-gray-500">Loading shops...</div>
            ) : shops.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <p>No shops found selling <strong>{selectedCategory}</strong> within 30km.</p>
                    <p className="text-sm mt-2">Try selecting a different category.</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-4">
                        Found <strong>{shops.length}</strong> shop(s) selling <strong>{selectedCategory}</strong>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <div key={shop._id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                                <h3 className="font-semibold text-lg mb-2">{shop.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{shop.address}</p>

                                {/* Categories */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {shop.categories.map((cat, idx) => (
                                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {cat}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400 mb-3">
                                    Lat: {shop.location.coordinates[1].toFixed(4)},
                                    Lng: {shop.location.coordinates[0].toFixed(4)}
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="flex-1 bg-primary text-white py-2 rounded text-sm hover:bg-primary/90"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopsByCategory;
