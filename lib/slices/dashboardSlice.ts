// /lib/slices/dashboardSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDashboardStats,
  DashboardStats,
  getDashboardCharts,
} from "../api/dashboard.api";

// ✅ Types
interface ChartItem {
  date: string;
  users: number;
  posts: number;
  circles: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  charts: ChartItem[]; // ✅ missing tha
  loading: boolean;
  error: string | null;
}

// ✅ Initial State
const initialState: DashboardState = {
  stats: null,
  charts: [], // ✅ add kiya
  loading: false,
  error: null,
};

// ✅ Stats Thunk
export const fetchDashboardStats = createAsyncThunk<
  DashboardStats,
  void,
  { rejectValue: string }
>("dashboard/fetchStats", async (_, thunkAPI) => {
  try {
    const data = await getDashboardStats();
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || "Failed to fetch dashboard stats"
    );
  }
});

// ✅ Charts Thunk
export const fetchDashboardCharts = createAsyncThunk<
  { data: ChartItem[] }, // ✅ proper typing
  { enddate: string; startdate: string; type: string },
  { rejectValue: string }
>("dashboard/fetchCharts", async ({ enddate, startdate, type }, thunkAPI) => {
  try {
    const data = await getDashboardCharts(enddate, startdate, type);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.message || "Failed to fetch dashboard charts"
    );
  }
});

// ✅ Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // =========================
      // 📊 STATS
      // =========================
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
      })

      // =========================
      // 📈 CHARTS
      // =========================
      .addCase(fetchDashboardCharts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCharts.fulfilled, (state, action) => {
        state.loading = false;

        // API: { success, message, data }
        state.charts = action.payload?.data || [];
      })
      .addCase(fetchDashboardCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch charts";
      });
  },
});

export default dashboardSlice.reducer;