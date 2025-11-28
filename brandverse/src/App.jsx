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
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import CategoryManagement from "./admin/pages/CategoryManagement";
import CustomerManagement from "./admin/pages/CustomerManagement";
import OrderDetail from "./admin/pages/OrderDetails";
import OrderManagement from "./admin/pages/OrderManagement";
import ProductManagement from "./admin/pages/ProductManagement";
import Reports from "./admin/pages/Reports";
import Settings from "./admin/pages/Settings";
import ProtectedRoute from "./core/protected-route";
import CheckoutSuccess from "./pages/checkoutSuccess";
import ForgetPassword from "./pages/ForgetPassword";
import PromotionsManager from "./admin/pages/PromotionManagement";
import CustomerSupport from "./pages/CustomerSupport";

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
          <Route
            index
            element={
              <ProtectedRoute>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route path="category" element={<CategoryManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="order/:orderId" element={<OrderDetail />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="promotions" element={<PromotionsManager />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="category" element={<Categories />} />
          <Route path="category/:category" element={<Categories />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route
            path="cart"
            element={
              // <ProtectedRoute>
              <Cart />
              // </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              // <ProtectedRoute>
              <Checkout />
              // </ProtectedRoute>
            }
          />
          <Route
            path="checkout-success"
            element={<CheckoutSuccess />}
          />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forget-password" element={<ForgetPassword />} />
          <Route path="support" element={<CustomerSupport/>} />
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
      </Routes>
    </Router>
  );
}

export default App;
