import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const { axios, currency } = useAppContext();
    const [revenueStats, setRevenueStats] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [customerStats, setCustomerStats] = useState(null);
    const [topCustomers, setTopCustomers] = useState([]);
    const [salesTrends, setSalesTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Parallel fetch for faster loading
            const [revenueRes, productsRes, customerRes, topCustRes, trendsRes] = await Promise.all([
                axios.post('/api/analytics/revenue', {}),
                axios.post('/api/analytics/top-products', { limit: 5 }),
                axios.get('/api/analytics/customers'),
                axios.get('/api/analytics/customers/top'),
                axios.post('/api/analytics/trends', { period: 'daily' })
            ]);

            if (revenueRes.data.success) setRevenueStats(revenueRes.data.stats);
            if (productsRes.data.success) setTopProducts(productsRes.data.topProducts);
            if (customerRes.data.success) setCustomerStats(customerRes.data.customerStats);
            if (topCustRes.data.success) setTopCustomers(topCustRes.data.topCustomers);
            if (trendsRes.data.success) setSalesTrends(trendsRes.data.trends);

            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    // Chart Data Configuration
    const chartData = {
        labels: salesTrends.map(item => item.date),
        datasets: [
            {
                label: 'Revenue',
                data: salesTrends.map(item => item.revenue),
                borderColor: 'rgb(34, 197, 94)', // Green
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Orders',
                data: salesTrends.map(item => item.orders),
                borderColor: 'rgb(59, 130, 246)', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                yAxisID: 'y1',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Sales & Revenue Trends (Last 30 Days)',
            },
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Revenue' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
                title: { display: true, text: 'Orders' }
            },
        },
    };

    if (loading) {
        return <div className="p-6">Loading analytics...</div>;
    }

    return (
        <div className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">📊 Analytics Dashboard</h2>
                <button
                    onClick={fetchAnalytics}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-bold">{currency}{revenueStats?.totalRevenue || 0}</h3>
                        </div>
                        <div className="text-5xl opacity-80">💰</div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Orders</p>
                            <h3 className="text-3xl font-bold">{revenueStats?.totalOrders || 0}</h3>
                        </div>
                        <div className="text-5xl opacity-80">📦</div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Avg Order Value</p>
                            <h3 className="text-3xl font-bold">{currency}{revenueStats?.averageOrderValue || 0}</h3>
                        </div>
                        <div className="text-5xl opacity-80">📈</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
                    <Line options={chartOptions} data={chartData} />
                </div>

                {/* Customer Stats Small Cards */}
                <div className="space-y-6">
                    {customerStats && (
                        <>
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                                <p className="text-gray-600 text-sm mb-1">Total Customers</p>
                                <h3 className="text-2xl font-bold text-gray-800">{customerStats.totalCustomers}</h3>
                            </div>
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                                <p className="text-gray-600 text-sm mb-1">Repeat Customers</p>
                                <h3 className="text-2xl font-bold text-gray-800">{customerStats.repeatCustomers}</h3>
                            </div>
                            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                                <p className="text-gray-600 text-sm mb-1">Repeat Rate</p>
                                <h3 className="text-2xl font-bold text-green-600">{customerStats.repeatRate}%</h3>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
                    <h3 className="text-xl font-bold mb-4">🏆 Top Selling Products</h3>
                    {topProducts.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No sales data available yet</p>
                    ) : (
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-sm text-gray-600">Sold: {product.soldCount} units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{currency}{product.revenue.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Customers */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-md">
                    <h3 className="text-xl font-bold mb-4">👑 Top Customers</h3>
                    {topCustomers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No customer data available yet</p>
                    ) : (
                        <div className="space-y-4">
                            {topCustomers.map((user, index) => (
                                <div key={user._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">{currency}{user.totalSpent?.toFixed(2) || '0.00'}</p>
                                        <p className="text-xs text-gray-500">Total Spent</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-bold">💡 Tip:</span> Use these insights to optimize your inventory and marketing strategies.
                    Focus on your top-selling products and engage with repeat customers for better retention.
                </p>
            </div>
        </div>
    );
};

export default Analytics;
