import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug) => {
    const response = await axiosInstance.get(`/api/categories/catetory/${slug}`)
    return response.data
  }
)


export const fetchAllCategory = createAsyncThunk(
  "categoies/createAsyncThunk",
  async () => {
    const response = await axiosInstance.get("/api/categories");
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