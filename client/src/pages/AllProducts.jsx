import React, { useEffect, useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const AllProducts = () => {

  const { products, searchQuery } = useAppContext()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minRating, setMinRating] = useState(0)

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))]
    return cats.sort()
  }, [products])

  // Calculate average rating for a product
  const getAvgRating = (product) => {
    if (!product.ratings || product.ratings.length === 0) return 0
    return product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length
  }

  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.length > 0) {
      result = result.filter(
        product => product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory)
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter(product => getAvgRating(product) >= minRating)
    }

    // Only in stock - REMOVED to show out of stock items
    // result = result.filter(product => product.inStock)

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.offerPrice - b.offerPrice)
        break
      case 'price-high':
        result.sort((a, b) => b.offerPrice - a.offerPrice)
        break
      case 'rating':
        result.sort((a, b) => getAvgRating(b) - getAvgRating(a))
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, searchQuery, sortBy, selectedCategory, minRating])

  const clearFilters = () => {
    setSortBy('default')
    setSelectedCategory('all')
    setMinRating(0)
  }

  return (
    <div className='mt-16 flex flex-col'>
      <div className='flex flex-col items-end w-max'>
        <p className='text-2xl font-medium uppercase'>All products</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {/* Filters & Sorting Bar */}
      <div className='flex flex-wrap items-center gap-3 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>

        {/* Category Filter */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-600'>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-primary'
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-600'>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white outline-none focus:border-primary'
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium text-gray-600'>Min Rating:</label>
          <div className='flex gap-1'>
            {[0, 1, 2, 3, 4].map((star) => (
              <button
                key={star}
                onClick={() => setMinRating(star === minRating ? 0 : star)}
                className={`px-2 py-1 text-sm rounded-md border transition cursor-pointer
                                    ${minRating === star && star > 0
                    ? 'bg-yellow-400 text-white border-yellow-400'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400'
                  }`}
              >
                {star === 0 ? 'All' : `${star}★+`}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(sortBy !== 'default' || selectedCategory !== 'all' || minRating > 0) && (
          <button
            onClick={clearFilters}
            className='ml-auto text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer transition'
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      <p className='text-sm text-gray-500 mt-3'>{filteredProducts.length} products found</p>

      {/* Products Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-4'>
        {filteredProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className='text-center py-16 text-gray-400'>
          <p className='text-5xl mb-4'>🔍</p>
          <p className='text-lg font-medium'>No products found</p>
          <p className='text-sm mt-1'>Try changing your filters</p>
          <button onClick={clearFilters} className='mt-4 px-6 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary-dull transition'>
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  )
}

export default AllProducts
