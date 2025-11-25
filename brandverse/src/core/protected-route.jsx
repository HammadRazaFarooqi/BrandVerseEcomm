import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const isLogin = JSON.parse(localStorage.getItem("isLogin"));

  // If the user is not logged in, redirect to the login page with the original location
  if (!isLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in but not an admin, prevent access to admin routes
  if (location.pathname.startsWith("/admin") && isLogin.user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // If the user is an admin and tries to access a non-admin page, redirect to /admin
  // if (isLogin.user?.role === "admin" && !location.pathname.startsWith("/admin")) {
  //   return <Navigate to="/admin" replace />;
  // }

  return children;
}

export default ProtectedRoute;
