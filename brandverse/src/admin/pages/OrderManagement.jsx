import { useEffect, useState } from "react";
import { format } from "date-fns";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/admin/orders`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!data.success) throw new Error("Failed to fetch orders");

        const formattedOrders = data.data.flatMap((order) =>
          order.items.map((item) => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            customer: `${order.customer.firstName} ${order.customer.lastName}`,
            phone: order.customer.phone,
            date: new Date(order.createdAt),
            total: order.totalAmount,
            status: order.status,
            payment: order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
            paymentProof: order.paymentProof || "",
            title: item.title,
            quantity: item.quantity,
            price: order.totalAmount,
          }))
        );

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // reset to first page whenever filters/search changes
  }, [searchTerm, statusFilter, dateFilter]);
  
  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus = statusFilter
      ? order.status.toLowerCase() === statusFilter.toLowerCase()
      : true;
  
    const matchesDate = dateFilter
      ? format(order.date, "yyyy-MM-dd") === dateFilter
      : true;
  
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif">Order Management</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <select
            className="px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border rounded-md"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Loading & Error */}
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Orders Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Phone",
                  "Date",
                  "Item",
                  "Quantity",
                  "Price",
                  "Payment",
                  "Payment Proof",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(order.date, "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      PKR {order.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.payment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {order.paymentProof ? (
                        <a
                          href={order.paymentProof}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline font-medium"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(e.target.value, order.orderId)
                        }
                        disabled={
                          updating ||
                          order.status === "delivered" ||
                          order.status === "cancelled"
                        }
                        className="px-2 py-1 border rounded-md text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-8 text-center text-gray-400 text-sm"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => changePage(i + 1)}
                  className={`px-3 py-1 rounded hover:bg-white ${
                    currentPage === i + 1 ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
