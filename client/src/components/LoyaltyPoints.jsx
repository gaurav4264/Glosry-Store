import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const LoyaltyPoints = () => {
    const { user, axios, currency } = useAppContext();
    const [loyaltyData, setLoyaltyData] = useState(null);
    const [pointsToRedeem, setPointsToRedeem] = useState(100);

    useEffect(() => {
        fetchLoyaltyPoints();
    }, []);

    const fetchLoyaltyPoints = async () => {
        try {
            const { data } = await axios.post('/api/loyalty/points');
            if (data.success) {
                setLoyaltyData(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRedeem = async () => {
        if (!loyaltyData || pointsToRedeem > loyaltyData.loyaltyPoints) {
            toast.error('Insufficient points');
            return;
        }

        try {
            const { data } = await axios.post('/api/loyalty/redeem', { pointsToRedeem });
            if (data.success) {
                toast.success(`Redeemed ${pointsToRedeem} points for ${currency}${data.discountAmount} discount!`);
                fetchLoyaltyPoints();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getTierColor = (tier) => {
        if (tier === 'Gold') return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
        if (tier === 'Silver') return 'bg-gradient-to-r from-gray-300 to-gray-500';
        return 'bg-gradient-to-r from-amber-600 to-amber-800';
    };

    const getTierBenefit = (tier) => {
        if (tier === 'Gold') return 'Exclusive deals + Free delivery';
        if (tier === 'Silver') return 'Priority support + Special offers';
        return 'Earn points on every purchase';
    };

    if (!loyaltyData) {
        return <div className="text-center py-8">Loading loyalty information...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6">💎 Loyalty Rewards</h2>

            {/* Membership Tier Card */}
            <div className={`${getTierColor(loyaltyData.membershipTier)} text-white rounded-2xl p-6 mb-6 shadow-lg`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-90">Membership Tier</p>
                        <h3 className="text-3xl font-bold">{loyaltyData.membershipTier}</h3>
                        <p className="text-sm mt-2">{getTierBenefit(loyaltyData.membershipTier)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-90">Total Spent</p>
                        <h3 className="text-2xl font-bold">{currency}{loyaltyData.totalSpent.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            {/* Points Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-gray-600 text-sm">Available Points</p>
                        <h3 className="text-4xl font-bold text-primary">{loyaltyData.loyaltyPoints}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            = {currency}{((loyaltyData.loyaltyPoints / 100) * 10).toFixed(2)} in rewards
                        </p>
                    </div>
                    <div className="text-6xl">🎁</div>
                </div>

                {/* Redeem Section */}
                {loyaltyData.loyaltyPoints >= 100 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Redeem Points
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="100"
                                step="100"
                                value={pointsToRedeem}
                                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-primary"
                                placeholder="Points (min 100)"
                            />
                            <button
                                onClick={handleRedeem}
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
                            >
                                Redeem
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            100 points = {currency}10 discount
                        </p>
                    </div>
                )}
            </div>

            {/* How it Works */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4">How to Earn More Points</h4>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🛒</span>
                        <div>
                            <p className="font-medium">Shop</p>
                            <p className="text-sm text-gray-600">Earn 1 point for every {currency}10 spent</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⭐</span>
                        <div>
                            <p className="font-medium">Level Up</p>
                            <p className="text-sm text-gray-600">
                                Silver: {currency}5,000+ | Gold: {currency}10,000+
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                            <p className="font-medium">Redeem</p>
                            <p className="text-sm text-gray-600">100 points = {currency}10 discount</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyPoints;
