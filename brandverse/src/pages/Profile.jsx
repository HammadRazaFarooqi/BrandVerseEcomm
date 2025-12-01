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
    const stored = localStorage.getItem("isLogin");
    if (!stored) return;
  
    try {
      const data = JSON.parse(stored);
      const u = data.user;
      if (!u) return;
  
      // Set profile data
      setName(u.fullName || u.username || "");
      setEmail(u.email || "");
      setInitial(u.fullName
        ? u.fullName.split(" ").map(n => n[0].toUpperCase()).join("")
        : u.username?.[0]?.toUpperCase() || ""
      );
  
      // For ProfileDetails
      setProfile({
        firstName: u.fullName?.split(" ")[0] || "",
        lastName: u.fullName?.split(" ")[1] || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.addresses?.length
          ? `${u.addresses[0].street}, ${u.addresses[0].state}, ${u.addresses[0].country}`
          : "",
      });
    } catch (e) {
      console.error("Invalid user JSON:", e);
    }
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
            Your <span className="text-black">Personal</span> Account
          </h1>
          <p className="text-xl text-black max-w-xl mx-auto">
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
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-white">{initial || "?"}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-3 flex items-center gap-2 text-white bg-black rounded-full hover:bg-black transition shadow-sm hover:shadow-md transform hover:-translate-y-1"
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
                      ? "bg-black text-white shadow-md"
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
                      ? "bg-black text-white shadow-md"
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
                      ? "bg-black text-white shadow-md"
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
    </div>
  );
}

export default Profile;
