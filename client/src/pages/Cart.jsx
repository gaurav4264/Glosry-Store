import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Cart = () => {
    const { products, currency, cartItems, removeFromCart, getCartCount, updateCartItem, navigate, getCartAmount } = useAppContext()
    const [cartArray, setCartArray] = useState([])

    useEffect(() => {
        let tempArray = []
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key)
            if (product) {
                tempArray.push({ ...product, quantity: cartItems[key] })
            }
        }
        setCartArray(tempArray)
    }, [products, cartItems])

    if (cartArray.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-20'>
                <p className='text-gray-500 text-lg mb-4 text-center'>Your shopping cart is empty</p>
                <button onClick={() => navigate('/products')} className='bg-primary text-white px-8 py-2 rounded-full'>Shop for Groceries</button>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row mt-16 gap-10">
            <div className='flex-1'>
                <h1 className="text-3xl font-medium mb-6">
                    Your Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-100 mb-4">
                    <p className="text-left">Product</p>
                    <p className="text-center">Price</p>
                    <p className="text-center">Action</p>
                </div>

                <div className='space-y-4'>
                    {cartArray.map((product, index) => (
                        <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-700 items-center text-sm md:text-base font-medium p-4 bg-gray-50 rounded-lg hover:bg-gray-100/70 transition-colors">
                            <div className="flex items-center md:gap-6 gap-3">
                                <div onClick={() => {
                                    navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0)
                                }} className="cursor-pointer w-20 h-20 flex items-center justify-center border border-gray-200 bg-white rounded-md overflow-hidden">
                                    <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                                </div>
                                <div className='flex-1'>
                                    <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                    <div className="font-normal text-gray-500 text-xs mt-1">
                                        <p>Qty:
                                            <select
                                                onChange={e => updateCartItem(product._id, Number(e.target.value))}
                                                value={product.quantity}
                                                className='ml-1 bg-transparent outline-none focus:text-primary font-bold'
                                            >
                                                {[...Array(10).keys()].map(n => (
                                                    <option key={n + 1} value={n + 1}>{n + 1}</option>
                                                ))}
                                            </select>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center font-bold">{currency}{product.offerPrice * product.quantity}</p>
                            <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded-full transition-colors group">
                                <img src={assets.remove_icon} alt="remove" className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={() => { navigate("/products"); scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-gray-500 hover:text-primary font-medium transition-colors">
                    <img className="group-hover:-translate-x-1 transition w-4 h-4 opacity-70" src={assets.arrow_right_icon_colored} alt="arrow" style={{ transform: 'rotate(180deg)' }} />
                    Back to Products
                </button>

            </div>

            <div className="md:w-80 h-fit bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-6">Summary</h2>

                <div className="text-gray-600 space-y-4 mb-6">
                    <div className="flex justify-between">
                        <span>Items Total</span>
                        <span>{currency}{getCartAmount()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600 font-medium">FREE</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-800 border-t border-gray-100 pt-4">
                        <span>Total</span>
                        <span>{currency}{getCartAmount()}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dull transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                    Proceed to Checkout
                </button>

                <div className='mt-6 flex flex-col gap-3'>
                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                        <span className='w-1.5 h-1.5 bg-green-500 rounded-full'></span>
                        Verified Fresh Quality
                    </div>
                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                        <span className='w-1.5 h-1.5 bg-blue-500 rounded-full'></span>
                        Secure SSL Payments
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart;