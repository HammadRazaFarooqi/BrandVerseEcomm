import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-serif text-center">Admin Login</h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-red-600 focus:border-red-600"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
                className="mt-1 w-full px-4 py-2 border rounded-md focus:ring-red-600 focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className=" w-full px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
