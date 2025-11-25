import { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'Brand Verse',
    email: 'contact@urbantuxedo.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fashion Street, New York, NY 10001',
    currency: 'USD',
    taxRate: '8.875',
    shippingFee: '15.00',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle settings update
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif">Settings</h1>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          {/* Store Information */}
          <div>
            <h2 className="text-xl font-serif mb-4">Store Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div>
            <h2 className="text-xl font-serif mb-4">Business Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    setSettings({ ...settings, currency: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (PKR )</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={settings.taxRate}
                  onChange={(e) =>
                    setSettings({ ...settings, taxRate: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingFee}
                  onChange={(e) =>
                    setSettings({ ...settings, shippingFee: e.target.value })
                  }
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-red-600">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;