import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ProductDetail from "../pages/Product/ProductDetail";
import Search from "../pages/Search/Search";
import CartShop from "../pages/CartShop/CartShop";
import CheckOut from "../pages/Checkout/CheckOut";
import UserProfile from "../pages/User/UserProfile";
import News from "../pages/News/News";
import NewsDetail from "../pages/News/NewsDetail";
import NotFoundPage from "../pages/Error/NotFoundPage";
import UserManagement from "../pages/User/UserManagement";
import Category from "../pages/Category/Category";
import Dashboard from "../pages/Dashboard/Dashboard";
import Settings from "../pages/Setting/Settings";
import OrderManagement from "../pages/Order/OrderManagement";
import InventoryManagement from "../pages/Product/InventoryManagement";
import ContactUs from "../pages/ContactUs/ContactUs";
import ForgotPassword from "../pages/ForgotPassWord";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/search" element={<Search />} />
      <Route path="/cart" element={<CartShop />} />
      <Route path="/checkout" element={<CheckOut />} />
      <Route path="/userProfile" element={<UserProfile />} />
      <Route path="/blogs/news" element={<News />} />
      <Route path="/blogs/news/:slug" element={<NewsDetail />} />
      <Route path="/categories/:slug" element={<Category />} />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <OrderManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <InventoryManagement />
          </ProtectedRoute>
        }
      />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default AppRoutes;
