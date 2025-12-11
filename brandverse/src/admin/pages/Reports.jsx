import { useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Reports = () => {
  // State for selected date range
  const [dateRange, setDateRange] = useState('month');
  
  // Sample data - in a real application, this would come from props or API
  const salesData = {
    week: [
      { month: 'Mon', revenue: 1200 },
      { month: 'Tue', revenue: 1500 },
      { month: 'Wed', revenue: 1000 },
      { month: 'Thu', revenue: 1800 },
      { month: 'Fri', revenue: 2200 },
      { month: 'Sat', revenue: 1700 },
      { month: 'Sun', revenue: 1300 },
    ],
    month: [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
      { month: 'Apr', revenue: 4500 },
      { month: 'May', revenue: 6000 },
      { month: 'Jun', revenue: 5500 },
    ],
    year: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 42000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 50000 },
      { month: 'May', revenue: 52000 },
      { month: 'Jun', revenue: 55000 },
      { month: 'Jul', revenue: 58000 },
      { month: 'Aug', revenue: 56000 },
      { month: 'Sep', revenue: 60000 },
      { month: 'Oct', revenue: 62000 },
      { month: 'Nov', revenue: 65000 },
      { month: 'Dec', revenue: 70000 },
    ]
  };

  const categoryData = [
    { name: 'Tuxedos', value: 45 },
    { name: 'Suits', value: 30 },
    { name: 'Shirts', value: 15 },
    { name: 'Accessories', value: 10 },
  ];

  const COLORS = ['#2E8B57', '#3CB371', '#FFD34E', '#0C1B33'];
  
  // Get current data based on selected date range
  const currentData = salesData[dateRange];

  // Handle export functionality
  const handleExport = () => {
    // Convert data to CSV format
    const headers = ['Month,Revenue,Orders,Average Order Value,Growth\n'];
    const rows = currentData.map(data => {
      const orders = Math.floor(data.revenue / 500);
      const avgOrderValue = 500;
      const growth = '+5.2%';
      return `${data.month},${data.revenue},${orders},${avgOrderValue},${growth}\n`;
    });

    // Combine headers and rows
    const csvContent = headers.concat(rows).join('');

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-serif text-ink">Reports & Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-6 py-2 border border-surface-muted bg-white rounded-full text-ink focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={handleExport}
            className="px-8 py-3 bg-brand-500 text-white font-medium rounded-full hover:bg-brand-600 transition shadow-card hover:shadow-floating transform hover:-translate-y-0.5"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 border border-surface-muted rounded-2xl shadow-card">
          <h2 className="text-xl font-serif text-ink mb-4 px-6 pt-6">Revenue Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7f8ef" />
                <XAxis dataKey="month" stroke="#0C1B33" />
                <YAxis stroke="#0C1B33" />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2E8B57"
                  strokeWidth={2.5}
                  activeDot={{ r: 7, fill: "#FFD34E" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/90 border border-surface-muted rounded-2xl shadow-card">
          <h2 className="text-xl font-serif text-ink mb-4 px-6 pt-6">Sales by Category</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Sales Report */}
      <div className="bg-white/90 border border-surface-muted rounded-2xl shadow-card">
        <h2 className="text-xl font-serif text-ink mb-4 px-6 pt-6">{dateRange === 'week' ? 'Weekly' : dateRange === 'month' ? 'Monthly' : 'Yearly'} Sales Report</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-muted">
            <thead className="bg-surface-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                  {dateRange === 'week' ? 'Day' : 'Month'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Avg. Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-surface-muted">
              {currentData.map((item) => (
                <tr key={item.month} className="hover:bg-surface-muted/70">
                  <td className="px-6 py-4 whitespace-nowrap">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Math.floor(item.revenue / 500)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">$500</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-soft text-ink">
                      +5.2%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;