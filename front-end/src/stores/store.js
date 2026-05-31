import { configureStore } from "@reduxjs/toolkit";
import productReducer from './productSlice.js';
import cartReducer from './cartSlice.js';
import categoryReducer from './catetorySlice.js'
import reviewReducer from './reviewSlice.js';
import userAdminReducer from './userAdminSlice.js';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    categories: categoryReducer,
    reviews: reviewReducer,
    userAdmin: userAdminReducer,
  },
});