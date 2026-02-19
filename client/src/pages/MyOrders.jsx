import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import OrderTimeline from '../components/OrderTimeline'
import toast from 'react-hot-toast'
import { generateInvoice } from '../utils/generateInvoice'

const MyOrders = () => {

    const [myOrders, setMyOrders] = useState([])
    const { currency, axios, user } = useAppContext()

    // Modal States
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [showReturnModal, setShowReturnModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [reason, setReason] = useState('')
    const [customReason, setCustomReason] = useState('')
    const [returnImages, setReturnImages] = useState([])

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user')
            if (data.success) {
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancelOrder = async () => {
        const finalReason = reason === 'Other' ? customReason : reason;
        if (!finalReason) return toast.error("Please provide a reason")

        try {
            const { data } = await axios.post('/api/order/cancel', { orderId: selectedOrder._id, reason: finalReason })
            if (data.success) {
                toast.success(data.message)
                setShowCancelModal(false)
                setReason('')
                setCustomReason('')
                fetchMyOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const [isReturnSubmitting, setIsReturnSubmitting] = useState(false)

    const handleReturnOrder = async () => {
        const finalReason = reason === 'Other' ? customReason : reason;
        if (!finalReason) return toast.error("Please provide a reason for return")

        setIsReturnSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('orderId', selectedOrder._id);
            formData.append('reason', finalReason);
            formData.append('userId', user._id);

            returnImages.forEach((image) => {
                formData.append('images', image);
            });

            const { data } = await axios.post('/api/order/return', formData)
            if (data.success) {
                toast.success(data.message)
                setShowReturnModal(false)
                setReason('')
                setReturnImages([])
                fetchMyOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsReturnSubmitting(false);
        }
    }

    // Helper to handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + returnImages.length > 2) {
            toast.error("You can only upload a maximum of 2 images.");
            return;
        }
        setReturnImages(prev => [...prev, ...files].slice(0, 2));
    }

    // Helper for sharing
    const handleShare = (order) => {
        const text = `Check out my order from ${order.items[0]?.product?.shopId?.name || 'Glosry Shop'}! Total: ${currency}${order.amount}`;
        const url = window.location.href; // Or specific order link if available

        if (navigator.share) {
            navigator.share({
                title: 'My Order',
                text: text,
                url: url,
            }).catch(console.error);
        } else {
            // Fallback to WhatsApp
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    return (
        <div className='mt-16 pb-16'>
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>My orders</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            {myOrders.length === 0 && (
                <div className='text-center py-16 text-gray-400'>
                    <p className='text-5xl mb-4'>📦</p>
                    <p className='text-lg font-medium'>No orders yet</p>
                    <p className='text-sm mt-1'>Your orders will appear here</p>
                </div>
            )}

            <div className='space-y-10'>
                {myOrders.map((order, index) => (
                    <div key={index} className='border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white'>

                        {/* Order Header */}
                        <div className='bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4'>
                            <div className='flex gap-8'>
                                <div>
                                    <p className='text-[10px] text-gray-400 uppercase font-bold tracking-wider'>Order Placed</p>
                                    <p className='text-sm font-medium text-gray-700'>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className='text-[10px] text-gray-400 uppercase font-bold tracking-wider'>Total Amount</p>
                                    <p className='text-sm font-bold text-primary'>{currency}{order.amount}</p>
                                </div>
                                <div className='hidden sm:block'>
                                    <p className='text-[10px] text-gray-400 uppercase font-bold tracking-wider'>Order ID</p>
                                    <p className='text-xs font-mono text-gray-500'>#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => handleShare(order)}
                                    className='text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-medium flex items-center gap-1'
                                >
                                    📤 Share
                                </button>
                                {['Delivered', 'Return Requested', 'Returned'].includes(order.status) && (
                                    <button
                                        onClick={() => generateInvoice(order, currency)}
                                        className='text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-1.5 font-medium'
                                    >
                                        📄 Invoice
                                    </button>
                                )}
                                {['Order Placed', 'Packing'].includes(order.status) && (
                                    <button
                                        onClick={() => { setSelectedOrder(order); setShowCancelModal(true) }}
                                        className='text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium'
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                {order.status === 'Delivered' && (
                                    <button
                                        onClick={() => { setSelectedOrder(order); setShowReturnModal(true) }}
                                        className='text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition font-medium'
                                    >
                                        Return Items
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Order Details & Timeline */}
                        <div className='p-6'>
                            <div className='mb-8'>
                                <OrderTimeline status={order.status} />

                                {/* Delivery Schedule Info */}
                                {order.scheduledDeliveryDate && (
                                    <div className='mt-4 flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20'>
                                        <div className='p-2 bg-white rounded-full text-lg'>🚚</div>
                                        <div>
                                            <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Scheduled Delivery</p>
                                            <p className='text-sm text-gray-800 font-semibold'>
                                                {new Date(order.scheduledDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                <span className='mx-2'>•</span>
                                                {order.deliveryTimeSlot}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'Cancelled' && (
                                    <div className='mt-4 p-3 bg-red-50 rounded-lg border border-red-100'>
                                        <p className='text-xs text-red-600 font-medium'>Order Cancelled: {order.cancellationReason}</p>
                                    </div>
                                )}
                                {order.status === 'Return Requested' && (
                                    <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
                                        <p className='text-xs text-blue-600 font-medium'>Return Requested: {order.returnReason} (Status: {order.returnStatus})</p>
                                    </div>
                                )}
                            </div>

                            <div className='divide-y divide-gray-100'>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className='py-4 flex items-center gap-6'>
                                        <div className='w-16 h-16 bg-gray-50 rounded-lg p-2 border border-gray-100'>
                                            {item.product ? (
                                                <img src={item.product.image[0]} alt="" className='w-full h-full object-contain' />
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-[10px] text-gray-400'>N/A</div>
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <h3 className='font-bold text-gray-800'>{item.product?.name || "Product Unavailable"}</h3>
                                            <p className='text-sm text-gray-500'>Qty: {item.quantity} • {item.product?.category}</p>
                                            {item.product?.shopId && (
                                                <p onClick={() => window.location.href = `/shop/${item.product.shopId._id}`} className='text-xs text-primary mt-1 cursor-pointer hover:underline'>
                                                    Sold by: {item.product.shopId.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-bold text-gray-700'>{currency}{item.product?.offerPrice * item.quantity || "0"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Footer Info */}
                        <div className='px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center'>
                            <p className='text-[10px] text-gray-400 font-medium'>
                                Payment: <span className='text-gray-600'>{order.paymentType}</span> • {
                                    order.isPaid
                                        ? <span className='text-green-600 font-bold'>Payment Received</span>
                                        : order.paymentType === 'COD'
                                            ? <span className='text-orange-600 font-bold'>Pay on Delivery (COD)</span>
                                            : <span className='text-red-600 font-bold'>UNPAID (Pending Verification)</span>
                                }
                            </p>
                            <p className='text-xs font-medium text-primary'>Status: {order.status}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200'>
                        <h2 className='text-xl font-bold mb-4'>Cancel Order</h2>
                        <p className='text-gray-500 text-sm mb-4'>Please tell us why you want to cancel this order:</p>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded-lg mb-4 outline-none focus:border-primary'
                        >
                            <option value="">Select Reason</option>
                            <option value="Changed my mind">Changed my mind</option>
                            <option value="Order placed by mistake">Order placed by mistake</option>
                            <option value="Delivery time is too long">Delivery time is too long</option>
                            <option value="Found better price elsewhere">Found better price elsewhere</option>
                            <option value="Other">Other</option>
                        </select>
                        {reason === 'Other' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please specify your reason..."
                                className='w-full p-3 border border-gray-300 rounded-lg mb-6 h-20 outline-none focus:border-primary resize-none'
                            />
                        )}
                        <div className='flex gap-3 mt-2'>
                            <button onClick={() => setShowCancelModal(false)} className='flex-1 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition'>Back</button>
                            <button onClick={handleCancelOrder} className='flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition'>Confirm Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Items Modal */}
            {showReturnModal && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200'>
                        <h2 className='text-xl font-bold mb-4'>Return Items</h2>
                        <p className='text-gray-500 text-sm mb-4'>Why are you returning these items?</p>

                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className='w-full p-2 border border-gray-300 rounded-lg mb-4 outline-none focus:border-primary'
                        >
                            <option value="">Select Reason</option>
                            <option value="Damaged Product">Damaged Product</option>
                            <option value="Expired Product">Expired Product</option>
                            <option value="Wrong Item Received">Wrong Item Received</option>
                            <option value="Quality Issue">Quality Issue</option>
                            <option value="Other">Other</option>
                        </select>

                        {reason === 'Other' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please specify your reason..."
                                className='w-full p-3 border border-gray-300 rounded-lg mb-4 h-20 outline-none focus:border-primary resize-none'
                            />
                        )}

                        <div className="mb-6">
                            <p className="text-sm font-medium mb-2">Upload Evidence (Max 2 images)</p>
                            <div className="flex gap-2 mb-2">
                                {returnImages.map((img, idx) => (
                                    <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden">
                                        <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setReturnImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-[10px] rounded-full"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {returnImages.length < 2 && (
                                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer text-gray-400 hover:border-primary hover:text-primary transition">
                                        +
                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className='flex gap-3'>
                            <button onClick={() => setShowReturnModal(false)} className='flex-1 py-2 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition'>Back</button>
                            <button disabled={isReturnSubmitting} onClick={handleReturnOrder} className='flex-1 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed'>
                                {isReturnSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default MyOrders

