import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updating, setUpdating] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/admin/orders`);
        const data = await response.json();

        if (!data.success) throw new Error("Failed to fetch orders.");

        const formattedOrders = data.data.flatMap(order =>
          order.items.map(item => ({
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
            price: item.price,
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

  // Update Order Status
  const updateOrderStatus = async (newStatus, orderId) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;

    try {
      setUpdating(true);

      const res = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Update failed");

      // Update UI instantly
      setOrders(prev =>
        prev.map(order =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Search + Filter
  const filteredOrders = orders.filter(order => {
    const matchSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter
      ? order.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    const matchDate = dateFilter
      ? format(order.date, "yyyy-MM-dd") === dateFilter
      : true;

    return matchSearch && matchStatus && matchDate;
  });

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
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <select
            className="px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Loading & Error */}
      {loading && <p>Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Proof</th>
                <th className="px-4 py-2">Status</th>
                {/* <th className="px-4 py-2">Actions</th> */}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-2">{order.title}</td>
                    <td className="px-4 py-2">{order.quantity}</td>
                    <td className="px-4 py-2">PKR {order.price}</td>
                    <td className="px-4 py-2">{order.customer}</td>
                    <td className="px-4 py-2">{order.phone}</td>
                    <td className="px-4 py-2">
                      {format(order.date, "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-2">{order.payment}</td>
                    <td className="px-4 py-2">
                      {order.paymentProof ? (
                        <a
                          href={order.paymentProof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Status select */}
                    <td className="px-4 py-2">
                      <select
                        value={order.status}
                        disabled={
                          updating ||
                          order.status === "delivered" ||
                          order.status === "cancelled"
                        }
                        onChange={e =>
                          updateOrderStatus(e.target.value, order.orderId)
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* View details */}
                    {/* <td className="px-4 py-2">
                      <Link
                        to={`/admin/order/${order.orderId}`}
                        className="text-blue-600 underline"
                      >
                        View
                      </Link>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-6">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
