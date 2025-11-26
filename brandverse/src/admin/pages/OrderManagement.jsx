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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/admin/orders`); // Use admin/orders API
      const data = await response.json();

      if (!data.success) throw new Error("Failed to fetch orders");

      // Flatten orders with items
      const formattedOrders = data.data.flatMap(order =>
        order.items.map(item => ({
          orderId: order._id,
          customer: `${order.customer.firstName} ${order.customer.lastName}`,
          phone: order.customer.phone,
          date: new Date(order.createdAt),
          total: order.totalAmount,
          status: order.status,
          payment: order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
          paymentProof: order.paymentProof || "",
          title: item._id.title,
          quantity: item.quantity,
          price: item._id.price,
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const updateOrderStatus = async (newStatus, orderId) => {
    setUpdating(true);
    if (
      window.confirm(
        `Are you sure you want to change the order status to ${newStatus}?`
      )
    ) {
      try {
        const response = await fetch(`${BACKEND_URL}/order/${orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error("Failed to update order status");
        await response.json();
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status. Try again.");
      } finally {
        setUpdating(false);
        fetchOrders(); // Refresh
      }
    }
  };

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
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Payment Proof</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.orderId}</td>
                    <td>{order.customer}</td>
                    <td>{order.phone}</td>
                    <td>{format(order.date, "MMM dd, yyyy")}</td>
                    <td>{order.title}</td>
                    <td>{order.quantity}</td>
                    <td>${order.price.toFixed(2)}</td>
                    <td>{order.payment}</td>
                    <td>
                      {order.paymentProof ? (
                        <a
                          href={order.paymentProof}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
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
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <Link to={`/admin/order/${order.orderId}`}>
                        <button className="text-blue-600 hover:underline">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
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
