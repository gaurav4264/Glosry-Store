import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RefundPolicy = () => {
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState('');

    const handleRequest = (e) => {
        e.preventDefault();
        if (!orderId) {
            toast.error('Please enter your Order ID');
            return;
        }
        toast.success('Return request received! Our team will contact you.');
        setOrderId('');
    };

    return (
        <div className="mt-12 pb-16 max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Refund & Returns Center</h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">Need a hand with your order? We're here to help.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Policy Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">01</span>
                                Eligibility for Returns
                            </h2>
                            <p>To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. Perishable goods such as fresh fruits and vegetables are eligible for return only at the time of delivery.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">02</span>
                                Refund Timeline
                            </h2>
                            <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">03</span>
                                Non-Returnable Items
                            </h2>
                            <p>Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products).</p>
                        </section>
                    </div>

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 italic text-sm text-red-800 text-center">
                        <span className="font-bold">Important Notice:</span> SabziKart is an educational prototype. This page is for demonstration purposes only. No real returns or refunds will be processed via this interface.
                    </div>
                </div>

                {/* Interactive Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Request a Return</h3>
                        <form onSubmit={handleRequest} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1 font-medium uppercase">Order ID</label>
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    placeholder="e.g. #ORD12345"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
                                />
                            </div>
                            <button className="w-full bg-primary hover:bg-primary-dull text-white py-3 rounded-lg font-bold text-sm transition shadow-lg shadow-primary/20">
                                Submit Request
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-gray-900 font-bold mb-4">Quick Help</h3>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/contact')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group text-sm font-medium text-gray-600">
                                💬 Contact Support
                                <span className="text-gray-300 group-hover:text-primary">→</span>
                            </button>
                            <button onClick={() => navigate('/track-order')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group text-sm font-medium text-gray-600">
                                🚚 Track Order
                                <span className="text-gray-300 group-hover:text-primary">→</span>
                            </button>
                            <button onClick={() => navigate('/my-orders')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group text-sm font-medium text-gray-600">
                                📦 Order History
                                <span className="text-gray-300 group-hover:text-primary">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
