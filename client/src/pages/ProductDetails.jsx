import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import Recommendations from "../components/Recommendations";
import toast from "react-hot-toast";

const ProductDetails = () => {

    const { products, navigate, currency, addToCart, user, axios, fetchProducts } = useAppContext()
    const { id } = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    const product = products.find((item) => item._id === id);

    useEffect(() => {
        if (products.length > 0) {
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item) => product.category === item.category)
            setRelatedProducts(productsCopy.slice(0, 5))
        }
    }, [products])

    useEffect(() => {
        setThumbnail(product?.image[0] ? product.image[0] : null)

        // Recently Viewed Logic
        if (product) {
            let viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
            if (!viewed.includes(product._id)) {
                viewed.unshift(product._id);
                if (viewed.length > 5) viewed.pop(); // Keep max 5
                localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
            }
        }
    }, [product])


    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const submitRating = async () => {
        if (!user) {
            toast.error("Please login to rate");
            return;
        }
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please write a comment");
            return;
        }
        try {
            const { data } = await axios.post('/api/product/rating', { userId: user._id, productId: product._id, rating, comment });
            if (data.success) {
                toast.success(data.message);
                setRating(0);
                setComment("");
                setIsEditing(false);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const deleteReview = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your review?");
        if (!confirmDelete) return;

        try {
            const { data } = await axios.post('/api/product/rating/delete', { userId: user._id, productId: product._id });
            if (data.success) {
                toast.success(data.message);
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const startEdit = (review) => {
        setRating(review.rating);
        setComment(review.comment);
        setIsEditing(true);
    }

    const cancelEdit = () => {
        setRating(0);
        setComment("");
        setIsEditing(false);
    }

    const averageRating = product?.ratings?.length > 0
        ? (product.ratings.reduce((acc, curr) => acc + curr.rating, 0) / product.ratings.length).toFixed(1)
        : 0;

    // Check if current user already reviewed
    const userReview = user && product?.ratings?.find(r => r.userId === user._id);

    return product && (
        <div className="mt-12">
            <p>
                <Link to={"/"}>Home</Link> /
                <Link to={"/products"}> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

            <div className="flex flex-col md:flex-row gap-16 mt-4">
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <p className="font-bold">{averageRating}</p>
                            <img src={assets.star_icon} className="w-3.5" />
                        </div>
                        <p className="text-base ml-2">({product.ratings?.length || 0} Ratings)</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        {/* Low Stock Warning — shown only when stock ≤ 10 */}
                        {(() => {
                            const sqty = Number(product.stockQuantity);
                            const sq = isNaN(sqty) ? 0 : sqty;
                            return product.inStock && sq > 0 && sq <= 10 ? (
                                <div className="w-full mb-[-28px]">
                                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-4 py-2.5 rounded-lg">
                                        <span className="text-base">🔥</span>
                                        <span>Only <strong>{sq}</strong> item{sq > 1 ? 's' : ''} left! Order soon.</span>
                                    </div>
                                </div>
                            ) : null;
                        })()}
                        {product.inStock ? (
                            <>
                                <button onClick={() => addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition" >
                                    Add to Cart
                                </button>
                                <button onClick={() => { addToCart(product._id); navigate("/cart") }} className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition" >
                                    Buy now
                                </button>
                            </>
                        ) : (
                            <button onClick={async () => {
                                if (!user) return toast.error("Login to get notified");
                                try {
                                    const { data } = await axios.post('/api/notify/request', { userId: user._id, productId: product._id, email: user.email });
                                    if (data.success) toast.success(data.message);
                                    else toast.error(data.message);
                                } catch (error) { toast.error(error.message); }
                            }} className="w-full py-3.5 cursor-pointer font-medium bg-orange-500 text-white hover:bg-orange-600 transition flex items-center justify-center gap-2" >
                                🔔 Notify Me When Available
                            </button>
                        )}
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center gap-4 mt-6 text-gray-500 text-sm">
                        <p>Share:</p>
                        <div className="flex gap-3">
                            <button onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Link copied!");
                            }} className="hover:text-primary transition" title="Copy Link">
                                🔗 Copy Link
                            </button>
                            <a
                                href={`https://wa.me/?text=Check out ${product.name} on SabziKart! ${window.location.href}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-500 transition flex items-center gap-1"
                            >
                                💬 WhatsApp
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=Check out ${product.name} on SabziKart!&url=${window.location.href}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition flex items-center gap-1"
                            >
                                🐦 Twitter
                            </a>
                        </div>
                    </div>

                    {/* Rating Section - show if user hasn't reviewed */}
                    {!userReview && (
                        <div className="mt-10">
                            <h3 className="font-medium text-lg">Rate this product</h3>
                            <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <img
                                        key={star}
                                        src={star <= rating ? assets.star_icon : assets.star_dull_icon}
                                        className="w-6 cursor-pointer"
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full mt-3 p-2 border rounded"
                            />
                            <div className="flex gap-2 mt-3">
                                <button onClick={submitRating} className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary-dull transition">
                                    {isEditing ? 'Update Review' : 'Submit Rating'}
                                </button>
                                {isEditing && (
                                    <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 transition">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ---------- Reviews Section -------------- */}
            <div className="mt-16 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-medium">Customer Reviews</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {product.ratings?.length || 0} reviews • Average: {averageRating} ★
                        </p>
                    </div>
                </div>

                {/* Rating Summary Bar */}
                <div className="flex gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-primary">{averageRating}</p>
                        <div className="flex gap-0.5 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map(s => (
                                <img key={s} src={s <= Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon} className="w-4" />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{product.ratings?.length || 0} reviews</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = product.ratings?.filter(r => r.rating === star).length || 0
                            const percentage = product.ratings?.length > 0 ? (count / product.ratings.length) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="w-8 text-right text-gray-600">{star}★</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <span className="w-8 text-gray-500">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Individual Reviews */}
                {product.ratings && product.ratings.length > 0 ? (
                    <div className="space-y-4">
                        {product.ratings.map((review, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">

                                {/* If this is the user's review AND editing mode is on → show edit form */}
                                {user && user._id === review.userId && isEditing ? (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm text-blue-600">✏️ Editing your review</h4>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <img
                                                    key={star}
                                                    src={star <= rating ? assets.star_icon : assets.star_dull_icon}
                                                    className="w-6 cursor-pointer"
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Update your comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={submitRating} className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary-dull transition text-sm">
                                                Save Changes
                                            </button>
                                            <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300 transition text-sm">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal review display */
                                    <>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                                                    {review.userId.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <img key={s} src={s <= review.rating ? assets.star_icon : assets.star_dull_icon} className="w-3.5" />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                            year: 'numeric', month: 'short', day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Edit & Delete buttons - only for current user's own review */}
                                            {user && user._id === review.userId && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => startEdit(review)}
                                                        className="text-blue-400 hover:text-blue-600 text-sm cursor-pointer transition flex items-center gap-1"
                                                        title="Edit your review"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={deleteReview}
                                                        className="text-red-400 hover:text-red-600 text-sm cursor-pointer transition flex items-center gap-1"
                                                        title="Delete your review"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-2 text-gray-700">{review.comment}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="font-medium">No reviews yet</p>
                        <p className="text-sm mt-1">Be the first to review this product!</p>
                    </div>
                )}
            </div>

            {/* ---------- Frequently Bought Together -------------- */}
            <Recommendations productId={product._id} />

            {/* ---------- related products -------------- */}
            <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="text-3xl font-medium">Related Products</p>
                    <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                    {relatedProducts.filter((product) => product.inStock).map((product, index) => (
                        <ProductCard key={index} product={product} />
                    ))}
                </div>
                <button onClick={() => { navigate('/products'); scrollTo(0, 0) }} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">See more</button>
            </div>
        </div>
    );
};


export default ProductDetails