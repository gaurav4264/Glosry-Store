import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="mt-12 pb-16 max-w-4xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include your name, email, phone number, and address.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, process your transactions, and communicate with you about your orders and promotional offers.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">3. Data Security</h2>
                    <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">4. Cookies</h2>
                    <p>We use cookies to enhance your experience, remember your preferences, and analyze how you use our website.</p>
                </section>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-8 text-sm">
                    <p className="font-semibold text-primary">Note:</p>
                    <p>This is a demonstration project for educational purposes. No real payment data or sensitive personal information is stored or processed for commercial use.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
