import React, { useEffect, useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'

const Checkout = () => {
    const {
        products,
        currency,
        cartItems,
        getCartAmount,
        getCartCount,
        user,
        axios,
        navigate,
        setCartItems
    } = useAppContext()

    const [addresses, setAddresses] = useState([])
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressDropdown, setShowAddressDropdown] = useState(false)
    const [paymentOption, setPaymentOption] = useState("COD")
    const [couponCode, setCouponCode] = useState("")
    const [discount, setDiscount] = useState(0)
    const [isApplying, setIsApplying] = useState(false)

    const [cartArray, setCartArray] = useState([])

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            let tempArray = []
            for (const key in cartItems) {
                const product = products.find((item) => item._id === key)
                if (product) {
                    tempArray.push({ ...product, quantity: cartItems[key] })
                }
            }
            setCartArray(tempArray)
        }
    }, [products, cartItems])

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get('/api/address/get')
            if (data.success) {
                setAddresses(data.addresses)
                if (data.addresses.length > 0) setSelectedAddress(data.addresses[0])
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (user) fetchAddresses()
    }, [user])

    const handleApplyCoupon = async () => {
        if (!couponCode) return toast.error("Enter coupon code")
        setIsApplying(true)
        try {
            const { data } = await axios.post('/api/coupon/apply', {
                code: couponCode,
                cartAmount: getCartAmount()
            }, { headers: { token: user.token } })
            if (data.success) {
                setDiscount(data.discount)
                toast.success(data.message)
            } else {
                toast.error(data.message)
                setDiscount(0)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsApplying(false)
        }
    }

    const [deliveryDate, setDeliveryDate] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");

    // Use useMemo so the Date objects aren't recreated on every render, avoiding reference equality bugs.
    const availableDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i + 1);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    }, []);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return toast.error("Select delivery address")
        if (!deliveryDate || !deliveryTime) return toast.error("Please select a delivery slot");

        try {
            const orderData = {
                userId: user._id,
                items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                address: selectedAddress._id,
                couponCode: discount > 0 ? couponCode.toUpperCase() : null,
                couponDiscount: discount,
                scheduledDeliveryDate: deliveryDate,
                deliveryTimeSlot: deliveryTime
            }

            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', orderData)
                if (data.success) {
                    toast.success(data.message)
                    setCartItems({})
                    navigate('/my-orders')
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post('/api/order/stripe', orderData)
                if (data.success) {
                    window.location.replace(data.url)
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            const { data } = await axios.post('/api/address/default', { userId: user._id, addressId });
            if (data.success) {
                toast.success(data.message);
                window.location.reload();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    if (cartArray.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center py-20'>
                <p className='text-gray-500 text-lg mb-4'>Your cart is empty</p>
                <button onClick={() => navigate('/products')} className='bg-primary text-white px-8 py-2 rounded-full'>Shop Now</button>
            </div>
        )
    }

    const subtotal = getCartAmount()
    const tax = Math.floor((subtotal - discount) * 0.02)
    const total = subtotal - discount + tax

    return (
        <div className='mt-12 pb-20'>
            <h1 className='text-3xl font-medium mb-8'>Checkout</h1>

            <div className='flex flex-col lg:flex-row gap-12'>

                {/* Left Side: Address & Payment */}
                <div className='flex-1 space-y-8'>

                    {/* Section 1: Delivery Address */}
                    <div className='bg-white border border-gray-200 rounded-xl p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-lg font-semibold flex items-center gap-2'>
                                <span className='bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center'>1</span>
                                Delivery Address
                            </h2>
                            <button onClick={() => navigate('/add-address')} className='text-primary text-sm font-medium hover:underline'>+ Add New</button>
                        </div>

                        {selectedAddress ? (
                            <div className='relative'>
                                <div onClick={() => setShowAddressDropdown(!showAddressDropdown)} className='p-4 border border-primary/30 rounded-lg bg-primary/5 cursor-pointer'>
                                    <p className='font-medium'>{selectedAddress.firstName} {selectedAddress.lastName}</p>
                                    <p className='text-gray-500 text-sm mt-1'>
                                        {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipcode}
                                    </p>
                                    <p className='text-gray-500 text-sm mt-1'>Phone: {selectedAddress.phone}</p>
                                </div>

                                {showAddressDropdown && (
                                    <div className='absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-2 z-10 max-h-60 overflow-y-auto'>
                                        {addresses.map((addr, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => { setSelectedAddress(addr); setShowAddressDropdown(false) }}
                                                className='p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between items-center'
                                            >
                                                <div>
                                                    <p className='font-medium'>{addr.firstName} {addr.lastName}</p>
                                                    <p className='text-xs text-gray-500'>{addr.street}, {addr.city}</p>
                                                </div>
                                                {user?.defaultAddress !== addr._id && (
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(addr._id);
                                                    }} className="text-xs text-primary hover:underline">Set Default</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='text-center py-4'>
                                <p className='text-gray-400 mb-2'>No address found</p>
                                <button onClick={() => navigate('/add-address')} className='text-primary font-medium'>Add your first address</button>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Delivery Slot */}
                    <div className='bg-white border border-gray-200 rounded-xl p-6'>
                        <h2 className='text-lg font-semibold flex items-center gap-2 mb-6'>
                            <span className='bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center'>2</span>
                            Delivery Slot
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Select Date:</p>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {availableDates.map((dateObj, idx) => {
                                        // Compare using timestamp instead of object reference
                                        const isSelected = deliveryDate === dateObj.getTime();
                                        return (
                                            <div
                                                key={idx}
                                                // Store the timestamp as the selection
                                                onClick={() => setDeliveryDate(dateObj.getTime())}
                                                className={`min-w-[72px] p-3 rounded-xl border-2 cursor-pointer text-center text-sm transition-all ${isSelected
                                                    ? 'border-primary bg-primary text-white font-bold shadow-md scale-105'
                                                    : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'
                                                    }`}
                                            >
                                                <p className="text-xs font-medium">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                                <p className="text-xl font-bold mt-0.5">{dateObj.getDate()}</p>
                                                <p className="text-[10px] opacity-70">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Select Time:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Morning (9AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)'].map((slot, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setDeliveryTime(slot)}
                                            className={`p-3 rounded-lg border cursor-pointer text-center text-sm transition ${deliveryTime === slot ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-gray-200 hover:border-primary/50'}`}
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Payment Method */}
                    <div className='bg-white border border-gray-200 rounded-xl p-6'>
                        <h2 className='text-lg font-semibold flex items-center gap-2 mb-6'>
                            <span className='bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center'>3</span>
                            Payment Method
                        </h2>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div
                                onClick={() => setPaymentOption("COD")}
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentOption === "COD" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === "COD" ? "border-primary" : "border-gray-400"}`}>
                                    {paymentOption === "COD" && <div className='w-2 h-2 bg-primary rounded-full'></div>}
                                </div>
                                <div>
                                    <p className='font-medium'>Cash on Delivery</p>
                                    <p className='text-xs text-gray-500'>Pay when you receive</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setPaymentOption("Online")}
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentOption === "Online" ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === "Online" ? "border-primary" : "border-gray-400"}`}>
                                    {paymentOption === "Online" && <div className='w-2 h-2 bg-primary rounded-full'></div>}
                                </div>
                                <div>
                                    <p className='font-medium'>Online Payment</p>
                                    <p className='text-xs text-gray-500'>Stripe / Cards / UPI</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Order Items Summary */}
                    <div className='bg-white border border-gray-200 rounded-xl p-6'>
                        <h2 className='text-lg font-semibold flex items-center gap-2 mb-6'>
                            <span className='bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center'>4</span>
                            Review Items
                        </h2>
                        <div className='space-y-4'>
                            {cartArray.map((item, idx) => (
                                <div key={idx} className='flex items-center gap-4 py-2 border-b last:border-0 border-gray-100'>
                                    <img src={item.image[0]} className='w-16 h-16 rounded-lg object-cover bg-gray-50' alt="" />
                                    <div className='flex-1'>
                                        <p className='font-medium'>{item.name}</p>
                                        <p className='text-sm text-gray-400'>{item.category} • Qty: {item.quantity}</p>
                                    </div>
                                    <p className='font-semibold'>{currency}{item.offerPrice * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Side: Price Summary */}
                <div className='lg:w-96'>
                    <div className='bg-white border border-gray-200 rounded-xl p-6 sticky top-24'>
                        <h2 className='text-xl font-bold mb-6'>Order Summary</h2>

                        {/* Coupon Section */}
                        <div className='mb-6'>
                            <p className='text-sm font-medium text-gray-600 mb-2 flex justify-between'>
                                <span>Have a Coupon?</span>
                                <span className='text-xs text-primary bg-primary/10 px-2 py-0.5 rounded cursor-pointer' onClick={() => setCouponCode('SAVE10')}>Try SAVE10</span>
                            </p>
                            <div className='flex gap-2'>
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    className='flex-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary uppercase text-sm'
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={isApplying}
                                    className='bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:bg-gray-400 cursor-pointer'
                                >
                                    {isApplying ? "..." : "Apply"}
                                </button>
                            </div>
                            {discount > 0 && <p className='text-xs text-green-600 mt-1 font-medium'>✓ Coupon Applied Successfully!</p>}
                            {discount === 0 && <p className='text-xs text-gray-400 mt-1'>Available codes: <span className='font-mono font-bold text-gray-600 cursor-pointer hover:text-primary' onClick={() => setCouponCode('WELCOME20')}>WELCOME20</span> (20% off), <span className='font-mono font-bold text-gray-600 cursor-pointer hover:text-primary' onClick={() => setCouponCode('FLAT50')}>FLAT50</span> (Flat ₹50 off)</p>}
                        </div>

                        <div className='space-y-3 text-sm border-b border-gray-100 pb-4 mb-4'>
                            <div className='flex justify-between text-gray-600'>
                                <span>Subtotal ({getCartCount()} items)</span>
                                <span>{currency}{subtotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className='flex justify-between text-green-600 font-medium'>
                                    <span>Coupon Discount</span>
                                    <span>-{currency}{discount}</span>
                                </div>
                            )}
                            <div className='flex justify-between text-gray-600'>
                                <span>Shipping Fee</span>
                                <span className='text-green-600 font-medium'>FREE</span>
                            </div>
                            <div className='flex justify-between text-gray-600'>
                                <span>Tax (GST 2%)</span>
                                <span>{currency}{tax}</span>
                            </div>
                        </div>

                        <div className='flex justify-between text-xl font-bold mb-8'>
                            <span>Total Amount</span>
                            <span className='text-primary'>{currency}{total}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className='w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dull shadow-lg shadow-primary/20 transition-all active:scale-[0.98]'
                        >
                            {paymentOption === "COD" ? "Place Order" : "Pay Securely Now"}
                        </button>

                        <p className='text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1'>
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'></path></svg>
                            Secure 256-bit SSL Encrypted Payment
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Checkout
