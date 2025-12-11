import { useEffect, useState } from 'react';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiActivity,
  FiCalendar
} from 'react-icons/fi';
import { BsCash } from "react-icons/bs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const [dateFilter, setDateFilter] = useState('7days'); // Default filter
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    pendingOrders: 0,
    revenueGrowth: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Date filter options
  const dateFilterOptions = [
    { value: '3days', label: 'Last 3 Days' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]); // Re-fetch when filter changes

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/orders`),
        fetch(`${BACKEND_URL}/products/`),
        fetch(`${BACKEND_URL}/category/`)
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (ordersData.success && productsData.success && categoriesData.success) {
        processAnalytics(ordersData.data, productsData.products, categoriesData.category);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateFilter) {
      case '3days':
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate: now };
  };

  // Filter orders based on date range
  const filterOrdersByDate = (orders) => {
    const { startDate, endDate } = getDateRange();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const processAnalytics = (allOrders, products, categories) => {
    // Filter orders based on selected date range
    const orders = filterOrdersByDate(allOrders);

    // Calculate total revenue and orders
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'processing').length;

    // Calculate revenue growth (comparing current period vs previous period)
    const { startDate, endDate } = getDateRange();
    const periodDuration = endDate - startDate;
    const previousStartDate = new Date(startDate.getTime() - periodDuration);

    const currentPeriodRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const previousPeriodRevenue = allOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= previousStartDate &&
          orderDate < startDate &&
          o.status !== 'cancelled';
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const revenueGrowth = previousPeriodRevenue > 0
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
      : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      totalCategories: categories.length,
      pendingOrders,
      revenueGrowth
    });

    // Process sales data for chart
    const getDaysCount = () => {
      switch (dateFilter) {
        case '3days': return 3;
        case '7days': return 7;
        case '1month': return 30;
        case '3months': return 90;
        default: return 30;
      }
    };

    const daysCount = dateFilter === 'all' ? 30 : getDaysCount();
    const now = new Date();
    const salesDataArray = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString() && o.status !== 'cancelled';
        })
        .reduce((sum, order) => sum + order.totalAmount, 0);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      }).length;

      salesDataArray.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders
      });
    }
    setSalesData(salesDataArray);

    // Process order status data
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
    setOrderStatusData(statusData);

    // Get top 5 products by order count
    const productCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item._id?._id || item.productId;
        const productTitle = item.title;
        if (productId) {
          if (!productCounts[productId]) {
            productCounts[productId] = { title: productTitle, count: 0, revenue: 0 };
          }
          productCounts[productId].count += item.quantity;
          productCounts[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topProductsArray = Object.entries(productCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({
        name: data.title,
        sales: data.count,
        revenue: data.revenue
      }));
    setTopProducts(topProductsArray);

    // Get recent orders
    const recent = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        orderNumber: order.orderNumber,
        customer: order.customer?.firstName && order.customer?.lastName
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : order.customer?.firstName || 'Guest',
        amount: order.totalAmount,
        status: order.status,
        date: new Date(order.createdAt)
      }));
    setRecentOrders(recent);
  };

  const STATUS_COLORS = {
    delivered: "#2E8B57",
    processing: "#FFD34E",
    shipped: "#3CB371",
    cancelled: "#dc2626",
    confirmed: "#2E8B57",
    default: "#6b7280"
  };

  const STATUS_STYLES = {
    delivered: "bg-emerald-100 text-emerald-800",
    processing: "bg-accent-soft text-ink",
    shipped: "bg-brand-50 text-brand-700",
    cancelled: "bg-brand-200 text-brand-900",
    confirmed: "bg-brand-100 text-brand-800",
    default: "bg-surface-muted text-ink"
  };

  const COLORS = orderStatusData.map((item) => {
    const key = item.name.toLowerCase();
    return STATUS_COLORS[key] || STATUS_COLORS.default;
  });

  const StatCard = ({ icon: Icon, title, value, prefix = '', color = "#000" }) => (
    <div className="bg-white/90 p-5 border border-surface-muted rounded-2xl shadow-card hover:shadow-floating transition-shadow flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">{title}</p>
          <p className="text-2xl font-serif font-bold mt-1 text-ink">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="p-3 bg-surface-muted rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6" color={color} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif text-ink">Dashboard</h1>
          <p className="text-ink-muted mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white/90 border border-surface-muted px-4 py-2 rounded-full shadow-card">
          <FiCalendar className="w-5 h-5 text-brand-500" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent border-none outline-none cursor-pointer font-medium text-ink"
          >
            {dateFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BsCash}
          title="Total Revenue"
          value={stats.totalRevenue}
          growth={parseFloat(stats.revenueGrowth)}
          prefix=" "
          color="#2E8B57"
        />

        <StatCard
          icon={FiShoppingBag}
          title="Total Orders"
          value={stats.totalOrders}
          color="#3CB371"
        />

        <StatCard
          icon={FiPackage}
          title="Total Products"
          value={stats.totalProducts}
          color="#FFD34E"
        />

        <StatCard
          icon={FiActivity}
          title="Pending Orders"
          value={stats.pendingOrders}
          color="#3CB371"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        {/* Recent Orders */}
        <div className="bg-white/90 border border-surface-muted p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-serif text-ink mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{order.orderNumber}</div>
                  <div className="text-xs text-ink-muted">{order.customer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-ink">PKR {order.amount.toLocaleString()}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${STATUS_STYLES[order.status] || STATUS_STYLES.default}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="text-center py-8 text-ink-muted">No recent orders</div>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white/90 border border-surface-muted p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-serif text-ink mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                style={{ fontSize: '12px' }}
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Top Products */}
        {/* <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-serif mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="sales" name="Units Sold">
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div> */}
        <div className="bg-white/90 border border-surface-muted p-6 rounded-2xl shadow-card">
          <h3 className="text-lg font-serif text-ink mb-4">
            Sales Overview ({dateFilterOptions.find(opt => opt.value === dateFilter)?.label})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7f8ef" />
              <XAxis dataKey="date" stroke="#0C1B33" />
              <YAxis stroke="#0C1B33" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2E8B57" strokeWidth={2.5} name="Revenue (PKR)" />
              <Line type="monotone" dataKey="orders" stroke="#FFD34E" strokeWidth={2.5} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;