import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

function ProfileDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value) return "This field is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters allowed";
        return "";
      case "phone":
        if (!value) return "Phone number is required";
        if (!/^\d+$/.test(value)) return "Only numbers allowed";
        if (value.length < 10) return "Phone number must be at least 10 digits";
        return "";
      case "address":
        if (!value) return "Address cannot be empty";
        return "";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before sending
    const newErrors = {};
    Object.keys(profile).forEach((key) => {
      if (key !== "email") {
        const error = validateField(key, profile[key]);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const storedData = localStorage.getItem("isLogin");
      if (!storedData) {
        console.error("No user data found");
        setLoading(false);
        return;
      }

      const storedProfile = JSON.parse(storedData).user;
      const id = storedProfile.id || storedProfile._id;

      const response = await fetch(`${BACKEND_URL}/customer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userDetail = JSON.parse(localStorage.getItem("isLogin"));
        userDetail.user = data.customer || data.user;
        localStorage.setItem("isLogin", JSON.stringify(userDetail));
        window.dispatchEvent(new Event("storage"));
        setIsEditing(false);
      } else {
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    if (!isLogin) return;

    try {
      const storedProfile = JSON.parse(isLogin).user;
      let addressString = "";
      if (storedProfile?.addresses && Array.isArray(storedProfile.addresses) && storedProfile.addresses.length > 0) {
        const addr = storedProfile.addresses[0];
        const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
        addressString = parts.join(", ");
      } else if (storedProfile?.address) {
        addressString = storedProfile.address;
      }

      setProfile({
        firstName: storedProfile?.firstName || "",
        lastName: storedProfile?.lastName || "",
        email: storedProfile?.email || "",
        phone: storedProfile?.phone || storedProfile?.phoneNumber || "",
        address: addressString,
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <button
          onClick={handleEditClick}
          className="text-black hover:text-black flex items-center gap-1 transform hover:-translate-y-1 transition"
        >
          <Edit className="h-4 w-4" />
          <span>{isEditing ? "Cancel" : "Edit"}</span>
        </button>
      </div>

      <div className="p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-red-500 focus:border-red-500 transition ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-red-500 focus:border-red-500 transition ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                value={profile.email}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-red-500 focus:border-red-500 transition ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              rows="3"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-red-500 focus:border-red-500 transition ${errors.address ? "border-red-500" : "border-gray-300"}`}
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          {isEditing && (
            <div className="border-t pt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProfileDetails;
