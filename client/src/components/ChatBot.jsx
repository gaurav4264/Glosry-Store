import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { categories as assetCategories } from '../assets/assets'

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { type: 'bot', text: '👋 नमस्ते! मैं Gaurav Grocery का AI Assistant हूँ। Product search karein, category par jaayein, ya koi complaint karein!', time: new Date() }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [complaintMode, setComplaintMode] = useState(false) // New state for complaint flow
    const messagesEndRef = useRef(null)
    const { products, currency, user, token } = useAppContext() // Added user/token for complaint
    const navigate = useNavigate()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Quick suggestion buttons
    const suggestions = [
        '🔍 Show all categories',
        '🍎 Go to Fruits',
        '📝 Register Complaint', // Added
        '🏷️ Cheapest products',
        '⭐ Top rated products',
        '📦 Track my order'
    ]

    const handleOptionClick = (opt) => {
        if (opt.action === 'navigate') {
            navigate(opt.path)
            // Optional: Force close chat on navigation?
            // setIsOpen(false) 
        } else if (opt.action === 'suggest') {
            handleSuggestion(opt.text)
        }
    }

    const handleComplaintSubmission = async (details) => {
        try {
            // Optimistic bot response
            setMessages(prev => [...prev, { type: 'bot', text: '📝 main aapki complaint note kar raha hun, kripya wait karein...', time: new Date() }])

            const payload = {
                userId: user ? user._id : 'Guest',
                userName: user ? user.name : 'Guest User',
                details: details,
                type: 'General'
            }

            const response = await axios.post('/api/complaint/create', payload);

            if (response.data.success) {
                return `✅ **Complaint Registered!**\n\nHumne aapki complaint note kar li hai: "${details}"\n\nHum jald hi aapse contact karenge. Aap aur kuch poochna chahte hain?`;
            } else {
                return `❌ Complaint register karne mein error aaya: ${response.data.message}. Kripya phone par contact karein.`;
            }
        } catch (error) {
            console.error(error);
            return `❌ Server error. Please try again later or contact support directly.`;
        }
    }

    const processMessage = async (userMsg) => {
        const msg = userMsg.toLowerCase().trim()

        // Helper to return format
        const response = (text, options = []) => ({ text, options })

        // --- COMPLAINT MODE HANDLING ---
        if (complaintMode) {
            if (msg === 'cancel' || msg === 'exit') {
                setComplaintMode(false)
                return response('🚫 Complaint process cancelled. Main aapki aur kya help kar sakta hoon?')
            }
            // Submit complaint
            const responseText = await handleComplaintSubmission(userMsg)
            setComplaintMode(false)
            return response(responseText)
        }

        // --- DIRECT NAVIGATION COMMANDS ---
        if (msg.startsWith('go to') || msg.startsWith('open') || msg.startsWith('chalo') || msg.startsWith('show')) {
            const cleanMsg = msg.replace(/^(go to|open|chalo|show)\s+/, '')
            const categories = [...new Set(products.map(p => p.category.toLowerCase()))]

            const matchedCat = categories.find(c => cleanMsg.includes(c))
            if (matchedCat) {
                navigate(`/products/${matchedCat}`)
                return response(`🚀 **Navigating...**\n\nAapko **${matchedCat}** category mein le ja raha hoon!`)
            }

            if (cleanMsg.includes('cart')) { navigate('/cart'); return response('🛒 Cart open kar diya hai.') }
            if (cleanMsg.includes('order')) { navigate('/my-orders'); return response('📦 My Orders page open kar diya hai.') }
            if (cleanMsg.includes('profile')) { navigate('/profile'); return response('👤 Profile page open kar diya hai.') }
            if (cleanMsg.includes('home')) { navigate('/'); return response('🏠 Home page par aa gaye.') }
        }


        // --- COMPLAINT INITIATION ---
        if (msg.includes('complain') || msg.includes('issue') || msg.includes('problem') || msg.includes('shikayat') || msg.includes('dikkat') || msg.includes('error')) {
            setComplaintMode(true)
            return response('⚠️ **Complaint/Issue**\n\nKripya apni complaint details yahan type karein. Main isse note karke seller ko bhej dunga.\n\n(Type "cancel" to exit)')
        }

        const categories = [...new Set(products.map(p => p.category))]

        // --- GREETING ---
        if (msg.match(/^(hi|hello|hey|hlo|hii|namaste|namaskar)/)) {
            return response(
                '👋 Hello! Welcome to Gaurav Grocery Store! Main aapki kya help kar sakta hoon?',
                [
                    { label: '📂 Show Categories', action: 'suggest', text: 'Show all categories' },
                    { label: '📝 Complaint', action: 'suggest', text: 'Register Complaint' },
                    { label: '📦 Track Order', action: 'navigate', path: '/my-orders' }
                ]
            )
        }

        // ... in ChatBot component ...



        // ...

        // --- CATEGORIES ---
        if (msg.includes('category') || msg.includes('categories') || msg.includes('all categories')) {
            const catOptions = assetCategories.map(c => ({
                label: c.text, // e.g. "Fresh Fruits"
                action: 'navigate',
                path: `/products/${c.path.toLowerCase()}` // e.g. "/products/fruits"
            }))
            return response(
                `📂 **Hamare Store mein ye categories hain:**\n\nDirect visit karne ke liye button click karein:`,
                catOptions
            )
        }

        // --- SEARCH BY CATEGORY ---
        const matchedCategory = categories.find(c => msg.includes(c.toLowerCase()))
        if (matchedCategory) {
            const catProducts = products.filter(p => p.category === matchedCategory && p.inStock)
            if (catProducts.length > 0) {
                const top5 = catProducts.slice(0, 5)
                return response(
                    `🛒 **${matchedCategory} category mein ${catProducts.length} products hain:**\n\n${top5.map(p => `• ${p.name} - ${currency}${p.offerPrice}`).join('\n')}`,
                    [{ label: `Go to ${matchedCategory}`, action: 'navigate', path: `/products/${matchedCategory.toLowerCase()}` }]
                )
            }
            return response(`❌ Is waqt **${matchedCategory}** mein koi product available nahi hai.`)
        }

        // --- SEARCH PRODUCT BY NAME ---
        if (msg.includes('search') || msg.includes('find') || msg.includes('dhundo') || msg.includes('chahiye')) {
            const searchTerms = msg.replace(/(search|find|dhundo|chahiye|mujhe|product|for|karo)/g, '').trim()
            if (searchTerms.length > 2) {
                const found = products.filter(p =>
                    p.name.toLowerCase().includes(searchTerms) && p.inStock
                ).slice(0, 5)
                if (found.length > 0) {
                    // Add logic to link to product details if possible (assuming we have ID)
                    const productOptions = found.map(p => ({
                        label: `View ${p.name}`,
                        action: 'navigate',
                        path: `/products/${p.category}/${p._id}`
                    }))
                    return response(
                        `🔍 **"${searchTerms}" ke liye results:**\n\n${found.map(p => `• ${p.name} - ${currency}${p.offerPrice}`).join('\n')}`,
                        productOptions
                    )
                }
                return response(`❌ "${searchTerms}" se related koi product nahi mila. Kuch aur try karein?`)
            }
        }

        // --- CHEAPEST PRODUCTS ---
        if (msg.includes('cheap') || msg.includes('sasta') || msg.includes('low price') || msg.includes('budget')) {
            const sorted = [...products].filter(p => p.inStock).sort((a, b) => a.offerPrice - b.offerPrice).slice(0, 5)
            // Just show 'All Products' link
            return response(
                `💰 **Sabse saste products:**\n\n${sorted.map(p => `• ${p.name} - ${currency}${p.offerPrice}`).join('\n')}`,
                [{ label: 'View All Deals', action: 'navigate', path: '/products' }]
            )
        }

        // --- EXPENSIVE / PREMIUM ---
        if (msg.includes('expensive') || msg.includes('premium') || msg.includes('mahanga') || msg.includes('best')) {
            const sorted = [...products].filter(p => p.inStock).sort((a, b) => b.offerPrice - a.offerPrice).slice(0, 5)
            return response(
                `👑 **Premium products:**\n\n${sorted.map(p => `• ${p.name} - ${currency}${p.offerPrice}`).join('\n')}`,
                [{ label: 'View Premium', action: 'navigate', path: '/products' }]
            )
        }

        // --- TOP RATED ---
        if (msg.includes('top rated') || msg.includes('best rated') || msg.includes('rating') || msg.includes('popular')) {
            const rated = products
                .filter(p => p.ratings && p.ratings.length > 0 && p.inStock)
                .map(p => ({
                    ...p,
                    avgRating: (p.ratings.reduce((a, r) => a + r.rating, 0) / p.ratings.length).toFixed(1)
                }))
                .sort((a, b) => b.avgRating - a.avgRating)
                .slice(0, 5)

            if (rated.length > 0) {
                return response(
                    `⭐ **Top Rated Products:**\n\n${rated.map(p => `• ${p.name} - ⭐${p.avgRating} (${p.ratings.length} reviews)`).join('\n')}`,
                    [{ label: 'View Top Rated', action: 'navigate', path: '/products' }]
                )
            }
            return response('⭐ Abhi tak kisi product ko rating nahi mili hai. Aap pehle reviewer ban sakte hain!')
        }

        // --- PRICE QUERY ---
        if (msg.includes('price') || msg.includes('cost') || msg.includes('kitna') || msg.includes('kya price') || msg.includes('rate')) {
            const searchTerm = msg.replace(/(price|cost|kitna|kya|rate|of|hai|ka|ki|ke|what|is|the)/g, '').trim()
            if (searchTerm.length > 2) {
                const found = products.filter(p => p.name.toLowerCase().includes(searchTerm))
                if (found.length > 0) {
                    const productOptions = found.slice(0, 3).map(p => ({
                        label: `Check ${p.name}`,
                        action: 'navigate',
                        path: `/products/${p.category}/${p._id}`
                    }))
                    return response(
                        `💰 **Price Info:**\n\n${found.slice(0, 5).map(p => `• ${p.name}\n  MRP: ~~${currency}${p.price}~~ → ${currency}${p.offerPrice}`).join('\n\n')}`,
                        productOptions
                    )
                }
            }
            return response('💰 Kisi product ka naam bataiye, main price bata dunga! Jaise: "milk price" ya "rice kitna"')
        }

        // --- DELIVERY ---
        if (msg.includes('delivery') || msg.includes('shipping') || msg.includes('deliver')) {
            return response('🚚 **Delivery Information:**\n\n• Local area: 1-2 ghante mein delivery\n• ₹500+ orders par FREE delivery\n• Sunday bhi delivery available (9AM-6PM)\n• Cash on Delivery (COD) available')
        }

        // --- PAYMENT ---
        if (msg.includes('payment') || msg.includes('pay') || msg.includes('upi') || msg.includes('cod') || msg.includes('online')) {
            return response('💳 **Payment Methods:**\n\n• 💵 Cash on Delivery (COD)\n• 💳 Credit/Debit Card (Stripe)\n• 🏦 Online Payment')
        }

        // --- ORDER TRACKING ---
        if (msg.includes('track') || msg.includes('order') || msg.includes('status') || msg.includes('kahan')) {
            return response(
                '📦 **Order Track karne ke liye:**\n\n1. "My Orders" page par jaayein\n2. Apne order ki timeline dekhein',
                [{ label: 'Go to My Orders', action: 'navigate', path: '/my-orders' }]
            )
        }

        // --- RETURN / REFUND ---
        if (msg.includes('return') || msg.includes('refund') || msg.includes('cancel') || msg.includes('wapas')) {
            return response(
                '🔄 **Return & Refund Policy:**\n\n• 24 ghante ke andar return kar sakte hain\n• Product damaged ya galat ho toh turant replace karenge\n• Contact: 📞 6207364264\n\nKoi problem ho toh "Complaint" feature use karein!',
                [{ label: 'Register Complaint', action: 'suggest', text: 'Register Complaint' }]
            )
        }

        // --- OFFERS / DISCOUNT ---
        if (msg.includes('offer') || msg.includes('discount') || msg.includes('sale') || msg.includes('coupon') || msg.includes('deal')) {
            const discounted = [...products]
                .filter(p => p.inStock && p.price > p.offerPrice)
                .map(p => ({ ...p, discount: Math.round((1 - p.offerPrice / p.price) * 100) }))
                .sort((a, b) => b.discount - a.discount)
                .slice(0, 5)

            if (discounted.length > 0) {
                return response(
                    `🎉 **Best Offers Right Now:**\n\n${discounted.map(p => `• ${p.name} - ${p.discount}% OFF! (${currency}${p.price} → ${currency}${p.offerPrice})`).join('\n')}\n\nJaldi order karein, stock limited hai! 🏃‍♂️`,
                    [{ label: 'View All Offers', action: 'navigate', path: '/products' }]
                )
            }
            return response('🎉 Abhi special offers check karein "All Products" page par!', [{ label: 'View Offers', action: 'navigate', path: '/products' }])
        }

        // --- CONTACT ---
        if (msg.includes('contact') || msg.includes('call') || msg.includes('phone') || msg.includes('email') || msg.includes('help')) {
            return response(
                '📞 **Contact Info:**\n\n• 👤 Owner: Gaurav\n• 📞 Phone: +91 6207364264\n• 📧 Email: gaurav325kr@gmail.com',
                [{ label: 'Contact Page', action: 'navigate', path: '/contact' }]
            )
        }

        // --- STORE INFO ---
        if (msg.includes('store') || msg.includes('shop') || msg.includes('about') || msg.includes('dukaan')) {
            return response('🏪 **Gaurav Grocery Store:**\n\n• Fresh groceries aur daily essentials\n• ${products.length} products available\n• Online ordering + Home delivery\n• COD & Online payment\n• Loyalty points program 💎\n\nQuality products, best prices! ✅')
        }

        // --- LOYALTY ---
        if (msg.includes('loyalty') || msg.includes('points') || msg.includes('reward')) {
            return response(
                '💎 **Loyalty Points Program:**\n\n• Har order par points milte hain\n• Points ko discounts mein convert karein',
                [{ label: 'Check Points', action: 'navigate', path: '/loyalty' }]
            )
        }

        // --- WISHLIST ---
        if (msg.includes('wishlist') || msg.includes('save') || msg.includes('later') || msg.includes('favorite')) {
            return response('💖 **Wishlist:** Save favorites for later.', [{ label: 'Open Wishlist', action: 'navigate', path: '/wishlist' }])
        }

        // --- THANK YOU ---
        if (msg.match(/(thank|thanks|shukriya|dhanyavaad)/)) {
            return response('🙏 Aapka shukriya! Agar koi aur sawal ho toh zaroor poochein. Happy shopping! 🛒✨')
        }

        // --- BYE ---
        if (msg.match(/(bye|goodbye|alvida|ok)/)) {
            return response('👋 Alvida! Phir se aayein. Gaurav Grocery Store mein aapka swagat hai! 🙏')
        }

        // --- TRY PRODUCT NAME MATCH ---
        const productMatch = products.find(p =>
            p.name.toLowerCase().includes(msg) || msg.includes(p.name.toLowerCase().split(' ')[0])
        )
        if (productMatch) {
            const avgR = productMatch.ratings?.length > 0
                ? (productMatch.ratings.reduce((a, r) => a + r.rating, 0) / productMatch.ratings.length).toFixed(1)
                : 'No rating'
            return response(
                `🛍️ **${productMatch.name}**\n\n• Category: ${productMatch.category}\n• MRP: ~~${currency}${productMatch.price}~~ → ${currency}${productMatch.offerPrice}\n• Rating: ⭐${avgR}\n• Stock: ${productMatch.inStock ? '✅ Available' : '❌ Out of stock'}`,
                [{ label: `View ${productMatch.name}`, action: 'navigate', path: `/products/${productMatch.category}/${productMatch._id}` }]
            )
        }

        // --- DEFAULT ---
        return response('🤔 Main samajh nahi paaya. Aap ye try kar sakte hain:\n\n• "Show Categories"\n• "Complaint"\n• "Track Order"')
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { type: 'user', text: input, time: new Date() }
        setMessages(prev => [...prev, userMessage])
        const userInput = input
        setInput('')
        setIsTyping(true)

        // Process message (Async for API calls)
        setTimeout(async () => {
            const botData = await processMessage(userInput)
            // Ensure compatibility if processMessage returned just string in some legacy path (guarded by helper now)
            const botMsg = {
                type: 'bot',
                text: botData.text,
                options: botData.options,
                time: new Date()
            }
            setMessages(prev => [...prev, botMsg])
            setIsTyping(false)
        }, 800 + Math.random() * 700)
    }

    const handleSuggestion = (suggestion) => {
        const cleanText = suggestion.replace(/^[^\s]+ /, '')
        setInput(cleanText)
        setTimeout(() => handleSend(), 100);
    }

    // ... rest of the component (render) remains mostly same, just slight updates to suggestions UI if needed ...
    // Using existing render code, just updated imports and logic function

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend()
    }

    const formatText = (text) => {
        // Bold **text**
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Strikethrough ~~text~~
        formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>')
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br/>')
        return formatted
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform z-50'
                title="Chat with AI Assistant"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className='fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200'>

                    {/* Header */}
                    <div className='bg-gradient-to-r from-primary to-green-600 text-white p-4 flex items-center gap-3'>
                        <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl'>
                            🤖
                        </div>
                        <div className='flex-1'>
                            <h3 className='font-bold text-sm'>Gaurav Grocery AI</h3>
                            <p className='text-xs text-white/80 flex items-center gap-1'>
                                <span className='w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse'></span>
                                Online • {complaintMode ? 'Listening to Complaint...' : 'Typically replies instantly'}
                            </p>
                        </div>
                        <button onClick={() => setIsOpen(false)} className='text-white/70 hover:text-white text-xl cursor-pointer'>✕</button>
                    </div>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : (msg.text.includes('Complaint Registered') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100')
                                    }`}>
                                    <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                                    <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                        {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {/* Message Options/Action Chips */}
                                {msg.options && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-2 max-w-[85%]">
                                        {msg.options.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleOptionClick(opt)}
                                                className="px-3 py-1.5 bg-green-50 text-green-700 text-xs border border-green-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm cursor-pointer"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className='flex justify-start'>
                                <div className='bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-sm'>
                                    <div className='flex gap-1'>
                                        <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                                        <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></span>
                                        <span className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions (Hide in complaint mode) */}
                    {!complaintMode && messages.length <= 4 && (
                        <div className='px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5'>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestion(s)}
                                    className='px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition cursor-pointer whitespace-nowrap'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className={`p-3 border-t border-gray-200 flex items-center gap-2 ${complaintMode ? 'bg-orange-50' : 'bg-white'}`}>
                        <input
                            type='text'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={complaintMode ? 'Describe your issue details...' : 'Type your message...'}
                            className={`flex-1 px-4 py-2.5 rounded-full outline-none text-sm placeholder-gray-400 focus:ring-2 transition ${complaintMode ? 'bg-white border-orange-200 focus:ring-orange-300' : 'bg-gray-100 focus:bg-gray-50 focus:ring-primary/30'}`}
                            autoFocus={complaintMode}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className={`w-10 h-10 text-white rounded-full flex items-center justify-center cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed ${complaintMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary-dull'}`}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ChatBot
