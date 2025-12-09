// Updated AdminLayout.js

import { useState } from 'react';
import { BiCategory } from "react-icons/bi";
import {
  FiArrowLeft,
  FiBox,
  FiHome,
  FiLogOut,
  FiMenu,
  FiShoppingBag,
  FiX
} from 'react-icons/fi';
import { Link, Outlet, useLocation } from 'react-router-dom';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/category', icon: BiCategory, label: 'Category' },
    { path: '/admin/products', icon: FiBox, label: 'Products' },
    { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("isLogin");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed: ", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <h1 className="text-xl font-serif text-primary">Affi Mall</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 bg-white shadow-md`}
      >
        <div className="h-full flex flex-col">
          {/* Desktop Logo */}
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-serif text-primary">Affi Mall</h1>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>

          {/* Mobile Logo Section */}
          <div className="p-6 mt-14 border-b lg:hidden">
            <p className="text-sm text-gray-600">Admin Panel</p>
            <Link to="/">
              <button className="mt-3 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition w-full">
                Back to Site
              </button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${location.pathname === item.path
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

          {/* Logout */}
          <div className="p-4 border-t">
            <Link to="/" className="w-full">
              <button
                className="flex items-center gap-3 px-4 py-3 w-full rounded-md hover:bg-gray-100 text-black-600"
              >
                <FiArrowLeft />
                Back to Site
              </button>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-md hover:bg-gray-100 text-black-600 mt-2"
            >
              <FiLogOut size={20} />
              Logout
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-8">
          <Outlet />
        </div>
      </div>

      {/* Overlay */}
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