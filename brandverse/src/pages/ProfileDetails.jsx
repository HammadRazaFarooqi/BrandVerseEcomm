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
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const storedProfile = JSON.parse(localStorage.getItem("isLogin")).user;
    const id = storedProfile.id;

    await fetch(`${BACKEND_URL}/customer/${id}`, {
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
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        const userDetail = JSON.parse(localStorage.getItem("isLogin"));
        userDetail.user = data.customer;
        localStorage.setItem("isLogin", JSON.stringify(userDetail));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    setLoading(false);
    setIsEditing(false);
  };

  useEffect(() => {
    return () => {
      const storedProfile = JSON.parse(localStorage.getItem("isLogin")).user;
      setProfile({
        firstName: storedProfile.firstName,
        lastName: storedProfile.lastName,
        email: storedProfile.email,
        phone: storedProfile.phone,
        address: storedProfile.addresses[0]
          ? `${storedProfile.addresses[0].street} ${storedProfile.addresses[0].state}, ${storedProfile.addresses[0].country}`
          : ``,
      });
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <button
          onClick={handleEditClick}
          className="text-red-500 hover:text-red-600 flex items-center gap-1 transform hover:-translate-y-1 transition"
        >
          <Edit className="h-4 w-4" />
          <span>{isEditing ? "Cancel" : "Edit"}</span>
        </button>
      </div>

      <div className="p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                value={profile.email}
                onChange={handleChange}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="border-t pt-8">
              <button
                type="submit"
                className="px-8 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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
