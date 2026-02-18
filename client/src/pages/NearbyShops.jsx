import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const NearbyShops = () => {
    const { axios } = useAppContext();
    const [shops, setShops] = useState([]);

    const fetchAllShops = async () => {
        try {
            const { data } = await axios.get('/api/shop/all');
            if (data.success) {
                setShops(data.shops);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Seed shops for demo if none exist
    const seedShops = async () => {
        const { data } = await axios.post('/api/shop/seed');
        if (data.success) {
            toast.success(data.message);
            fetchAllShops();
        }
    }

    useEffect(() => {
        fetchAllShops();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="pt-14 container mx-auto px-4 mb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Shops ({shops.length})</h2>
                <button onClick={seedShops} className="text-sm bg-gray-200 px-3 py-1 rounded">Reset/Seed 20 Shops</button>
            </div>

            {shops.length === 0 ? (
                <div className="text-center text-gray-500">No shops found. Click "Reset/Seed 20 Shops" to create shops.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop, index) => (
                        <div key={index} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                            <h3 className="font-semibold text-lg">{shop.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{shop.address}</p>

                            {/* Categories */}
                            {shop.categories && shop.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {shop.categories.map((cat, idx) => (
                                        <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-gray-400">
                                Lat: {shop.location.coordinates[1].toFixed(4)},
                                Lng: {shop.location.coordinates[0].toFixed(4)}
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button className="flex-1 bg-primary text-white py-2 rounded text-sm">Visit Shop</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NearbyShops;
