import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';


const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems, navigate, user, axios, setUser } = useAppContext();
    const [inWishlist, setInWishlist] = useState(false);

    useEffect(() => {
        if (user && user.wishlist) {
            setInWishlist(user.wishlist.includes(product._id));
        }
    }, [user, product._id]);

    const toggleWishlist = async (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }

        try {
            const { data } = await axios.post('/api/wishlist/toggle', {
                userId: user._id,
                productId: product._id
            });
            if (data.success) {
                setInWishlist(data.inWishlist);
                toast.success(data.message);

                // Update user context with new wishlist
                const updatedUser = { ...user };
                if (data.inWishlist) {
                    updatedUser.wishlist = [...(user.wishlist || []), product._id];
                } else {
                    updatedUser.wishlist = (user.wishlist || []).filter(id => id !== product._id);
                }
                setUser(updatedUser);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const stockQty = Number(product.stockQuantity);
    const stockQuantity = isNaN(stockQty) ? 0 : stockQty;
    const isOutOfStock = !product.inStock || stockQuantity === 0;
    const isLowStock = product.inStock && stockQuantity > 0 && stockQuantity <= 10;

    return product && (
        <div onClick={() => { navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0) }} className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full relative">
            {/* Wishlist Heart Icon */}
            <button
                onClick={toggleWishlist}
                className="absolute top-3 right-3 z-10 bg-white/90 p-2 rounded-full shadow-md hover:scale-110 transition"
            >
                {inWishlist ? '❤️' : '🤍'}
            </button>

            {/* Out of Stock Badge */}
            {isOutOfStock && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    OUT OF STOCK
                </div>
            )}
            {/* Low Stock Warning — shown only when stock between 1 and 10 */}
            {isLowStock && (
                <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Only {stockQuantity} left!
                </div>
            )}

            <div className="group cursor-pointer flex items-center justify-center px-2">
                <img
                    className={`group-hover:scale-105 transition max-w-26 md:max-w-36 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                    src={product.image?.[0] || 'https://placehold.co/150x150?text=No+Image'}
                    alt={product.name}
                    onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                />
            </div>
            <div className="text-gray-500/60 text-sm">
                <p>{product.category}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                <div className="flex items-center gap-0.5">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <p className="font-bold">
                            {(product.ratings?.length > 0) ? (product.ratings.reduce((acc, curr) => acc + curr.rating, 0) / product.ratings.length).toFixed(1) : '0.0'}
                        </p>
                        <img src={assets.star_icon} className="md:w-4 w-3.5" />
                    </div>
                    <p className="text-gray-500">({product.ratings?.length || 0})</p>
                </div>
                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{product.offerPrice}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price}</span>
                    </p>
                    <div onClick={(e) => { e.stopPropagation(); }} className="text-primary">
                        {isOutOfStock ? (
                            <button className="bg-gray-300 text-gray-600 md:w-[80px] w-[64px] h-[34px] rounded cursor-not-allowed" disabled>
                                Sold Out
                            </button>
                        ) : !cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded cursor-pointer" onClick={() => addToCart(product._id)} >
                                <img src={assets.cart_icon} alt="cart_icon" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button onClick={() => { removeFromCart(product._id) }} className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() => { addToCart(product._id) }} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;