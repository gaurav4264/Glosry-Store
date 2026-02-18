import React from 'react';
import { assets } from '../assets/assets';

const AboutUs = () => {
    return (
        <div className="mt-12 pb-16 max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About SabziKart</h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">Freshness you can trust, delivered with love to your doorstep.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div className="bg-primary/5 rounded-3xl p-4">
                    <img src={assets.organic_vegitable_image} alt="Fresh Veggies" className="rounded-2xl shadow-lg w-full object-cover h-[350px]" />
                </div>
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Founded with a passion for health and convenience, SabziKart aims to bridge the gap between local farms and your kitchen. We believe that everyone deserves access to fresh, organic, and affordable produce without the hassle of traditional markets.
                    </p>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">Direct from Farms:</span> We source our produce daily to ensure maximum nutrient retention and taste.</p>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold">✓</div>
                            <p className="text-sm text-gray-600"><span className="font-bold text-gray-800">Smart Technology:</span> Using AI-powered features like Smart Pantry, we help you reduce waste and save money.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-[2rem] p-10 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <h2 className="text-3xl font-bold mb-6">Why Choose Us?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-primary">30m</p>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Fast Delivery</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-primary">100%</p>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Organic Certified</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-bold text-primary">₹0</p>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Hidden Charges</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
