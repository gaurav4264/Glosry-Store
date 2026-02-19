import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const SellerReport = () => {
    const { axios, currency } = useAppContext();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [groupBy, setGroupBy] = useState('month'); // 'month' or 'week'
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchReport();
    }, [groupBy, statusFilter]); // Re-fetch when groupBy or statusFilter changes

    const fetchReport = async () => {
        try {
            setLoading(true);
            let url = `/api/order/report?groupBy=${groupBy}&status=${statusFilter}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const { data } = await axios.get(url);
            if (data.success) {
                setReportData(data);
            } else {
                toast.error(data.message);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }
        fetchReport();
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        setStatusFilter('All');
        // We need to trigger fetchReport with empty dates, but state update is async.
        // So we'll call axios directly or use a rough timeout, or just rely on the next render if we added it to dependency array.
        // Better: just manually call the function with cleared values or reset and call
        // Or simply:
        setLoading(true);
        axios.get(`/api/order/report?groupBy=${groupBy}&status=All`).then(({ data }) => {
            if (data.success) setReportData(data);
            setLoading(false);
        }).catch(err => {
            toast.error(err.message);
            setLoading(false);
        });
    };

    if (loading) {
        return <div className="p-6">Loading report...</div>;
    }

    if (!reportData) {
        return <div className="p-6">Error loading report data.</div>;
    }

    const { pendingCount, orders, stats, overview } = reportData;

    return (
        <div className="p-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold">📑 Seller Report</h2>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                        <span className='text-sm font-medium text-gray-600 px-2'>Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary focus:border-primary block p-1.5"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Returned">Returned</option>
                        </select>
                    </div>

                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                        <span className='text-sm font-medium text-gray-600 px-2'>View By:</span>
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-primary focus:border-primary block p-1.5"
                        >
                            <option value="month">Monthly</option>
                            <option value="week">Weekly</option>
                            <option value="year">Yearly</option>
                        </select>
                    </div>

                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-600 font-medium">From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-600 font-medium">To:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            className="bg-primary text-white text-xs px-3 py-1.5 rounded hover:bg-primary/90 transition"
                        >
                            Go
                        </button>
                        {(startDate || endDate || statusFilter !== 'All') && (
                            <button
                                onClick={clearFilter}
                                className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300 transition"
                            >
                                X
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Overview Cards (Filtered) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-800">{overview?.totalOrders || 0}</h3>
                    <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase">Delivered</p>
                    <h3 className="text-2xl font-bold text-green-600">{overview?.delivered || 0}</h3>
                    <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${overview?.totalOrders ? (overview.delivered / overview.totalOrders) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase">Pending Process</p>
                    <h3 className="text-2xl font-bold text-orange-500">{overview?.pending || 0}</h3>
                    <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${overview?.totalOrders ? (overview.pending / overview.totalOrders) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase">Cancelled</p>
                    <h3 className="text-2xl font-bold text-red-500">{overview?.cancelled || 0}</h3>
                    <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 transition-all duration-500"
                            style={{ width: `${overview?.totalOrders ? (overview.cancelled / overview.totalOrders) * 100 : 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase">Returned</p>
                    <h3 className="text-2xl font-bold text-purple-500">{overview?.returned || 0}</h3>
                    <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${overview?.totalOrders ? (overview.returned / overview.totalOrders) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* SALES STATS */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className='flex items-center justify-between mb-4'>
                    <h3 className="text-xl font-bold opacity-80">
                        📅 {groupBy === 'week' ? 'Weekly' : (groupBy === 'year' ? 'Yearly' : 'Monthly')} Sales Report
                    </h3>
                    {startDate && endDate && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Filtered: {startDate} to {endDate}
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                {groupBy !== 'year' && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {groupBy === 'week' ? 'Week Number' : 'Month'}
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.length === 0 ? (
                                <tr>
                                    <td colSpan={groupBy === 'year' ? 3 : 4} className="px-6 py-4 text-center text-gray-500">No data available</td>
                                </tr>
                            ) : (
                                stats.map((stat, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat._id.year}</td>
                                        {groupBy !== 'year' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {groupBy === 'week'
                                                    ? `Week ${stat._id.week}`
                                                    : new Date(0, stat._id.month - 1).toLocaleString('default', { month: 'long' })
                                                }
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{stat.totalOrders}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                                            {currency}{stat.totalRevenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDERS TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold opacity-80">
                        📦 {statusFilter === 'All' ? 'Order' : statusFilter} History
                    </h3>
                    <span className="text-xs text-gray-500">
                        {orders.length} orders found
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No orders found matching criteria</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                            {order._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-orange-100 text-orange-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                            <span className="text-xs text-gray-400 block">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-col gap-1">
                                                {order.items.map((item, i) => (
                                                    <span key={i} className="truncate max-w-xs">
                                                        {item.quantity}x {item.product?.name || 'Unknown Product'}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                            {currency}{order.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerReport;

