import { useEffect, useState } from "react";
import { format } from "date-fns";
import { FiExternalLink, FiCheckCircle, FiXCircle, FiImage } from "react-icons/fi";

/**
 * Redesigned OrderManagement (Option A - clean & compact)
 * - Keeps your previous logic & endpoints intact
 * - Adds: product image in table, customer email, short address
 * - Adds: Details modal with full order payload visualization
 *
 * Replace your current OrderManagement component with this file.
 */

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [updating, setUpdating] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null); // for details modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch Orders (keeps same endpoint and flattening behaviour)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/admin/orders`);
        const data = await response.json();

        if (!data.success) throw new Error("Failed to fetch orders.");

        // Flatten items as before and include the original order payload (for modal)
        const formattedOrders = data.data.flatMap((order) =>
          order.items.map((item) => ({
            orderId: order._id,
            rawOrder: order, // keep original order object for modal
            orderNumber: order.orderNumber,
            customer:
              order.customer?.firstName && order.customer?.lastName
                ? `${order.customer.firstName} ${order.customer.lastName}`
                : order.customer?.firstName || order.customer?.lastName || "—",
            customerEmail: order.customer?.email || "",
            phone: order.customer?.phone || "",
            address: order.customer?.address || null,
            date: new Date(order.createdAt),
            total: order.totalAmount,
            status: order.status,
            payment: order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
            paymentProof: order.paymentProof || "",
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            itemImages: item.images || item._id?.images?.primary ? (item.images.length ? item.images : [item._id?.images?.primary]) : [],
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
  }, [BACKEND_URL]);

  // Update Order Status (same endpoint)
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
      setOrders((prev) =>
        prev.map((order) => (order.orderId === orderId ? { ...order, status: newStatus } : order))
      );

      // If modal is open for this order, update modal status too
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Search + Filter
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter ? order.status.toLowerCase() === statusFilter.toLowerCase() : true;

    const matchDate = dateFilter ? format(order.date, "yyyy-MM-dd") === dateFilter : true;

    return matchSearch && matchStatus && matchDate;
  });

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const shortAddress = (address) => {
    if (!address) return "—";
    // prefer city,state or street fallback
    const city = address.city || "";
    const state = address.state || "";
    const street = address.street || "";
    if (city || state) return `${city}${city && state ? ", " : ""}${state}`;
    if (street) return street.length > 30 ? street.slice(0, 30) + "…" : street;
    return "—";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Order Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search orders, customer or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />

          <select className="px-4 py-2 border rounded-md" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input type="date" className="px-4 py-2 border rounded-md" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-medium">
                PKR {filteredOrders
                  .reduce((s, o) => s + (o.price * o.quantity || 0), 0)
                  .toLocaleString('en-PK')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong> {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <tr key={`${order.orderId}-${idx}`} className="hover:bg-gray-50">
                    {/* Order column */}
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{format(order.date, "MMM dd, yyyy")}</div>
                    </td>

                    {/* Item column (single-first item focus) */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          {order.itemImages && order.itemImages.length > 0 ? (
                            <img
                              src={order.itemImages[0]}
                              alt={order.title}
                              className="h-10 w-10 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                              }}
                            />
                          ) : (
                            <FiImage className="text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{order.title}</div>
                          <div className="text-xs text-gray-500">
                            {order.quantity} × PKR {order.price}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm font-medium">{order.customer}</div>
                      <div className="text-xs text-gray-500 truncate" title={order.customerEmail}>
                        {order.customerEmail || "—"}
                      </div>
                    </td>

                    {/* Address (short) */}
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm">{shortAddress(order.address)}</div>
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm">{order.payment}</div>
                      <div className="text-xs mt-1">
                        {order.paymentProof ? (
                          <a href={order.paymentProof} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 underline">
                            <FiExternalLink /> View Proof
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 align-top">
                      <select
                        value={order.status}
                        disabled={updating || order.status === "delivered" || order.status === "cancelled"}
                        onChange={(e) => updateOrderStatus(e.target.value, order.orderId)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3 align-top">
                      <button
                        onClick={() => openDetailsModal(order)}
                        className="text-sm px-3 py-1 bg-white border rounded-md hover:bg-gray-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto p-6">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif">
                  Order {selectedOrder.orderNumber}
                </h2>
                <div className="text-sm text-gray-600">
                  {format(selectedOrder.date, "MMM dd, yyyy 'at' HH:mm")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => closeDetailsModal()}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left: Customer & Address */}
              <div className="col-span-1 bg-gray-50 p-4 rounded">
                <h3 className="text-sm font-medium">Customer</h3>
                <div className="mt-2 text-sm">
                  <div className="font-medium">{selectedOrder.customer}</div>
                  <div className="text-gray-600">{selectedOrder.customerEmail || "—"}</div>
                  <div className="text-gray-600">{selectedOrder.phone || "—"}</div>
                </div>

                <h3 className="text-sm font-medium mt-4">Address</h3>
                <div className="mt-2 text-sm text-gray-700">
                  {selectedOrder.address ? (
                    <>
                      <div>{selectedOrder.address.street}</div>
                      <div>
                        {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode || ""}
                      </div>
                      <div>{selectedOrder.address.country || "Pakistan"}</div>
                    </>
                  ) : (
                    <div className="text-gray-500">No address provided</div>
                  )}
                </div>

                <h3 className="text-sm font-medium mt-4">Payment</h3>
                <div className="mt-2 text-sm">
                  <div>{selectedOrder.payment}</div>
                  {selectedOrder.paymentProof ? (
                    <div className="mt-2">
                      <a href={selectedOrder.paymentProof} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-2">
                        <FiExternalLink /> View Proof
                      </a>
                    </div>
                  ) : (
                    <div className="text-gray-500 mt-1">No proof</div>
                  )}
                </div>
              </div>

              {/* Middle: Items */}
              <div className="col-span-2">
                <h3 className="text-sm font-medium">Items</h3>

                <div className="mt-3 space-y-3">
                  {/* Show all items from rawOrder.items when possible */}
                  {selectedOrder.rawOrder?.items?.length > 0 ? (
                    selectedOrder.rawOrder.items.map((it, i) => {
                      // handle item image
                      const img = (it.images && it.images.length && it.images[0]) || (it._id?.images?.primary) || null;
                      return (
                        <div key={i} className="flex items-center gap-4 p-3 border rounded">
                          <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            {img ? (
                              <img src={img} alt={it.title} className="h-16 w-16 object-cover" onError={(e) => (e.target.src = "")} />
                            ) : (
                              <FiImage className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{it.title}</div>
                            <div className="text-xs text-gray-600">Qty: {it.quantity} • PKR {it.price}</div>
                          </div>
                          <div className="text-sm font-medium">PKR {it.quantity * it.price}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-500">No items data</div>
                  )}
                </div>

                {/* Totals & meta */}
                <div className="mt-6 p-4 border rounded bg-gray-50">
                  <div className="flex justify-between text-sm text-gray-700">
                    <div>Subtotal</div>
                    <div>PKR {selectedOrder.total}</div>
                  </div>
                  {/* Extend here with shipping, tax etc if available */}
                  <div className="flex justify-between text-sm font-medium mt-3">
                    <div>Total</div>
                    <div>PKR {selectedOrder.total}</div>
                  </div>

                  <div className="mt-4 text-xs text-gray-600">
                    Created: {selectedOrder.rawOrder?.createdAt ? format(new Date(selectedOrder.rawOrder.createdAt), "MMM dd, yyyy HH:mm") : "—"}
                    <br />
                    Updated: {selectedOrder.rawOrder?.updatedAt ? format(new Date(selectedOrder.rawOrder.updatedAt), "MMM dd, yyyy HH:mm") : "—"}
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs text-gray-600">Change status</label>
                    <select
                      value={selectedOrder.status}
                      disabled={updating || selectedOrder.status === "delivered" || selectedOrder.status === "cancelled"}
                      onChange={(e) => updateOrderStatus(e.target.value, selectedOrder.orderId)}
                      className="mt-2 border rounded px-2 py-1"
                    >
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
