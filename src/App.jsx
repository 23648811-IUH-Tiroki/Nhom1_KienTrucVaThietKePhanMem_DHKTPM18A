import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/register";
import ProductDetail from "./pages/ProductDetail"; 
import Search from "./pages/Search";
import CartShop from "./pages/CartShop";
import CheckOut from "./pages/CheckOut";
import UserProfile from "./pages/UserProfile";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import NotFoundPage from "./pages/NotFoundPage";
import UserManagement from "./pages/UserManagement";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { featchProductSale, fetchProducts, fetchProductsByCategory } from "./stores/productSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Category from "./pages/Category";
import { CartProvider } from "./context/CartContext";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import OrderManagement from "./pages/OrderManagement";
import InventoryManagement from "./pages/InventoryManagement";
import SmoothScrollContainer from "./layout/SmoothScrollContainer";
import ContactUs from "./pages/ContactUs";

function App() {
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchProductsByCategory("shop-cho-cun"));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductsByCategory("shop-cho-meo"));
  }, [dispatch]);

  useEffect(() => {
    dispatch(featchProductSale());
  }, [dispatch])

  return (
    <SmoothScrollContainer>
      <BrowserRouter>
        <ToastContainer />
        <CartProvider>
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
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/order-management" element={<OrderManagement />} />
            <Route
              path="/inventory-management"
              element={<InventoryManagement />}
            />
            <Route path="/contactus" element={<ContactUs />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </SmoothScrollContainer>
  );
}

export default App;
