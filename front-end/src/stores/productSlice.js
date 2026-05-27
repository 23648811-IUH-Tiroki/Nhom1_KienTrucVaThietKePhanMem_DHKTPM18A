import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchProductBySlug as fetchProductBySlugRequest,
  fetchProducts as fetchProductsRequest,
  fetchSaleProducts as fetchSaleProductsRequest,
  filterProductsByPrice as filterProductsByPriceRequest,
} from "../services/productService";
import {
  fetchProductsByCategory as fetchProductsByCategoryRequest,
  fetchProductsByCategoryName as fetchProductsByCategoryNameRequest,
} from "../services/categoryService";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await fetchProductsRequest();
    return response.data;
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  "category/fetchProductsByCategory",
  async (slug_type) => {
    const response = await fetchProductsByCategoryRequest(slug_type);
    return { slug_type, products: response.data };
  }
);

export const fetachProductByName = createAsyncThunk(
  "products/fetachProductByName",
  async (slug) => {
    const response = await fetchProductBySlugRequest(slug)
    return response.data?.data ?? response.data
  }
)

export const featchProductSale = createAsyncThunk(
  "products/featchProductSale",
  async () => {
    const response = await fetchSaleProductsRequest()
    return response.data
  }
)

export const featchProductByCategoryName = createAsyncThunk(
  "products/featchProductByCategoryName",
  async ({ slug, currentPage, limit = 8 }) => {
    console.log('currentPage: ', currentPage);

    const response = await fetchProductsByCategoryNameRequest(slug, currentPage, limit)
    return response.data
  }
)

export const featchProductFilterProduct = createAsyncThunk(
  "products/featchProductFilterProduct",
  async (priceRanges) => {
    console.log(priceRanges);

    const response = await filterProductsByPriceRequest(priceRanges);
    return response.data;
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
        state.load = true;
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
        state.load = true;
        state.error = action.error.message;
      })

    // product by name (slug)
    builder
      .addCase(fetachProductByName.pending, (state) => {
        state.load = true;
        state.productDetail = null;
        state.error = null;
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
      state.productSale = action.payload
    })

    builder.addCase(featchProductByCategoryName.fulfilled, (state, action) => {
      state.productByCateoty = action.payload.products;
      state.totalPages = action.payload.totalPages;
    })

    builder.addCase(featchProductFilterProduct.fulfilled, (state, action) => {
      state.productByCateoty = action.payload
    })
  },
});

export const { setCurrentPage, setPageSize } = productSlice.actions
export default productSlice.reducer
