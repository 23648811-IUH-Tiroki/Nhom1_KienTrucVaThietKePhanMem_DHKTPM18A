import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

const normalizeProduct = (product) => ({
  ...product,
  images: Array.isArray(product?.images) ? product.images : [],
  category_id: product?.category_id || null,
});

const normalizeProducts = (products) => (Array.isArray(products) ? products.map(normalizeProduct) : []);

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await axiosInstance.get('/api/products');
    return normalizeProducts(response.data);
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "category/fetchProductsByCategory",
  async (slug_type) => {
    const response = await axiosInstance.get(`/api/categories/${slug_type}`);
    return { slug_type, products: normalizeProducts(response.data) };
  }
);

export const fetachProductByName = createAsyncThunk(
  "products/fetachProductByName",
  async (slug) => {
    const response = await axiosInstance.get(`/api/products/${slug}`);
    return normalizeProduct(response.data);
  }
);

export const featchProductSale = createAsyncThunk(
  "products/featchProductSale",
  async () => {
    const response = await axiosInstance.get(`/api/products/product/sales`);
    return normalizeProducts(response.data);
  }
);

export const featchProductByCategoryName = createAsyncThunk(
  "products/featchProductByCategoryName",
  async ({ slug, currentPage, limit = 8 }) => {
    const response = await axiosInstance.get(`/api/categories/name/${slug}?page=${currentPage}&limit=${limit}`);
    return {
      ...response.data,
      products: normalizeProducts(response.data?.products),
    };
  }
);

export const featchProductFilterProduct = createAsyncThunk(
  "products/featchProductFilterProduct",
  async (priceRanges) => {
    const response = await axiosInstance.post(`/api/products/filterPrice`, { priceRanges });
    return normalizeProducts(response.data);
  }
);



const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    categories: {},
    productSale: [],
    productDetail: null,
    productByCateoty: [],
    currentPage: 1,
    totalPages: 0,
    filterPrice: [],
    load: false,
    error: null,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {

    // All product
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.load = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.load = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.load = false;
        state.error = action.error.message;
      });

    // product by category slug_type
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.load = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.categories[action.payload.slug_type] = action.payload.products;
        state.load = false
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.load = false;
        state.error = action.error.message;
      })

    // product by name (slug)
    builder
      .addCase(fetachProductByName.pending, (state) => {
        state.load = true;
      })
      .addCase(fetachProductByName.fulfilled, (state, action) => {
        state.productDetail = action.payload;
        state.load = false;
      })
      .addCase(fetachProductByName.rejected, (state, action) => {
        state.load = false;
        state.error = action.error.message;
      });

    builder.addCase(featchProductSale.fulfilled, (state, action) => {
      state.productSale = action.payload;
    });

    builder.addCase(featchProductByCategoryName.fulfilled, (state, action) => {
      state.productByCateoty = action.payload.products;
      state.totalPages = action.payload.totalPages;
    });

    builder.addCase(featchProductFilterProduct.fulfilled, (state, action) => {
      state.productByCateoty = action.payload;
    });
  },
});

export const { setCurrentPage, setPageSize } = productSlice.actions
export default productSlice.reducer
