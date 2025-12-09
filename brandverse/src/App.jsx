import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

// Admin Routes
import { ToastContainer } from "react-toastify";
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import CategoryManagement from "./admin/pages/CategoryManagement";
import CustomerManagement from "./admin/pages/CustomerManagement";
import Dashboard from "./admin/pages/Dashboard"; // ADD THIS
import OrderDetail from "./admin/pages/OrderDetails";
import OrderManagement from "./admin/pages/OrderManagement";
import ProductManagement from "./admin/pages/ProductManagement";
import Reports from "./admin/pages/Reports";
import Settings from "./admin/pages/Settings";
import ProtectedRoute from "./core/protected-route";
import ScrollToTop from "./core/ScrollToTop";
import CheckoutSuccess from "./pages/checkoutSuccess";
import CustomerSupport from "./pages/CustomerSupport";
import ForgetPassword from "./pages/ForgetPassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";

function ClientLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop/>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="category" element={<CategoryManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="order/:orderId" element={<OrderDetail />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Client Routes WITH Navbar/Footer */}
        <Route element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="category" element={<Categories />} />
          <Route path="category/:category" element={<Categories />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout-success" element={<CheckoutSuccess />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="order/:orderId" element={<OrderDetail />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Client Routes WITHOUT Navbar/Footer */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="otp" element={<OtpVerification/>}/>
        <Route path="verify-reset" element={<ResetPassword/>}/>
      </Routes>
      <ToastContainer position="top-right" autoClose={1800} />
    </Router>
  );
}

export default App;