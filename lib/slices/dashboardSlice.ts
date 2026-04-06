// /lib/slices/dashboardSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats, DashboardStats } from "../api/dashboard.api";

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

// ✅ Properly Typed Async Thunk
export const fetchDashboardStats = createAsyncThunk<
  DashboardStats, // success return type
  void,           // argument type (none)
  { rejectValue: string } // error type
>(
  "dashboard/fetchStats",
  async (_, thunkAPI) => {
    try {
      const data = await getDashboardStats();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default dashboardSlice.reducer;