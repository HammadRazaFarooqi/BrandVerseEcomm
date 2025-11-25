import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FiXSquare } from "react-icons/fi";

function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/customer/`);
        const data = await response.json();
        if (data.success) {
          const array = data.customer.filter(
            (element) => element?.role === "user"
          );
          setCustomers(array);
        } else {
          throw new Error("Failed to fetch customers");
        }
      } catch (error) {
        console.log(error);
        setError("Failed to load customers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filtering and sorting logic
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      if (sortBy === "orders") return a.orders.length - b.orders.length;
      if (sortBy === "date")
        return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif">Customer Management</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <select
            className="px-4 py-2 border rounded-md"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="orders">Orders</option>
            <option value="date">Join Date</option>
          </select>
        </div>
      </div>

      

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer...</p>
          </div>
        </div>
      )}


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="flex justify-between">
            <span className="block sm:inline">
              <strong className="font-bold">Error! </strong> {error}
            </span>
            <button
              className="text-red-900 hover:text-red-700"
              onClick={() => setError(null)}
            >
              <FiXSquare />
            </button>
          </span>
        </div>
      )}
      
      {/* Customers Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Join Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(customer.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.orders.length}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerManagement;
