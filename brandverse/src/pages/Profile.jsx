import { ChevronRight, LogOut, Package, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import ProfileDetails from "./ProfileDetails.jsx";
import ProfileOrder from "./ProfileOrder.jsx";
import ProfileSettings from "./ProfileSettings.jsx";
import ProfileWshlist from "./ProfileWishlist.jsx";

function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [initial, setInitial] = useState("");

  const onLogout = async (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("isLogin");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage")); // Notify other components
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed: ", error.message);
    }
  };

  useEffect(() => {
    return () => {
      const user = JSON.parse(localStorage.getItem("isLogin"));
      if (user) {
        const storedProfile = JSON.parse(localStorage.getItem("isLogin")).user;
        setName(`${storedProfile.firstName} ${storedProfile.lastName}`);
        setEmail(storedProfile.email);
        setInitial(`${user.user.firstName?.charAt(0).toUpperCase()}${user.user.lastName?.charAt(0).toUpperCase()}`);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with User Banner */}
      <section className="relative h-64 flex items-center justify-center text-center bg-cover bg-center">
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1487222477894-8943e31ef7b2')",
            backgroundBlendMode: "overlay",
          }}
        ></div>
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2 text-white leading-tight">
            Your <span className="text-red-400">Personal</span> Account
          </h1>
          <p className="text-xl text-gray-200 max-w-xl mx-auto">
            Manage your profile, track orders, and discover your next style
            upgrade
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-16">
        {/* User Card - Positioned over the hero image */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 transform">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-red-500">{initial}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-3 flex items-center gap-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <nav className="space-y-2">
                <button
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition transform ${
                    activeTab === "profile"
                      ? "bg-red-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:-translate-y-1"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </div>
                  {activeTab === "profile" && (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                <button
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition transform ${
                    activeTab === "orders"
                      ? "bg-red-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:-translate-y-1"
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" />
                    <span className="font-medium">Orders</span>
                  </div>
                  {activeTab === "orders" && (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                <button
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition transform ${
                    activeTab === "settings"
                      ? "bg-red-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100 hover:-translate-y-1"
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                  </div>
                  {activeTab === "settings" && (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === "profile" && <ProfileDetails />}

            {/* Orders Tab */}
            {activeTab === "orders" && <ProfileOrder />}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && <ProfileWshlist />}

            {/* Settings Tab */}
            {activeTab === "settings" && <ProfileSettings />}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="py-20 bg-red-500 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Join Our Style Community
            </h2>
            <p className="mb-8">
              Subscribe to receive exclusive offers, early access to new
              collections, and style inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
              />
              <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;
