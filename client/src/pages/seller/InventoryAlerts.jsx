import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const InventoryAlerts = () => {
    const { axios } = useAppContext();
    const [alerts, setAlerts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const { data } = await axios.get('/api/inventory/alerts');
            if (data.success) {
                setAlerts(data.alerts);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleQuickRestock = async (productId) => {
        const quantity = prompt('Enter quantity to add:');
        if (!quantity || isNaN(quantity)) return;

        try {
            const { data } = await axios.post('/api/inventory/update', {
                productId,
                quantity: Number(quantity)
            });

            if (data.success) {
                toast.success('Stock updated successfully');
                fetchAlerts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div className="p-6">Loading alerts...</div>;
    }

    if (!alerts || (alerts.lowStock.length === 0 && alerts.outOfStock.length === 0)) {
        return (
            <div className="p-6 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-600">All Good!</h3>
                <p className="text-gray-600">No inventory alerts at this time</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Inventory Alerts</h2>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    {alerts.totalAlerts} {alerts.totalAlerts === 1 ? 'Alert' : 'Alerts'}
                </span>
            </div>

            {/* Out of Stock - Critical */}
            {alerts.outOfStock.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🔴</span>
                        Out of Stock ({alerts.outOfStock.length})
                    </h3>
                    <div className="space-y-3">
                        {alerts.outOfStock.map(product => (
                            <div key={product._id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={product.image[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-600">Stock: {product.stockQuantity}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleQuickRestock(product._id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                                >
                                    Restock Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Low Stock - Warning */}
            {alerts.lowStock.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Low Stock ({alerts.lowStock.length})
                    </h3>
                    <div className="space-y-3">
                        {alerts.lowStock.map(product => (
                            <div key={product._id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={product.image[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Stock: {product.stockQuantity} / Threshold: {product.lowStockThreshold}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleQuickRestock(product._id)}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium"
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryAlerts;
