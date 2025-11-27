import { ChevronRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { RiSpamLine } from "react-icons/ri";
import { Link } from "react-router-dom";

function ProfileOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = "http://localhost:3000/api"; // Aapka base API URL

  // Helper function to get logged-in user's email
  const getCustomerEmail = () => {
    try {
      const storedData = localStorage.getItem("isLogin");
      if (storedData) {
        const userData = JSON.parse(storedData);
        // User data structure ko dhyan mein rakhte hue email extract karein
        let user = userData.user || userData.data?.user || userData.customer || userData;
        return user?.email || null;
      }
    } catch (e) {
      console.error("Error fetching user email from localStorage:", e);
      return null;
    }
    return null;
  };

  useEffect(() => {
    const customerEmail = getCustomerEmail();

    // 💡 FIX 1: Agar user logged in nahi hai ya email nahi mil raha, toh fetch na karein
    if (!customerEmail) {
      setError("You must be logged in to view order history.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        // 💡 FIX 2: Dynamic email aur naya API endpoint use karein
        const response = await fetch(
          `${BACKEND_URL}/orders/customer?email=${customerEmail}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        // data.data field check karein
        setOrders(data.data || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []); // useEffect dependency array empty rahega

  // --- getStatusColor function (UNCHANGED) ---
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
      case "confirmed": // Assuming confirmed is also a positive state
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Loading/Error/No Login State ---
  if (loading) return <p className="text-center">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500 font-medium">{error}</p>;

  // --- Component JSX (UNCHANGED for rendering) ---
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold">Order History</h2>
      </div>
      <div className="p-8 space-y-8">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="bg-gray-50 px-8 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">Order #{order.orderNumber || order._id.substring(0, 8)}</p> {/* Order Number use karein agar available hai */}

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Placed on {new Date(order.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-gray-200">
                <div className="p-8 border-t border-gray-200">
                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start justify-between">

                        {/* LEFT SIDE: Image + Title */}
                        <div className="flex gap-4 items-start">
                          <img
                            src={item.images[0] || "https://via.placeholder.com/100"}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded"
                          />

                          <h3 className="text-xl font-medium">{item.title}</h3>
                        </div>

                        {/* RIGHT SIDE: Price breakdown */}
                        <div className="text-right">
                          <p className="text-gray-600">
                            PKR {item.price?.toFixed(2)} × {item.quantity}
                          </p>
                          <p className="text-red-500 font-semibold text-lg">
                            PKR {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No orders found state
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-3">No orders yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start exploring our
              collections to find your perfect style.
            </p>
            <Link
              to="/category"
              className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileOrder;