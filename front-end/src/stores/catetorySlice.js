import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchCategoryBySlug as fetchCategoryBySlugRequest,
  fetchCategories as fetchCategoriesRequest,
} from "../services/categoryService";

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug) => {
    const response = await fetchCategoryBySlugRequest(slug)
    return response.data
  }
)


export const fetchAllCategory = createAsyncThunk(
  "categoies/createAsyncThunk",
  async () => {
    const response = await fetchCategoriesRequest();
    return response.data
  }
)

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    allCategory: []
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
      state.categories = action.payload
    })
    builder.addCase(fetchAllCategory.fulfilled, (state, action) => {
      state.allCategory = action.payload
    })
  }
})

export default categorySlice.reducer