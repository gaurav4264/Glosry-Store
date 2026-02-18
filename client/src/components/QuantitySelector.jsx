import React from 'react';

const QuantitySelector = ({ quantity, setQuantity, maxStock = 999, minQuantity = 1 }) => {
    const decrease = () => {
        if (quantity > minQuantity) {
            setQuantity(quantity - 1);
        }
    };

    const increase = () => {
        if (quantity < maxStock) {
            setQuantity(quantity + 1);
        }
    };

    const handleChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= minQuantity && value <= maxStock) {
            setQuantity(value);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={decrease}
                disabled={quantity <= minQuantity}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
            >
                −
            </button>

            <input
                type="number"
                value={quantity}
                onChange={handleChange}
                min={minQuantity}
                max={maxStock}
                className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-medium"
            />

            <button
                onClick={increase}
                disabled={quantity >= maxStock}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-lg"
            >
                +
            </button>

            {maxStock < 10 && maxStock > 0 && (
                <span className="text-sm text-orange-600 ml-2">
                    Only {maxStock} left!
                </span>
            )}
        </div>
    );
};

export default QuantitySelector;
