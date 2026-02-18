import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const Contact = () => {

    const { axios } = useAppContext()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [owner, setOwner] = useState(null)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        fetchOwnerProfile()
    }, [])

    const fetchOwnerProfile = async () => {
        try {
            const { data } = await axios.get('/api/contact/owner-profile')
            if (data.success) setOwner(data.profile)
        } catch (err) { console.log(err) }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill all required fields")
            return
        }
        setSending(true)
        try {
            const { data } = await axios.post('/api/contact/send', formData)
            if (data.success) {
                setSubmitted(true)
                toast.success("Message sent successfully!")
                setFormData({ name: '', email: '', subject: '', message: '' })
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setSending(false)
    }

    const ownerInitial = owner?.name ? owner.name.charAt(0).toUpperCase() : 'S'

    return (
        <div className='mt-16 pb-16'>
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>Contact us</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            <div className='grid md:grid-cols-2 gap-12 max-w-5xl'>

                {/* Left - Store Info */}
                <div>
                    <h2 className='text-xl font-semibold mb-6 text-gray-800'>Store Information</h2>

                    {/* Owner Card */}
                    <div className='bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 mb-6'>
                        <div className='flex items-center gap-4 mb-4'>
                            {owner?.photo ? (
                                <img src={owner.photo} alt={owner.name} className='w-14 h-14 rounded-full object-cover shadow-lg border-2 border-primary/30' />
                            ) : (
                                <div className='w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
                                    {ownerInitial}
                                </div>
                            )}
                            <div>
                                <h3 className='text-lg font-bold text-gray-800'>{owner?.name || 'Store Owner'}</h3>
                                <p className='text-sm text-primary font-medium'>Store Owner</p>
                            </div>
                        </div>
                        {owner?.about && (
                            <p className='text-sm text-gray-600 italic'>"{owner.about}"</p>
                        )}
                    </div>

                    {/* Contact Details */}
                    <div className='space-y-4'>
                        <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
                            <span className='text-2xl'>📞</span>
                            <div>
                                <p className='text-sm text-gray-500 font-medium'>Phone Number</p>
                                <a href={`tel:${owner?.phone || ''}`} className='text-gray-800 font-semibold hover:text-primary transition'>
                                    {owner?.phone || 'Not provided'}
                                </a>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
                            <span className='text-2xl'>📧</span>
                            <div>
                                <p className='text-sm text-gray-500 font-medium'>Email Address</p>
                                <a href={`mailto:${owner?.email || ''}`} className='text-gray-800 font-semibold hover:text-primary transition'>
                                    {owner?.email || 'Not provided'}
                                </a>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
                            <span className='text-2xl'>🕐</span>
                            <div>
                                <p className='text-sm text-gray-500 font-medium'>Business Hours</p>
                                <p className='text-gray-800 font-semibold'>{owner?.businessHours || 'Mon - Sat: 8:00 AM - 9:00 PM'}</p>
                                <p className='text-gray-600 text-sm'>{owner?.sundayHours || 'Sunday: 9:00 AM - 6:00 PM'}</p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition'>
                            <span className='text-2xl'>📍</span>
                            <div>
                                <p className='text-sm text-gray-500 font-medium'>Store Location</p>
                                <p className='text-gray-800 font-semibold'>{owner?.businessName || 'My Grocery Store'}</p>
                                <p className='text-gray-600 text-sm'>{owner?.address || 'Address not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className='mt-8'>
                        <h3 className='text-lg font-semibold mb-4 text-gray-800'>Quick Help</h3>
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='p-3 bg-blue-50 rounded-lg text-center'>
                                <p className='text-lg'>🚚</p>
                                <p className='text-xs font-medium text-blue-700 mt-1'>Free Delivery</p>
                                <p className='text-xs text-blue-600'>On orders ₹500+</p>
                            </div>
                            <div className='p-3 bg-green-50 rounded-lg text-center'>
                                <p className='text-lg'>🔄</p>
                                <p className='text-xs font-medium text-green-700 mt-1'>Easy Returns</p>
                                <p className='text-xs text-green-600'>Within 24 hours</p>
                            </div>
                            <div className='p-3 bg-purple-50 rounded-lg text-center'>
                                <p className='text-lg'>💳</p>
                                <p className='text-xs font-medium text-purple-700 mt-1'>Secure Payment</p>
                                <p className='text-xs text-purple-600'>COD & Online</p>
                            </div>
                            <div className='p-3 bg-orange-50 rounded-lg text-center'>
                                <p className='text-lg'>🌟</p>
                                <p className='text-xs font-medium text-orange-700 mt-1'>Fresh Products</p>
                                <p className='text-xs text-orange-600'>Quality assured</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Contact Form */}
                <div>
                    <h2 className='text-xl font-semibold mb-6 text-gray-800'>Send us a Message</h2>

                    {submitted ? (
                        <div className='text-center py-16 bg-green-50 rounded-xl border border-green-200'>
                            <p className='text-5xl mb-4'>✅</p>
                            <p className='text-lg font-semibold text-green-700'>Message Sent!</p>
                            <p className='text-sm text-green-600 mt-2'>We'll get back to you within 24 hours</p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className='mt-6 px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dull transition'
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-600 mb-1'>Your Name *</label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder='Enter your name'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary transition'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-600 mb-1'>Your Email *</label>
                                <input
                                    type='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder='Enter your email'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary transition'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-600 mb-1'>Subject</label>
                                <input
                                    type='text'
                                    name='subject'
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder='What is this about?'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary transition'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-600 mb-1'>Message *</label>
                                <textarea
                                    name='message'
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder='Write your message here...'
                                    rows='5'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-primary transition resize-none'
                                    required
                                ></textarea>
                            </div>

                            <button
                                type='submit'
                                disabled={sending}
                                className='w-full py-3 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dull transition disabled:opacity-50'
                            >
                                {sending ? 'Sending...' : 'Send Message 📩'}
                            </button>
                        </form>
                    )}

                    {/* FAQ Section */}
                    <div className='mt-10'>
                        <h3 className='text-lg font-semibold mb-4 text-gray-800'>Frequently Asked Questions</h3>
                        <div className='space-y-3'>
                            <details className='bg-gray-50 rounded-lg p-4 cursor-pointer'>
                                <summary className='font-medium text-gray-700'>How do I place an order?</summary>
                                <p className='mt-2 text-sm text-gray-600'>Browse products, add items to cart, and proceed to checkout. You can pay via COD or online payment.</p>
                            </details>
                            <details className='bg-gray-50 rounded-lg p-4 cursor-pointer'>
                                <summary className='font-medium text-gray-700'>What is the delivery time?</summary>
                                <p className='mt-2 text-sm text-gray-600'>We deliver within 1-2 hours for local orders. For distant areas, delivery may take up to 24 hours.</p>
                            </details>
                            <details className='bg-gray-50 rounded-lg p-4 cursor-pointer'>
                                <summary className='font-medium text-gray-700'>Can I return products?</summary>
                                <p className='mt-2 text-sm text-gray-600'>Yes, you can return products within 24 hours of delivery if they are damaged or not as described.</p>
                            </details>
                            <details className='bg-gray-50 rounded-lg p-4 cursor-pointer'>
                                <summary className='font-medium text-gray-700'>How can I track my order?</summary>
                                <p className='mt-2 text-sm text-gray-600'>Go to "My Orders" page to see your order status and tracking timeline.</p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
