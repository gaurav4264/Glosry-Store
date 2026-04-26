import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/chat/message
export const chatMessage = async (req, res) => {
    try {
        const { message, conversationHistory = [], language = 'hinglish' } = req.body;

        if (!message || !message.trim()) {
            return res.json({ success: false, message: 'Message is required' });
        }

        // Language instruction
        const langInstruction = {
            hindi: 'IMPORTANT: Always respond ONLY in Hindi (Devanagari script like: "नमस्ते! आपकी क्या मदद करूं?"). Use pure Hindi.',
            english: 'IMPORTANT: Always respond ONLY in English. Do not use Hindi words at all.',
            hinglish: 'IMPORTANT: Respond in Hinglish — casual mix of Hindi and English (like: "Aaj main aapki help karta hoon! 😊"). This is the default.',
        }[language] || 'Respond in Hinglish (Hindi + English mix).';

        const systemContext = `You are SabziKart AI, a friendly and helpful AI assistant for "SabziKart" (Gaurav Grocery Store) - an online grocery store in India.

${langInstruction}

Your personality:
- Friendly, warm, conversational — like a helpful friend
- Use relevant emojis to make responses fun
- Keep responses concise (2-5 sentences), but thorough when needed
- Answer ANY question — groceries, general knowledge, jokes, recipes, history, math, science, or casual small talk
- You are a GENERAL PURPOSE AI that ALSO specializes in grocery shopping
- For grocery questions, mention store products/services
- For general questions (science, math, facts, jokes, weather, etc.), answer naturally and helpfully

Store info (use when relevant):
- Store: SabziKart - Gaurav Grocery Store
- Products: vegetables, fruits, dairy, grains, spices, snacks
- Contact: Gaurav, +91 6207364264
- Services: home delivery (1-2 hrs), COD & online payment, loyalty points, free delivery ₹500+

RULES:
- NEVER refuse to answer — always be helpful
- Don't use markdown headers (##)
- Use simple formatting with emojis and bullet points (•)
- Stay positive and friendly always`;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_key_here' || apiKey === '' || apiKey.includes('gemini_api_key_here')) {
            return res.json({ success: true, reply: getSmartFallback(message, language) });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const history = conversationHistory.slice(-6)
            .map(msg => ({ role: msg.type === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }))
            .filter(m => m.parts[0].text);

        const chat = model.startChat({
            history,
            generationConfig: { maxOutputTokens: 350, temperature: 0.85 },
            systemInstruction: systemContext,
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        return res.json({ success: true, reply: reply.trim() });

    } catch (error) {
        console.log('Chat error:', error.message);
        return res.json({ success: true, reply: getSmartFallback(req.body.message || '', req.body.language) });
    }
};

// Smart fallback replies when API is not available
function getSmartFallback(msg, language = 'hinglish') {
    const m = (msg || '').toLowerCase();
    const isEnglish = language === 'english';
    const isHindi = language === 'hindi';

    if (m.match(/how are|kaise ho|what's up|wassup/))
        return isEnglish ? '😊 I\'m doing great! How can I help you today? 🛒'
            : isHindi ? '😊 मैं बिल्कुल ठीक हूं! आज क्या चाहिए? 🛒'
                : '😊 Main ekdum theek hoon! Aap batao, kya chahiye aaj? 🛒';
    if (m.match(/joke|mazak|funny|hasao/))
        return isEnglish ? '😂 A man walked into a grocery store and said "Give me the freshest thing you have." The shopkeeper handed him a mirror! 😄'
            : isHindi ? '😂 एक बंदा दुकान पर आया - "सबसे ताज़ी चीज़ दो!" दुकानदार ने आईना दे दिया! 😄'
                : '😂 Ek banda store aaya, bola "bhaiya sabse fresh cheez do" - dukaandar ne aaina dikha diya! 😄';
    if (m.match(/name|kaun|who are/))
        return isEnglish ? '🤖 I\'m SabziKart AI — your grocery store assistant! Ask me anything! 😊'
            : isHindi ? '🤖 मैं SabziKart AI हूं — आपका किराना सहायक! कुछ भी पूछिए! 😊'
                : '🤖 Main hoon SabziKart AI - Gaurav Grocery ka digital dost! Kuch bhi poochho! 😊';
    if (m.match(/thank|shukriya|dhanyavaad/))
        return isEnglish ? '🙏 Thank you! Happy shopping! 🛒✨'
            : isHindi ? '🙏 आपका धन्यवाद! खुशी से खरीदारी करें! 🛒✨'
                : '🙏 Aapka shukriya! Happy shopping karo! 🛒✨';
    if (m.match(/bye|alvida|goodbye/))
        return isEnglish ? '👋 Goodbye! Come back soon! 😊'
            : isHindi ? '👋 अलविदा! जल्दी वापस आइए! 😊'
                : '👋 Alvida! Jaldi wapas aana! 😊';

    return isEnglish
        ? `🤖 That's an interesting question! I'm SabziKart AI — I can help with groceries and much more. Try asking me anything! 😊`
        : isHindi
            ? `🤖 यह दिलचस्प सवाल है! मैं किराना और सामान्य सवालों दोनों में मदद कर सकता हूं। 😊`
            : `🤖 Interesting sawaal! Main grocery aur general questions dono mein help karta hoon. Kuch bhi poochho! 😊`;
}
