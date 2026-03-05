import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [open, setOpen] = React.useState(false)
  const { user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout')
      if (data.success) {
        toast.success(data.message)
        setUser(null);
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products")
    }
  }, [searchQuery])

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">

      <NavLink to='/' onClick={() => setOpen(false)}>
        <img className="h-10 md:h-12" src={assets.logo} alt="SabziKart Logo" />
      </NavLink>

      <div className="hidden sm:flex items-center gap-8">
        <NavLink to='/'>Home</NavLink>
        <NavLink to='/products'>All Product</NavLink>
        <NavLink to='/contact'>Contact</NavLink>

        {/* Smart Features Dropdown */}
        <div className='relative group'>
          <button className='flex items-center gap-1.5 cursor-pointer text-gray-700 hover:text-primary font-medium transition-all duration-300'>
            <span className='bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-0.5 rounded-full'>AI</span>
            Smart
            <svg className='w-3 h-3 transition-transform duration-300 group-hover:rotate-180' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path></svg>
          </button>
          <div className='invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-10 -left-4 bg-white shadow-xl border border-gray-100 py-3 w-64 rounded-2xl text-sm z-50 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2'>
            <p className='px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>AI-Powered Features</p>
            <div onClick={() => navigate('/smart-pantry')} className='px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center gap-3 transition-colors duration-200'>
              <span className='text-lg w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center'>🥬</span>
              <div><p className='font-medium text-gray-800'>Smart Pantry</p><p className='text-[11px] text-gray-400'>Track expiry & reduce waste</p></div>
            </div>
            <div onClick={() => navigate('/budget-bag')} className='px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors duration-200'>
              <span className='text-lg w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>💰</span>
              <div><p className='font-medium text-gray-800'>Budget Bag</p><p className='text-[11px] text-gray-400'>AI fills your cart smartly</p></div>
            </div>
            <div onClick={() => navigate('/health-profile')} className='px-4 py-2.5 hover:bg-rose-50 cursor-pointer flex items-center gap-3 transition-colors duration-200 border-t border-gray-100 mt-1'>
              <span className='text-lg w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center'>🩺</span>
              <div><p className='font-medium text-gray-800'>Health Advisor</p><p className='text-[11px] text-gray-400'>AI grocery picks for your health</p></div>
            </div>
            <div onClick={() => navigate('/complaint')} className='px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors duration-200'>
              <span className='text-lg w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center'>📢</span>
              <div><p className='font-medium text-gray-800'>Raise Complaint</p><p className='text-[11px] text-gray-400'>We are here to help</p></div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
          <input onChange={(e) => setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
          <img src={assets.search_icon} alt='search' className='w-4 h-4' />
        </div>

        <div onClick={() => navigate("/wishlist")} className="relative cursor-pointer" title="Wishlist">
          <span className="text-2xl">💖</span>
        </div>

        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>

        {!user ? (<button onClick={() => setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
          Login
        </button>)
          :
          (
            <div className='relative group'>
              {user.profilePhoto ? (
                <img src={user.profilePhoto} className='w-10 h-10 rounded-full object-cover border-2 border-primary/30 cursor-pointer' alt="profile" />
              ) : (
                <img src={assets.profile_icon} className='w-10' alt="" />
              )}
              <ul className='hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40'>
                <li onClick={() => navigate("/profile")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>👤 My Profile</li>
                <li onClick={() => navigate("/my-orders")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>My Orders</li>
                <li onClick={() => navigate("/wishlist")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>💖 Wishlist</li>
                <li onClick={() => navigate("/loyalty")} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>💎 Loyalty Points</li>
                <li onClick={logout} className='p-1.5 pl-3 hover:bg-primary/10 cursor-pointer'>Logout</li>
              </ul>
            </div>
          )}
      </div>

      <div className='flex items-center gap-6 sm:hidden'>
        <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
          <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80' />
          <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
        </div>
        <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu" className="">
          <img src={assets.menu_icon} alt='menu' />
        </button>
      </div>


      {open && (
        <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-sm md:hidden`}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>All Product</NavLink>
          {user &&
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)}>👤 My Profile</NavLink>
              <NavLink to="/my-orders" onClick={() => setOpen(false)}>My Orders</NavLink>
              <NavLink to="/wishlist" onClick={() => setOpen(false)}>💖 Wishlist</NavLink>
              <NavLink to="/loyalty" onClick={() => setOpen(false)}>💎 Loyalty Points</NavLink>
              <NavLink to="/smart-pantry" onClick={() => setOpen(false)}>🥬 Smart Pantry</NavLink>
              <NavLink to="/budget-bag" onClick={() => setOpen(false)}>💰 Budget Bag</NavLink>
              <NavLink to="/health-profile" onClick={() => setOpen(false)}>🩺 Health Advisor</NavLink>
            </>
          }
          <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>

          {!user ? (
            <button onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
              Login
            </button>
          ) : (
            <button onClick={logout} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
              Logout
            </button>
          )}

        </div>
      )}

    </nav>
  )
}

export default Navbar
