import {
    Heart
} from "lucide-react";
import { Link } from "react-router-dom";

function ProfileWshlist() {

  // Mock wishlist data
  const wishlist = [
    {
      id: 1,
      name: "Premium Velvet Tuxedo",
      price: 799.99,
      image:
        "https://images.unsplash.com/photo-1592878849122-facb97756fa3?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Italian Silk Tie",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1598532213005-771da5387105?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Leather Oxford Shoes",
      price: 299.99,
      image:
        "https://images.unsplash.com/photo-1614253429340-9caebb3f6075?w=400&h=300&fit=crop",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
      </div>

      <div className="p-8">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-60 object-cover transform group-hover:scale-105 transition duration-500"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-brand-600 hover:text-white transition">
                    <Heart className="h-5 w-5" />
                  </button>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-lg text-gray-800 group-hover:text-brand-700 transition">
                    {item.name}
                  </h3>
                  <p className="text-brand-700 font-bold mt-2 text-lg">
                    PKR {item.price.toFixed(2)}
                  </p>
                  <button className="w-full mt-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-brand-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love for later and never miss out on your favorite
              pieces.
            </p>
            <Link
              to="/category"
              className="px-8 py-3 bg-brand-600 text-white font-medium rounded-full hover:bg-brand-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileWshlist;
