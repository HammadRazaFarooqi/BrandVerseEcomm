import { useState } from 'react';
import { BiCategory } from "react-icons/bi";
import {
  // FiBarChart2,
  FiBox,
  FiLogOut,
  FiMenu,
  // FiSettings,
  FiShoppingBag,
  FiUsers,
  FiSpeaker,
  FiX
} from 'react-icons/fi';
import { Link, Outlet, useLocation } from 'react-router-dom';


function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    // { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin', icon: BiCategory, label: 'Category' },
    { path: '/admin/products', icon: FiBox, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/admin/customers', icon: FiUsers, label: 'Customers' },
    { path: '/admin/promotions', icon: FiSpeaker, label: 'Promotions' },
    // { path: '/admin/reports', icon: FiBarChart2, label: 'Reports' },
    // { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];
  
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("isLogin");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage")); // Notify other components
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed: ", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white shadow-md`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-serif text-primary">Brand Verse</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-md hover:bg-gray-100 text-black-600"
            >
              <FiLogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;