import { ChevronRight, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ProfileOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/order/email/search?email=hafiztalharazafarooqi@gmail.com"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  if (loading) return <p className="text-center">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

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
                    <p className="font-medium text-lg">Order {order._id}</p>

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
                <Link to={`/order/${order._id}`} className="group">
                  <button className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 self-start md:self-center">
                    View Order Details
                    <ChevronRight className="h-4 w-4" />
                  </button>{" "}
                </Link>
              </div>
              <div className="p-8 border-t border-gray-200">
                <div className="space-y-6">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-6">
                      <img
                        src={
                          item.images.primary ||
                          "https://via.placeholder.com/100"
                        }
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-medium">{item.title}</h3>
                        {/* <p className="text-gray-600 mt-1">Size: {item.size || "N/A"}</p> */}
                        <p className="text-red-500 font-medium mt-2 text-lg">
                          PKR {item.price?.toFixed(2)}
                        </p>
                      </div>
                      {/* <div className="flex flex-col gap-3">
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition">
                          Buy Again
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-red-500 hover:text-red-500 transition flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Review
                        </button>
                      </div> */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
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
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
