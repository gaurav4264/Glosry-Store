import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
const Orders = () => {
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/seller');
            console.log("Seller Orders Data:", data);
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    const statusHandler = async (event, orderId) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status: event.target.value })
            if (data.success) {
                await fetchOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to handle Date/Time update
    const updateOrderSlot = async (orderId, date, time) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, date, time }) // Re-using status endpoint
            if (data.success) {
                toast.success("Slot Updated")
                await fetchOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Export to CSV
    const exportToCSV = () => {
        if (orders.length === 0) return toast.error("No orders to export");

        const headers = ["Order ID", "Date", "Customer", "Amount", "Status", "Payment", "Items"];
        const rows = orders.map(order => [
            order._id,
            new Date(order.createdAt).toLocaleDateString(),
            order.address ? `${order.address.firstName} ${order.address.lastName}` : 'N/A',
            order.amount,
            order.status,
            order.paymentType,
            order.items.map(i => `${i.product ? i.product.name : 'Unknown'} x${i.quantity}`).join("; ")
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            if (orders.length === 0) return toast.error("No orders to export");

            const doc = new jsPDF();

            // Add Header
            doc.setFontSize(22);
            doc.setTextColor(40, 167, 69); // Green color
            doc.text("SABZIKART", 105, 15, { align: "center" });

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Seller Order Report", 105, 22, { align: "center" });

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 28, { align: "center" });

            const tableColumn = ["Order ID", "Date", "Customer", "Amount (Rs.)", "Status", "Payment"];
            const tableRows = [];

            orders.forEach(order => {
                const orderData = [
                    order._id.slice(-6).toUpperCase(),
                    new Date(order.createdAt).toLocaleDateString(),
                    order.address ? `${order.address.firstName} ${order.address.lastName}` : 'N/A',
                    `Rs. ${order.amount}`,
                    order.status,
                    order.paymentType
                ];
                tableRows.push(orderData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                theme: 'grid',
                headStyles: { fillColor: [40, 167, 69] }, // Green header
                styles: { fontSize: 9, cellPadding: 2 },
            });

            doc.save(`orders_export_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Orders List</h2>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition flex items-center gap-1">
                            📄 CSV
                        </button>
                        <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition flex items-center gap-1">
                            📄 PDF
                        </button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-lg">No orders yet</p>
                        <p className="text-sm mt-2">Orders will appear here when customers place them</p>
                    </div>
                ) : (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-start md:flex-row gap-5 justify-between p-5 max-w-5xl rounded-md border border-gray-300 bg-white shadow-sm">

                            <div className="flex gap-5 max-w-xs">
                                <img className="w-14 h-14 object-cover rounded" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    <p className='font-bold text-gray-800 mb-1'>Order #{order._id.slice(-6).toUpperCase()}</p>
                                    <div className='space-y-1'>
                                        {order.items.map((item, index) => (
                                            <p key={index} className="text-sm text-gray-600">
                                                {item.product ? item.product.name : "Product Removed"}{" "}
                                                <span className="text-primary font-medium">x {item.quantity}</span>
                                            </p>
                                        ))}
                                    </div>
                                    <p className='mt-2 font-bold text-gray-800'>{currency}{order.amount}</p>
                                </div>
                            </div>

                            <div className="flex flex-col text-sm text-gray-600 gap-1 min-w-[200px]">
                                <p><span className='font-medium'>Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><span className='font-medium'>Method:</span> {order.paymentType}</p>
                                <p><span className='font-medium'>Payment:</span> <span className={order.isPaid ? "text-green-600 font-bold" : "text-orange-500 font-bold"}>{order.isPaid ? "Paid" : "Pending"}</span></p>
                                <p><span className='font-medium'>Customer:</span> {order.address ? `${order.address.firstName} ${order.address.lastName}` : 'N/A'}</p>

                                <div className='mt-2 pt-2 border-t border-gray-100'>
                                    <p className='font-medium text-gray-800 mb-1'>Scheduled Delivery:</p>
                                    {order.scheduledDeliveryDate ? (
                                        <div className='bg-primary/5 p-2 rounded text-xs'>
                                            <p>📅 {new Date(order.scheduledDeliveryDate).toDateString()}</p>
                                            <p>⏰ {order.deliveryTimeSlot}</p>
                                        </div>
                                    ) : <p className='text-xs text-gray-400'>Not scheduled</p>}

                                    {/* Edit Slot */}
                                    <div className='mt-2 flex gap-2'>
                                        <input
                                            type="date"
                                            className='border rounded px-1 text-xs py-1 outline-none'
                                            defaultValue={order.scheduledDeliveryDate && !isNaN(new Date(order.scheduledDeliveryDate)) ? new Date(order.scheduledDeliveryDate).toISOString().split('T')[0] : ""}
                                            onChange={(e) => updateOrderSlot(order._id, e.target.value, order.deliveryTimeSlot)}
                                        />
                                        <select
                                            className='border rounded px-1 text-xs py-1 outline-none'
                                            defaultValue={order.deliveryTimeSlot || ""}
                                            onChange={(e) => updateOrderSlot(order._id, order.scheduledDeliveryDate, e.target.value)}
                                        >
                                            <option value="" disabled>Slot</option>
                                            <option value="Morning (9AM-12PM)">Morning</option>
                                            <option value="Afternoon (12PM-4PM)">Afternoon</option>
                                            <option value="Evening (4PM-8PM)">Evening</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-medium'>Order Status</p>
                                <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='p-2 font-semibold bg-gray-50 border border-gray-300 rounded outline-none text-sm'>
                                    <option value="Order Placed">Order Placed</option>
                                    <option value="Packing">Packing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Return Requested">Return Requested</option>
                                    <option value="Returned">Returned</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                {order.status === 'Cancelled' && (
                                    <div className='mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600'>
                                        <p className='font-medium'>Cancellation Reason:</p>
                                        <p>{order.cancellationReason || "No reason provided"}</p>
                                    </div>
                                )}

                                {['Return Requested', 'Returned'].includes(order.status) && (
                                    <div className='mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-600 max-w-[250px]'>
                                        <p className='font-medium'>Return Reason:</p>
                                        <p className='mb-2'>{order.returnReason || "No reason provided"}</p>

                                        {order.returnImages && order.returnImages.length > 0 && (
                                            <div className='flex gap-2 flex-wrap'>
                                                {order.returnImages.map((img, idx) => (
                                                    <a key={idx} href={img} target="_blank" rel="noreferrer" className='block w-12 h-12 border border-gray-300 rounded overflow-hidden hover:opacity-80'>
                                                        <img src={img} alt="Return Evidence" className='w-full h-full object-cover' />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    )
}

export default Orders
