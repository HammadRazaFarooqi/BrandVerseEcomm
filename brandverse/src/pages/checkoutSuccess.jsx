import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function CheckoutSuccess() {
  // const { orderId } = useParams();

  useEffect(() => {
    return () => {
      // Cleanup function to reset the cart in local storage
      localStorage.removeItem("cart");
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-serif mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully
            placed. A confirmation email will be sent to your registered email
            address.
          </p>
          <div className="w-full border-t border-gray-200 my-6"></div>

          {/* <div className="my-8 pb-6 border-b border-gray-200">
            <div className="bg-gray-50 rounded-lg p-6 inline-block">
              <div className="text-sm text-gray-500 mb-1">Order Number</div>
              <div className="text-xl font-medium">#{orderId}</div>
            </div>
          </div> */}

          {/* <p className="text-gray-600 mb-8">
            We&apos;ve sent a confirmation email to your registered email
            address. You can track your order status in the order details page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <Package className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="font-medium mb-2">Track Your Order</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check the status of your order and shipping information.
              </p>
              <Link
                to={`/order-detail/${orderNumber}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
              >
                Track Order
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <FileText className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="font-medium mb-2">View Order Details</h3>
              <p className="text-gray-600 text-sm mb-4">
                See your order items, billing, and delivery information.
              </p>
              <Link
                to={`/order-detail/${orderNumber}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
              >
                Order Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>*/}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-black transition shadow-sm"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
