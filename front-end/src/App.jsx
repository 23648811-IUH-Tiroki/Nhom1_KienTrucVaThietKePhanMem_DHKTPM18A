import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { featchProductSale, fetchProducts, fetchProductsByCategory } from "./stores/productSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/CartContext";
import SmoothScrollContainer from "./layout/SmoothScrollContainer";
import AppRoutes from "./routes";

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
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </BrowserRouter>
    </SmoothScrollContainer>
  );
}

export default App;
