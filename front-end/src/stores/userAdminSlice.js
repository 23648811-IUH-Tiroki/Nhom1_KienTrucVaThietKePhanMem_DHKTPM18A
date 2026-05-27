import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchUsers, blockUserRequest, unblockUserRequest, updateUserRoleRequest } from "../services/adminService";

export const getUsers = createAsyncThunk("admin/getUsers", async (params, { rejectWithValue }) => {
  try {
    const res = await fetchUsers(params || {});
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const blockUser = createAsyncThunk("admin/blockUser", async (id, { rejectWithValue }) => {
  try {
    const res = await blockUserRequest(id);
    return { id, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const unblockUser = createAsyncThunk("admin/unblockUser", async (id, { rejectWithValue }) => {
  try {
    const res = await unblockUserRequest(id);
    return { id, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const updateUserRole = createAsyncThunk("admin/updateUserRole", async ({ id, role }, { rejectWithValue }) => {
  try {
    const res = await updateUserRoleRequest(id, role);
    return { id, role };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

const slice = createSlice({
  name: "userAdmin",
  initialState: {
    users: [],
    total: 0,
    loading: false,
    error: null,
    page: 1,
    totalPages: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 0;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })

      .addCase(blockUser.fulfilled, (state, action) => {
        const id = action.payload.id;
        const idx = state.users.findIndex((u) => u._id === id);
        if (idx !== -1) state.users[idx].isBlocked = true;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const id = action.payload.id;
        const idx = state.users.findIndex((u) => u._id === id);
        if (idx !== -1) state.users[idx].isBlocked = false;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { id, role } = action.payload;
        const idx = state.users.findIndex((u) => u._id === id);
        if (idx !== -1) state.users[idx].role = role;
      });
  },
});

export default slice.reducer;
