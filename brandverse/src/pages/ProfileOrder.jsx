import { ChevronRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { RiSpamLine } from "react-icons/ri";
import { Link } from "react-router-dom";

function ProfileOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

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
        return "bg-accent-soft text-primary";
      case "shipped":
        return "bg-brand-50 text-brand-700";
      case "delivered":
        return "bg-brand-100 text-brand-800";
      case "confirmed":
        return "bg-accent-muted text-primary";
      case "cancelled":
        return "bg-brand-200 text-brand-900";
      default:
        return "bg-surface-muted text-ink";
    }
  };  

  // --- Loading/Error/No Login State ---
  if (loading) return <p className="text-center p-4">Loading orders...</p>;
if (error) return <p className="text-center text-brand-700 font-medium p-4">{error}</p>;

  // --- Component JSX (UNCHANGED for rendering) ---
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 md:px-8 py-4 md:py-6 border-b bg-gray-50">
        <h2 className="text-xl md:text-2xl font-bold">Order History</h2>
      </div>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="bg-gray-50 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-base md:text-lg">Order #{order.orderNumber || order._id.substring(0, 8)}</p> {/* Order Number use karein agar available hai */}

                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Placed on {new Date(order.createdAt).toDateString()}
                  </p>
                </div>
              </div>
              <div className="p-4 md:p-8 border-t border-gray-200">
                <div className="space-y-4 md:space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start justify-between gap-4">

                      {/* LEFT SIDE: Image + Title */}
                      <div className="flex gap-3 md:gap-4 items-start w-full sm:w-auto">
                        <img
                          src={item.images[0] || "https://via.placeholder.com/100"}
                          alt={item.title}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-xl font-medium break-words">{item.title}</h3>
                        </div>
                      </div>

                      {/* RIGHT SIDE: Price breakdown */}
                      <div className="text-left sm:text-right w-full sm:w-auto sm:ml-4">
                        <p className="text-gray-600 text-sm md:text-base">
                          PKR {item.price?.toLocaleString('en-PK')} × {item.quantity}
                        </p>
                        <p className="text-brand-700 font-semibold text-base md:text-lg">
                          PKR {(item.price * item.quantity).toLocaleString('en-PK')}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          // No orders found state
          <div className="text-center py-12 md:py-16 px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3">No orders yet</h3>
            <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 max-w-md mx-auto px-4">
              You haven&apos;t placed any orders yet. Start exploring our
              collections to find your perfect style.
            </p>
            <Link
              to="/category"
              className="inline-block px-6 md:px-8 py-2.5 md:py-3 bg-brand-600 text-white text-sm md:text-base font-medium rounded-full hover:bg-brand-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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