import React from 'react';

const TermsAndConditions = () => {
    return (
        <div className="mt-12 pb-16 max-w-4xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6 text-gray-600 leading-relaxed">
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
                    <p>By accessing and using SabziKart, you agree to be bound by these terms and conditions. If you do not agree, please do not use our services.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">2. User Accounts</h2>
                    <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">3. Product Accuracy</h2>
                    <p>We strive to display our products as accurately as possible. However, we do not guarantee that product descriptions or other content are error-free.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">4. Limitation of Liability</h2>
                    <p>SabziKart shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our website or services.</p>
                </section>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-8 text-sm">
                    <p className="font-semibold text-amber-700">Project Disclaimer:</p>
                    <p>SabziKart is an educational research project. Any brand names, logos, or products shown are for demonstration purposes only. This platform does not facilitate real-world commercial transactions.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
