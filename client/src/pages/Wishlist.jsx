import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { axios, navigate, user } = useAppContext();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            navigate('/');
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const { data } = await axios.post('/api/wishlist/get', { userId: user._id });
            if (data.success) {
                setWishlist(data.wishlist);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const { data } = await axios.post('/api/wishlist/remove', {
                userId: user._id,
                productId
            });
            if (data.success) {
                toast.success(data.message);
                fetchWishlist(); // Refresh wishlist
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">💖 My Wishlist</h1>
                <p className="text-gray-600">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
            </div>

            {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-8xl mb-6">💔</div>
                    <h2 className="text-2xl font-medium text-gray-700 mb-2">Your Wishlist is Empty</h2>
                    <p className="text-gray-500 mb-8">Save your favorite products here!</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {wishlist.map((product) => (
                            <div key={product._id} className="relative">
                                <ProductCard product={product} />
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                                    title="Remove from wishlist"
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/products')}
                            className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary/10 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Wishlist;
