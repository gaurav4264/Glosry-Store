import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from './ProductCard';

const RecentlyViewed = () => {

    const { products } = useAppContext();
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (products.length > 0 && viewedIds.length > 0) {
            const viewedItems = viewedIds.map(id => products.find(p => p._id === id)).filter(Boolean);
            setRecentProducts(viewedItems);
        }
    }, [products])

    if (recentProducts.length === 0) return null;

    return (
        <div className='my-24'>
            <div className="text-center py-8 text-3xl">
                <span className='text-gray-500'>RECENTLY</span> <span className='text-gray-700 font-medium'>VIEWED</span>
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    Pick up where you left off.
                </p>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                {recentProducts.map((item, index) => (
                    <ProductCard key={index} product={item} />
                ))}
            </div>
        </div>
    )
}

export default RecentlyViewed
