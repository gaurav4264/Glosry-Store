import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { categories as assetCategories } from '../assets/assets'

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { type: 'bot', text: '👋 Namaste! Main **SabziKart AI** hoon! 🤖\n\nKoi bhi sawaal poocho — grocery, general knowledge, jokes, recipes, ya kuch bhi! 😊\n\n🌍 **Language change** kar sakte ho header mein: Hindi / English / Hinglish', time: new Date() }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [complaintMode, setComplaintMode] = useState(false)
    const [language, setLanguage] = useState('hinglish') // 'hindi' | 'english' | 'hinglish'
    const [chatTab, setChatTab] = useState('chat') // 'chat' | 'categories'
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
        '😊 How are you?',
        '🔍 Show all categories',
        '🍎 Go to Fruits',
        '📝 Register Complaint',
        '🏷️ Cheapest products',
        '⭐ Top rated products',
        '📦 Track my order',
        '😂 Tell me a joke',
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

    const processMessage = async (userMsg, conversationRef = []) => {
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
        if (msg.match(/(thank|thanks|shukriya|dhanyavaad|ty|thnx|thx)/)) {
            const thankReplies = [
                '🙏 Aapka bahut bahut shukriya! Aur kuch poochna hai? Main hamesha ready hoon! 😊',
                '💚 Thank you bhi aapko! Happy shopping karein! 🛒✨',
                '🌟 Aapka welcome hai! Koi aur sawaal ho toh zaroor batayein.',
            ]
            return response(thankReplies[Math.floor(Math.random() * thankReplies.length)])
        }

        // --- BYE ---
        if (msg.match(/(bye|goodbye|alvida|ok bye|tata|ttyl|see you)/)) {
            const byeReplies = [
                '👋 Alvida! Jaldi wapas aana, hum wait karenge! 🙏',
                '😊 Bye bye! Happy shopping! Gaurav Grocery mein aapka swagat hai! 🛒',
                '💚 Take care! Phir milenge! 👋✨'
            ]
            return response(byeReplies[Math.floor(Math.random() * byeReplies.length)])
        }

        // =============================================
        // ====  CASUAL / RANDOM CHAT SECTION  =========
        // =============================================

        // --- HOW ARE YOU ---
        if (msg.match(/(how are (you|use|u|ypu|yuo|yo|yoo)|kaise ho|kaisa hai|kaisi ho|how r u|hru|kya haal|kya hal|how's it going|what's up|wassup|sup|how r you|hows u)/)) {
            const replies = [
                '😊 Main bilkul theek hoon, shukriya poochne ke liye! Aap kaise hain? Aaj kuch khaas grocery chahiye?',
                '🤖 Main toh ek AI hoon, lekin aapki help karna mujhe bahut khushi deta hai! Aap sunao, kya chal raha hai? 😄',
                '💚 Ekdum fit aur fine! Aap batao, aaj kya grocery chahiye? Main ready hoon help ke liye! 🛒',
                '🌟 Bahut badiya! Din acha ja raha hai jab aap jaisa customer aata hai! Kya seva karoon? 😊'
            ]
            return response(replies[Math.floor(Math.random() * replies.length)])
        }

        // --- WHAT IS YOUR NAME ---
        if (msg.match(/(your name|aapka naam|tumhara naam|what are you|who are you|kaun ho|kya naam|tum kaun|apna naam)/)) {
            return response(
                '🤖 **Mera Naam: SabziKart AI** 🥬\n\nMain **Gaurav Grocery Store** ka official AI assistant hoon!\n\nMujhe banaya gaya hai aapki shopping experience ko aasaan aur enjoyable banane ke liye.\n\nAap mujhse grocery search, price check, order track, ya seedha baat bhi kar sakte hain! 😊',
                [{ label: '🔍 Product Search karein', action: 'suggest', text: 'Show all categories' }]
            )
        }

        // --- JOKES ---
        if (msg.match(/(joke|jokes|funny|hasao|mazak|chutkula|comedy|haha|lol|😂)/)) {
            const jokes = [
                '😂 Ek banda vegetable market gaya aur bola: "Bhaiya ek kilo tamatar do"\n\nDukaandar: "Sir, tamatar 80 rupaye kg hai"\n\nBanda: "Theek hai, to ek kilo 40 rupaye wala paani de do!" 🍅😂',
                '🥬 Q: Sabzi kyu roti hai?\n\nA: Kyunki usko "chop" kiya jaata hai! 😂🔪',
                '🍌 Q: Kela English mein kya hota hai?\n\nA: Banana!\n\nBanda: Okay okay, "kuch bhi" English mein kya hai? 😂',
                '🛒 Ek banda grocery store mein gaya aur cashier se bola: "Bhaiya, aapke paas organic vegetables hain?"\n\nCashier: "Haan sir!"\n\nBanda: "Aur inorganic?"\n\nCashier: "Sir, ye market hai, chemistry lab nahi!" 😂🧪',
                '🥦 Q: Broccoli ne kya kaha jab wo famous hua?\n\nA: "Main finally TREE-mendous hoon!" 🌳😂'
            ]
            return response(jokes[Math.floor(Math.random() * jokes.length)] + '\n\nAur joke chahiye? Ya kuch aur help karoon? 😄')
        }

        // --- AGE / BIRTHDAY ---
        if (msg.match(/(how old|umar|age|birthday|janam din|born)/)) {
            return response('🤖 Main ek AI hoon, toh technically mere paas age nahi hai! Lekin SabziKart store bahut purana aur trusted hai. 😄\n\nAur aapki age? Main hopes kar raha hoon ki aap shopping ke liye kaafi bade hain! 🛒😂')
        }

        // --- WEATHER ---
        if (msg.match(/(weather|mausam|baarish|rain|summer|garmi|sardi|winter|temp|temperature)/)) {
            return response('🌤️ Main toh ek grocery AI hoon - mujhe weather ki koi jaankari nahi! 😅\n\nLekin... agar garmi hai toh **fresh juices** aur **cold drinks** ke liye ingredients check karein! ❄️\n\nAur baarish ke liye **garam chai** wali saamagri! ☕',
                [{ label: '🛒 Products dekhein', action: 'navigate', path: '/products' }])
        }

        // --- COMPLIMENT TO BOT ---
        if (msg.match(/(you are (good|great|awesome|amazing|best|nice)|bahut (accha|acha|badhiya|sahi)|you're (good|great|cool)|smart ai|genius)/)) {
            const complimentReplies = [
                '😊 Shukriya! Aapki taareef sun ke mujhe khushi hoti hai! Aap bhi bahut sahi lag rahe ho! 💚',
                '🌟 Aaww! Thank you! Main aapki help karne mein hamesha best deta hoon! Shopping karते rahein! 🛒',
                '😄 Iske liye dhanyavaad! Ab main aur bhi zyada helpful banne ki koshish karunga! Kya help chahiye?'
            ]
            return response(complimentReplies[Math.floor(Math.random() * complimentReplies.length)])
        }

        // --- BOREDOM ---
        if (msg.match(/(bored|bore|bore ho|kya karun|time pass|timepass|kuch nahi|nothing to do|bakwas karo)/)) {
            return response(
                '😄 Arre boredom? Main hoon na! Let\'s chat!\n\n🎯 **Mujhse ye sab pooch sakte ho:**\n• 😂 "Tell me a joke" - chutkule sunao\n• 🌟 "Tell me a fun fact" - interesting baatein\n• 🛍️ "Best deals" - aaj ki best offers\n• 🌈 "Motivate me" - thodi motivation\n\nOr bas baat karo, main yahan hoon! 💬',
                [
                    { label: '😂 Joke sunao', action: 'suggest', text: 'Tell me a joke' },
                    { label: '🌟 Fun fact', action: 'suggest', text: 'Tell me a fun fact' },
                    { label: '💪 Motivate me', action: 'suggest', text: 'Motivate me' }
                ]
            )
        }

        // --- FUN FACTS ---
        if (msg.match(/(fun fact|interesting|did you know|fact|amazing fact|acchi baat|kuch naya)/)) {
            const facts = [
                '🍅 **Fun Fact:** Technically tomato ek fruit hai, vegetable nahi! Botanically speaking, jo cheez seeds contain kare wo fruit hoti hai. 🤯',
                '🥕 **Did you know?** Gajar (Carrot) originally purple aur yellow colour ki hoti thi! Orange carrots 17th century mein Netherlands mein develop ki gayi thi! 🇳🇱',
                '🧅 **Interesting:** Onion kaatne par aansu isliye aate hain kyunki ismein sul-fur compounds hote hain jo air mein release hote hain! 😭🧅',
                '🥦 **Fun Fact:** Broccoli ka naam Italian word "broccolo" se aaya hai, jiska matlab hai "flowering crest of a cabbage"! 🌸',
                '🍋 **Amazing:** Lemon mein sugar se zyada sugar hoti hai! Lekin uska acidic taste sugar ko chhupa deta hai. 🍋😮'
            ]
            return response(facts[Math.floor(Math.random() * facts.length)] + '\n\nAur poochna? Ya grocery shopping karein? 😊')
        }

        // --- MOTIVATION ---
        if (msg.match(/(motivate|motivation|inspire|sad|udaas|dukhi|depressed|tension|stress)/)) {
            const motivations = [
                '💪 "Har mushkil ek naya mauka hai seekhne ka! Aaj ka din acha jayega - aur fresh vegetables ke saath toh aur bhi acha!" 🥬✨',
                '🌟 "Chote chote kadam bade badlav late hain! Aaj ek healthy meal cook karo - feel good guaranteed!" 🍲💚',
                '😊 "Zindagi mein jo bhi ho, ek acha khana sab theek kar deta hai! Kya banate ho aaj?" 🍱❤️'
            ]
            return response(motivations[Math.floor(Math.random() * motivations.length)],
                [{ label: '🥗 Healthy products dekhein', action: 'navigate', path: '/products' }])
        }

        // --- LANGUAGE SWITCH ---
        if (msg.match(/(speak english|english mein|hindi mein|speak hindi|in english|in hindi|hinglish)/)) {
            return response('😊 Main Hindi, English, aur Hinglish - teeno mein baat kar sakta hoon!\n\n🇮🇳 **Hindi:** Bilkul baat karein\n🇬🇧 **English:** Of course, I can help!\n🔀 **Hinglish:** Yahi toh meri specialty hai!\n\nAap jo bhi language mein comfortable hain, main samjhungaa! 💬')
        }

        // --- RECIPE SUGGESTION ---
        if (msg.match(/(recipe|khana|cook|banana hai|kaise banate|banana sikho|dish|meal|food|sabzi|curry)/)) {
            return response(
                '👨‍🍳 **Recipe Suggestions:**\n\nMain aapko ingredients suggest kar sakta hoon!\n\n🥗 **Sabzi Curry ke liye:** Tomatoes, Onions, Garlic, Ginger, Spices\n🍚 **Simple Dal ke liye:** Lentils, Tomatoes, Onion, Cumin\n🥙 **Stir Fry ke liye:** Mixed Vegetables, Oil, Garlic\n\nInn ingredients ki searching karein:',
                [
                    { label: '🍅 Vegetables dekhein', action: 'navigate', path: '/products/vegetables' },
                    { label: '🛒 All Products', action: 'navigate', path: '/products' }
                ]
            )
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

        // --- CALL GEMINI API FOR ANY UNRECOGNIZED/RANDOM MESSAGE ---
        try {
            const res = await axios.post('/api/chat/message', {
                message: userMsg,
                conversationHistory: conversationRef,
                language: language  // pass selected language
            });
            if (res.data.success && res.data.reply) {
                return response(res.data.reply);
            }
        } catch (err) {
            console.log('Gemini chat error:', err.message);
        }

        // Final fallback if API fails
        return response('🤖 Hmm, kuch samajh nahi aaya. "Show categories", "Tell me a joke", ya koi bhi sawaal poochein! 😊',
            [
                { label: '😂 Joke sunao', action: 'suggest', text: 'Tell me a joke' },
                { label: '🔍 Categories', action: 'suggest', text: 'Show all categories' },
            ]
        )
    }

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage = { type: 'user', text: input, time: new Date() }
        setMessages(prev => [...prev, userMessage])
        const userInput = input
        setInput('')
        setIsTyping(true)

        // Process message — pass current messages as conversation history for Gemini context
        const currentMessages = [...messages, userMessage];
        const botData = await processMessage(userInput, currentMessages)
        const botMsg = {
            type: 'bot',
            text: botData.text,
            options: botData.options,
            time: new Date()
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
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
                    <div className='bg-gradient-to-r from-primary to-green-600 text-white p-3 flex items-center gap-3'>
                        <div className='w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg flex-shrink-0'>
                            🤖
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h3 className='font-bold text-sm'>SabziKart AI</h3>
                            <p className='text-xs text-white/80 flex items-center gap-1'>
                                <span className='w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse'></span>
                                {complaintMode ? 'Listening...' : 'Ask me anything!'}
                            </p>
                        </div>
                        {/* Language switcher */}
                        <div className='flex items-center gap-1 bg-white/20 rounded-full px-1 py-0.5'>
                            {[['EN', 'english'], ['हि', 'hindi'], ['Hi-En', 'hinglish']].map(([label, val]) => (
                                <button
                                    key={val}
                                    onClick={() => setLanguage(val)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${language === val ? 'bg-white text-primary' : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsOpen(false)} className='text-white/70 hover:text-white text-xl cursor-pointer ml-1'>✕</button>
                    </div>

                    {/* Tab Switcher */}
                    <div className='flex border-b border-gray-200 bg-white'>
                        <button
                            onClick={() => setChatTab('chat')}
                            className={`flex-1 py-2 text-xs font-semibold transition cursor-pointer ${chatTab === 'chat'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            💬 Chat
                        </button>
                        <button
                            onClick={() => setChatTab('categories')}
                            className={`flex-1 py-2 text-xs font-semibold transition cursor-pointer ${chatTab === 'categories'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            🛍️ Categories
                        </button>
                    </div>

                    {/* CATEGORIES TAB */}
                    {chatTab === 'categories' && (
                        <div className='flex-1 overflow-y-auto p-3 bg-gray-50'>
                            <p className='text-xs text-gray-500 mb-3 font-medium'>📂 Sabhi categories — click karke browse karein:</p>
                            <div className='grid grid-cols-2 gap-2'>
                                {assetCategories.map((cat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { navigate(`/products/${cat.path.toLowerCase()}`); setIsOpen(false); }}
                                        className='flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer text-center group'
                                        style={{ backgroundColor: cat.bgColor }}
                                    >
                                        <img src={cat.image} alt={cat.text} className='w-12 h-12 object-contain group-hover:scale-110 transition-transform' />
                                        <span className='text-xs font-semibold text-gray-700'>{cat.text}</span>
                                    </button>
                                ))}
                                {/* View All Products */}
                                <button
                                    onClick={() => { navigate('/products'); setIsOpen(false); }}
                                    className='flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:shadow-md transition-all cursor-pointer text-center col-span-2 bg-primary/5'
                                >
                                    <span className='text-2xl'>🛒</span>
                                    <span className='text-xs font-semibold text-primary'>View All Products</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {chatTab === 'chat' && (
                        <>
                            {/* Messages */}
                            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50'>
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                            ? 'bg-primary text-white rounded-br-sm'
                                            : (msg.text.includes('Complaint Registered') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100')
                                            }`}>
                                            <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                                            <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                                {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {/* Options/Action Chips — below the bubble, full width */}
                                        {msg.options && msg.options.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[90%]">
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
                        </>
                    )}
                </div>
            )}
        </>
    )
}

export default ChatBot
