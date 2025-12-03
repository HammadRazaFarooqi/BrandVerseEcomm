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
