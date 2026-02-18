import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import SellerLogin from './components/seller/SellerLogin';
import Loading from './components/Loading';

// Pages
import Home from './pages/Home';
import AllProducts from './pages/AllProducts';
import ProductDetails from './pages/ProductDetails';
import ProductCategory from './pages/ProductCategory';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';
import AddAddress from './pages/AddAddress';
import NearbyShops from './pages/NearbyShops';
import ShopsByCategory from './pages/ShopsByCategory';
import Contact from './pages/Contact';
import SmartPantry from './pages/SmartPantry';
import BudgetBag from './pages/BudgetBag';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import AboutUs from './pages/AboutUs';
import RefundPolicy from './pages/RefundPolicy';
import UserComplaint from './pages/UserComplaint';

// Seller Pages
// Seller Pages (Lazy Loaded)
const SellerLayout = React.lazy(() => import('./pages/seller/SellerLayout'));
const AddProduct = React.lazy(() => import('./pages/seller/AddProduct'));
const ProductList = React.lazy(() => import('./pages/seller/ProductList'));
const Orders = React.lazy(() => import('./pages/seller/Orders'));
const Analytics = React.lazy(() => import('./pages/seller/Analytics'));
const InventoryAlerts = React.lazy(() => import('./pages/seller/InventoryAlerts'));
const WasteReducer = React.lazy(() => import('./pages/seller/WasteReducer'));
const OwnerProfile = React.lazy(() => import('./pages/seller/OwnerProfile'));
const SellerReport = React.lazy(() => import('./pages/seller/SellerReport'));
const SellerComplaints = React.lazy(() => import('./pages/seller/SellerComplaints'));

// Components
import LoyaltyPoints from './components/LoyaltyPoints';
import ChatBot from './components/ChatBot';

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const { showUserLogin, isSeller } = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>

      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}

      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} `}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/track-order' element={<TrackOrder />} />
          <Route path='/nearby-shops' element={<NearbyShops />} />
          <Route path='/shops-by-category' element={<ShopsByCategory />} />
          <Route path='/loader' element={<Loading />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/smart-pantry' element={<SmartPantry />} />
          <Route path='/budget-bag' element={<BudgetBag />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<TermsAndConditions />} />
          <Route path='/about' element={<AboutUs />} />
          <Route path='/refund-policy' element={<RefundPolicy />} />
          <Route path='/complaint' element={<UserComplaint />} />
          <Route path='/seller' element={isSeller ? <React.Suspense fallback={<Loading />}><SellerLayout /></React.Suspense> : <SellerLogin />}>
            <Route index element={isSeller ? <React.Suspense fallback={<Loading />}><AddProduct /></React.Suspense> : null} />
            <Route path='product-list' element={<React.Suspense fallback={<Loading />}><ProductList /></React.Suspense>} />
            <Route path='orders' element={<React.Suspense fallback={<Loading />}><Orders /></React.Suspense>} />
            <Route path='complaints' element={<React.Suspense fallback={<Loading />}><SellerComplaints /></React.Suspense>} />
            <Route path='analytics' element={<React.Suspense fallback={<Loading />}><Analytics /></React.Suspense>} />
            <Route path='inventory-alerts' element={<React.Suspense fallback={<Loading />}><InventoryAlerts /></React.Suspense>} />
            <Route path='waste-reducer' element={<React.Suspense fallback={<Loading />}><WasteReducer /></React.Suspense>} />
            <Route path='owner-profile' element={<React.Suspense fallback={<Loading />}><OwnerProfile /></React.Suspense>} />
            <Route path='report' element={<React.Suspense fallback={<Loading />}><SellerReport /></React.Suspense>} />
          </Route>
          <Route path='/loyalty' element={<LoyaltyPoints />} />
        </Routes>
      </div>
      {!isSellerPath && <ChatBot />}
      {!isSellerPath && <Footer />}
    </div>
  )
}

export default App
