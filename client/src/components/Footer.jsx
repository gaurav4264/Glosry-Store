import { assets, footerLinks } from "../assets/assets";
import { Link } from 'react-router-dom';

const Footer = () => {

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-primary/10">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
                <div>
                    <img className="h-10 md:h-12" src={assets.logo} alt="SabziKart Logo" />
                    <p className="max-w-[410px] mt-6">
                        We deliver fresh groceries and snacks straight to your door. Trusted by thousands, we aim to make your shopping experience simple and affordable.</p>
                </div>
                <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
                    {footerLinks.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">{section.title}</h3>
                            <ul className="text-sm space-y-1">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.url} className="hover:underline transition">{link.text}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 mt-8 border border-gray-200 text-center">
                <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">
                    <span className="text-red-600 font-bold uppercase tracking-wider block mb-1">⚠️ PROJECT DISCLAIMER & COPYRIGHT NOTICE</span>
                    SabziKart is an <span className="font-bold text-gray-800 underline">Educational Research & Demonstration Project</span>.
                    All product names, logos, trademarks, and registered trademarks (e.g., Coca-Cola, Amul, Pepsi) are property of their respective owners.
                    These are used in this project <span className="italic">solely for demonstration purposes</span> under fair academic use.
                    This platform does NOT process real commercial transactions or handle sensitive user financial data.
                </p>
            </div>
            <p className="py-6 text-center text-sm font-semibold text-gray-600 bg-white/10 mt-4 rounded-t-lg">
                Copyright © {new Date().getFullYear()} SabziKart.com — All Rights Reserved.
            </p>
        </div>
    );
};

export default Footer