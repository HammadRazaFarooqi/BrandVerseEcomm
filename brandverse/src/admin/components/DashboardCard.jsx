import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

function DashboardCard({ title, value, change, icon: Icon, trend = 'up' }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <FiTrendingUp className="w-4 h-4 text-brand-600 mr-1" />
        ) : (
          <FiTrendingDown className="w-4 h-4 text-brand-700 mr-1" />
        )}
        <span className={`text-sm ${trend === 'up' ? 'text-brand-600' : 'text-brand-700'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

export default DashboardCard;