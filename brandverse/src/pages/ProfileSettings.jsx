import { useEffect, useState } from "react";

function ProfileSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update password");

      setMessage("Password updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("isLogin"));
    if (user && user.user) {
      setUserEmail(user.user.email);
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-6 border-b bg-gray-50">
        <h2 className="text-2xl font-bold">Account Settings</h2>
      </div>

      <div className="p-8 space-y-8">
        <div className="border-b pb-8">
          <h3 className="text-xl font-medium mb-6">Change Password</h3>
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* <div>
          <h3 className="text-xl font-medium mb-6 text-red-500">Danger Zone</h3>
          <p className="text-gray-600 mb-6">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button className="px-8 py-3 bg-white border-2 border-red-500 text-red-500 font-medium rounded-full hover:bg-red-50 transition">
            Delete Account
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default ProfileSettings;
