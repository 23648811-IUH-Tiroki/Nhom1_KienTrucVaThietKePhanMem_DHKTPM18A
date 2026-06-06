import { Routes, Route, Navigate } from "react-router-dom";
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
import ContactUs from "../pages/ContactUs/ContactUs";
import ForgotPassword from "../pages/ForgotPassWord";
import ProtectedRoute from "./ProtectedRoute";
import MyReviews from "../pages/Review/MyReviews";
import ReviewPage from "../pages/Review/ReviewPage";

// Admin Layout & Pages
import AdminLayout from "../layout/AdminLayout";
import DashboardPage from "../pages/Admin/DashboardPage";
import ProductsPage from "../pages/Admin/ProductsPage";
import ProductFormPage from "../pages/Admin/ProductFormPage";
import CategoriesPage from "../pages/Admin/CategoriesPage";
import CategoryFormPage from "../pages/Admin/CategoryFormPage";
import InventoryPage from "../pages/Admin/InventoryPage";
import OrdersPage from "../pages/Admin/OrdersPage";
import UsersPage from "../pages/Admin/UsersPage";
import ReportsPage from "../pages/Admin/ReportsPage";
import SettingsPage from "../pages/Admin/SettingsPage";
import ProfilePage from "../pages/Admin/ProfilePage";

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
      <Route path="/my-reviews" element={<MyReviews />} />
      <Route path="/review/:productId/:orderId" element={<ReviewPage />} />
      <Route path="/blogs/news" element={<News />} />
      <Route path="/blogs/news/:slug" element={<NewsDetail />} />
      <Route path="/categories/:slug" element={<Category />} />
      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Standardized Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductFormPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryFormPage />} />
        <Route path="categories/edit/:id" element={<CategoryFormPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Legacy routes redirects (optional) */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/inventory-management" element={<Navigate to="/admin/inventory" replace />} />
      <Route path="/order-management" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
      <Route path="/user-management" element={<Navigate to="/admin/users" replace />} />

    </Routes>
  );
};

export default AppRoutes;
