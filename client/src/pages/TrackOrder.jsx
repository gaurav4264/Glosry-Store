import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import LeafletMap from '../components/LeafletMap';
import { assets } from '../assets/assets';

const TrackOrder = () => {
    const [center, setCenter] = useState([25.5941, 85.1376]); 
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState([25.5941, 85.1376]);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
       
        const interval = setInterval(() => {
            setDeliveryBoyLocation(prev => [
                prev[0] + (Math.random() - 0.5) * 0.001,
                prev[1] + (Math.random() - 0.5) * 0.001
            ]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setMarkers([
            { position: [25.5941, 85.1376], popup: "Shop Location" },
            { position: deliveryBoyLocation, popup: "Delivery Boy (Live)" },
      
        ]);
        setCenter(deliveryBoyLocation);
    }, [deliveryBoyLocation]);


    return (
        <div className="pt-14 container mx-auto px-4">
            <div className="flex flex-col gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Live Order Tracking</h2>
                <div className="flex items-center gap-2 text-gray-600">
                    <p>Order Status: <span className="text-green-600 font-semibold">Out for Delivery</span></p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
                <LeafletMap center={center} markers={markers} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Delivery Partner</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <img src={assets.profile_icon} className="w-8 opacity-50" alt="Delivery Partner" />
                        </div>
                        <div>
                            <p className="font-medium">Ramesh Kumar</p>
                            <p className="text-sm text-gray-500">+91 98765 43210</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Estimated Delivery</h3>
                    <p className="text-2xl font-bold text-primary">15 - 20 mins</p>
                    <p className="text-sm text-gray-500">Your order is on the way!</p>
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
