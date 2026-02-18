import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import BottomBanner from '../components/BottomBanner'
import NewsLetter from '../components/NewsLetter'
import Recommendations from '../components/Recommendations'
import RecentlyViewed from '../components/RecentlyViewed'

const Home = () => {
  return (
    <div className='mt-10'>
      <MainBanner />
      <Categories />
      <Recommendations />
      <RecentlyViewed />
      <BestSeller />
      <BottomBanner />
      <NewsLetter />
    </div>
  )
}

export default Home
