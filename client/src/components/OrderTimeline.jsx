import React from 'react'

const steps = [
    { key: 'Order Placed', label: 'Order Placed', icon: '📦' },
    { key: 'Packing', label: 'Packing', icon: '📋' },
    { key: 'Shipped', label: 'Shipped', icon: '🚚' },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: '🏍️' },
    { key: 'Delivered', label: 'Delivered', icon: '✅' },
]

const OrderTimeline = ({ status }) => {
    const currentIndex = steps.findIndex(s => s.key === status)
    const progress = currentIndex >= 0 ? currentIndex : 0

    return (
        <div className="w-full mt-4 mb-2">
            {/* Progress Bar */}
            <div className="relative flex items-center justify-between w-full">
                {/* Background line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 rounded-full z-0"></div>
                {/* Active line */}
                <div
                    className="absolute top-5 left-[10%] h-1 bg-green-500 rounded-full z-0 transition-all duration-700 ease-in-out"
                    style={{ width: `${(progress / (steps.length - 1)) * 80}%` }}
                ></div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const isCompleted = index <= progress
                    const isCurrent = index === progress

                    return (
                        <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500
                                    ${isCompleted
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                        : 'bg-gray-200 text-gray-400'
                                    }
                                    ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                                `}
                            >
                                {step.icon}
                            </div>
                            <p className={`text-xs mt-2 text-center font-medium transition-colors duration-300
                                ${isCompleted ? 'text-green-600' : 'text-gray-400'}
                                ${isCurrent ? 'font-bold' : ''}
                            `}>
                                {step.label}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OrderTimeline
