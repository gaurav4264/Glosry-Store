import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const SellerLayout = () => {

    const { axios, navigate } = useAppContext();
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        try {
            const { data } = await axios.get('/api/product/low-stock-alerts');
            if (data.success) {
                setLowStockCount(data.count);
                if (data.count > 0) {
                    toast.error(`⚠️ Alert: ${data.count} product(s) in the store are low on stock!`, {
                        duration: 5000,
                        position: 'top-right',
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching admin low stock:', error);
        }
    };


    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon, badge: lowStockCount },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
        { name: "Analytics", path: "/seller/analytics", icon: assets.order_icon },
        { name: "Inventory Alerts", path: "/seller/inventory-alerts", icon: assets.product_list_icon },
        { name: "Waste Reducer", path: "/seller/waste-reducer", icon: assets.product_list_icon },
        { name: "Report", path: "/seller/report", icon: assets.order_icon },
        { name: "Complaints", path: "/seller/complaints", icon: assets.order_icon },
        { name: "Vendor Applications", path: "/seller/vendor-applications", icon: assets.add_icon },
        { name: "Registered Shops", path: "/seller/vendors", icon: assets.product_list_icon },
        { name: "All Orders", path: "/seller/all-orders", icon: assets.order_icon },
        { name: "Owner Profile", path: "/seller/owner-profile", icon: assets.add_icon },
    ];

    const logout = async () => {
        try {
            const { data } = await axios.get('/api/seller/logout');
            if (data.success) {
                toast.success(data.message)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white flex-shrink-0 z-10 relative">
                <Link to='/'>
                    <img src={assets.logo} alt="SabziKart Logo" className="cursor-pointer h-10 md:h-12" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p>Hi! Admin</p>
                    <button onClick={logout} className='border rounded-full text-sm px-4 py-1'>Logout</button>
                </div>
            </div>
            <div className="flex h-[calc(100vh-72px)] overflow-hidden">
                <div className="md:w-64 w-16 border-r text-base border-gray-300 pt-4 flex flex-col overflow-y-auto no-scrollbar pb-10 flex-shrink-0 bg-white">
                    {sidebarLinks.map((item) => (
                        <NavLink to={item.path} key={item.name} end={item.path === "/seller"}
                            className={({ isActive }) => `flex items-center justify-between py-3 px-4 gap-3 
                            ${isActive ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                    : "hover:bg-gray-100/90 border-white"
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <img src={item.icon} alt="" className="w-7 h-7 flex-shrink-0" />
                                <p className="md:block hidden text-center">{item.name}</p>
                            </div>
                            {item.badge > 0 && (
                                <span className="hidden md:block bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                            {item.badge > 0 && (
                                <span className="md:hidden absolute ml-5 -mt-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"></span>
                            )}
                        </NavLink>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    <Outlet />
                </div>
            </div>

        </>
    );
};

export default SellerLayout;