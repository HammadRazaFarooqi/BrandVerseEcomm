import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import OrderPrintTemplate from "../../components/OrderPrintTemplate";

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState("");
  const printRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/order/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("isLogin"));
    if (user) {
      setUserRole(user.user?.role);
    }
  }, []);

  const updateOrderStatus = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to change the order status to ${newStatus}?`
      )
    ) {
      try {
        setUpdating(true);
        const response = await fetch(`${BACKEND_URL}/order/${orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
          throw new Error("Failed to update order status");
        }
        const updatedOrder = await response.json();
        setOrder(updatedOrder.order);
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status. Try again.");
      } finally {
        setUpdating(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-accent-soft text-primary";
      case "shipped":
        return "bg-brand-50 text-brand-700";
      case "delivered":
        return "bg-brand-100 text-brand-800";
      case "cancelled":
        return "bg-brand-200 text-brand-900";
      default:
        return "bg-surface-muted text-ink";
    }
  };

  // Handle print functionality
  const handlePrint = useReactToPrint({
    // This is the key fix - ensure contentRef is properly passed
    contentRef: printRef,
    documentTitle: `Order-${orderId}`,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={userRole === "admin" ? "/admin/orders" : "/profile"}
            className="text-brand-600 hover:text-brand-700 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {userRole === "user" ? "Profile" : "Order"}
          </Link>
          <h1 className="text-3xl font-serif">Order Details</h1>
        </div>
        {!loading && !error && order && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition"
          >
            Print Info / Save PDF
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-accent-soft text-primary p-4 rounded">{error}</div>
      )}

      {!loading && !error && order && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-medium">Order #{order._id}</h2>
                    <p className="text-gray-500 mt-1">
                      Placed on{" "}
                      {format(
                        new Date(order.createdAt),
                        "MMMM dd, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  {userRole === "admin" && (
                    <select
                      className="ml-2 border border-gray-300 p-1 rounded"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(e.target.value)}
                      disabled={
                        updating ||
                        order.status === "delivered" ||
                        order.status === "cancelled"
                      }
                    >
                      <option value="processing">Processing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                  {userRole === "user" && order.status === "processing" && (
                    <button
                      onClick={() => updateOrderStatus("cancelled")}
                      className="ml-4 px-4 py-2 bg-brand-700 text-white rounded hover:bg-brand-800"
                      disabled={updating}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Order Items</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order?.items?.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 flex items-center">
                          <img
                            className="h-10 w-10 rounded-md mr-4"
                            src={item.images.primary}
                            alt={item.name}
                          />
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          PKR {item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          PKR {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">
                  Customer Information
                </h3>
                <p>
                  Name: {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p>Email: {order.customer?.email}</p>
                <p>Phone: {order.customer?.phone}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                <p>{order.customer.address.street}</p>
                <p>
                  {order.customer.address.city}, {order.customer.address.state}{" "}
                  {order.customer.address.zip}
                </p>
                <p>{order.customer.address.country}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="border-gray-200">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>PKR {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "none" }}>
            <div ref={printRef}>
              <OrderPrintTemplate order={order} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
