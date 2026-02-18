import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from './ProductCard';

const Recommendations = ({ productId = null, userId = null }) => {
    const { axios } = useAppContext();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchRecommendations();
    }, [productId, userId]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            let data;

            if (productId) {
                // Fetch "Frequently Bought Together" for product page
                const response = await axios.get(`/api/recommend/frequently-bought/${productId}`);
                data = response.data;
                setReason('Frequently Bought Together');
            } else {
                // Fetch personalized or trending recommendations for homepage
                try {
                    const response = await axios.post('/api/recommend/personal');
                    data = response.data;
                    setReason(data.reason || 'Recommended for You');
                } catch (error) {
                    // If user not logged in, show trending
                    const response = await axios.get('/api/recommend/trending');
                    data = response.data;
                    setRecommendations(data.trending || []);
                    setReason('Trending Products');
                    setLoading(false);
                    return;
                }
            }

            if (data.success) {
                setRecommendations(data.recommendations || data.trending || []);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="my-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="my-10">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">{reason}</h2>
                {productId && <span className="text-2xl">✨</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendations.slice(0, 5).map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>

            {!productId && recommendations.length > 5 && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => {/* Navigate to all products */ }}
                        className="text-primary hover:underline font-medium"
                    >
                        View All Recommendations →
                    </button>
                </div>
            )}
        </div>
    );
};

export default Recommendations;
