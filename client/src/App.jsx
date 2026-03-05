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
import HealthProfile from './pages/HealthProfile';

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
const AdminSellerApplications = React.lazy(() => import('./pages/seller/AdminSellerApplications'));
const AdminSellerDetail = React.lazy(() => import('./pages/seller/AdminSellerDetail'));
const AdminAllOrders = React.lazy(() => import('./pages/seller/AdminAllOrders'));
const AdminVendors = React.lazy(() => import('./pages/seller/AdminVendors'));

// Vendor Dashboard Pages (Lazy)
const VendorLayout = React.lazy(() => import('./pages/vendor/VendorLayout'));
const VendorDashboard = React.lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorAddProduct = React.lazy(() => import('./pages/vendor/VendorAddProduct'));
const VendorProducts = React.lazy(() => import('./pages/vendor/VendorProducts'));
const VendorOrders = React.lazy(() => import('./pages/vendor/VendorOrders'));
const VendorProfile = React.lazy(() => import('./pages/vendor/VendorProfile'));

// Multi-vendor Registration Pages
import SellerRegister from './pages/seller/SellerRegister';
import SellerRegistrationSuccess from './pages/seller/SellerRegistrationSuccess';
import SellerStatus from './pages/seller/SellerStatus';
import SellerSetPassword from './pages/seller/SellerSetPassword';
import SellerVendorLogin from './pages/seller/SellerVendorLogin';

// Components
import LoyaltyPoints from './components/LoyaltyPoints';
import ChatBot from './components/ChatBot';

const App = () => {

  const pathname = useLocation().pathname;
  const isSellerPath = pathname.startsWith('/seller');
  const isVendorPath = pathname.startsWith('/vendor');
  const hidePrimary = isSellerPath || isVendorPath;
  const { showUserLogin, isSeller } = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>

      {hidePrimary ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}

      <Toaster />

      <div className={`${hidePrimary ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"} `}>
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
          <Route path='/health-profile' element={<HealthProfile />} />
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
            <Route path='vendor-applications' element={<React.Suspense fallback={<Loading />}><AdminSellerApplications /></React.Suspense>} />
            <Route path='vendor-applications/:id' element={<React.Suspense fallback={<Loading />}><AdminSellerDetail /></React.Suspense>} />
            <Route path='all-orders' element={<React.Suspense fallback={<Loading />}><AdminAllOrders /></React.Suspense>} />
            <Route path='vendors' element={<React.Suspense fallback={<Loading />}><AdminVendors /></React.Suspense>} />
          </Route>
          <Route path='/seller-register' element={<SellerRegister />} />
          <Route path='/seller-register/success' element={<SellerRegistrationSuccess />} />
          <Route path='/seller-status' element={<SellerStatus />} />
          <Route path='/seller-set-password' element={<SellerSetPassword />} />
          <Route path='/seller-vendor-login' element={<SellerVendorLogin />} />
          {/* Vendor Dashboard — Separate from Admin */}
          <Route path='/vendor' element={<React.Suspense fallback={<Loading />}><VendorLayout /></React.Suspense>}>
            <Route index element={<React.Suspense fallback={<Loading />}><VendorDashboard /></React.Suspense>} />
            <Route path='add-product' element={<React.Suspense fallback={<Loading />}><VendorAddProduct /></React.Suspense>} />
            <Route path='products' element={<React.Suspense fallback={<Loading />}><VendorProducts /></React.Suspense>} />
            <Route path='orders' element={<React.Suspense fallback={<Loading />}><VendorOrders /></React.Suspense>} />
            <Route path='reviews' element={<React.Suspense fallback={<Loading />}><VendorProducts /></React.Suspense>} />
            <Route path='profile' element={<React.Suspense fallback={<Loading />}><VendorProfile /></React.Suspense>} />
          </Route>
          <Route path='/loyalty' element={<LoyaltyPoints />} />
        </Routes>
      </div>
      {!hidePrimary && <ChatBot />}
      {!hidePrimary && <Footer />}
    </div>
  )
}

export default App
