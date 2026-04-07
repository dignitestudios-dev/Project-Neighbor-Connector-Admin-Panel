import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getReports,
  getReportsStats,
  resolveReport,
} from "../api/reports.api";

// ---------------- TYPES ----------------

interface ReportUser {
  _id: string;
  fullName?: string;
  username?: string;
  emailAddress?: string;
  reason: string;
  description?: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  reportedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  };
  reported?: {
    _id?: string;
    name?: string;
    title?: string;
    description?: string;
  };
  targetModel?: string;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

// ✅ NEW: Stats type
interface ReportsStats {
  pendingReports: number;
  resolvedReports: number;
  chatroomReports: number;
  messageReports: number;
  postReports: number;
  commentReports: number;
  userReports: number;
}

// ---------------- STATE ----------------

interface ReportState {
  reports: ReportUser[];
  pagination: Pagination | null;

  stats: ReportsStats;

  loading: boolean;
  statsLoading: boolean;

  error: string | null;
}

// ---------------- INITIAL STATE ----------------

const initialState: ReportState = {
  reports: [],
  pagination: null,

  stats: {
    pendingReports: 0,
    resolvedReports: 0,
    chatroomReports: 0,
    messageReports: 0,
    postReports: 0,
    commentReports: 0,
    userReports: 0,
  },

  loading: false,
  statsLoading: false,

  error: null,
};

// ---------------- FETCH REPORTS ----------------

export const fetchReportsUsers = createAsyncThunk(
  "report/fetchReportsUsers",
  async (
    params: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
    } = {},
    thunkAPI
  ) => {
    try {
      const { page = 1, limit = 30, type, status } = params;

      const response = await getReports({
        page,
        limit,
        type,
        status,
      });

      return response.data; // 👈 important
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to fetch reports"
      );
    }
  }
);

// ---------------- RESOLVE REPORT ----------------

export const resolveReportThunk = createAsyncThunk(
  "report/resolve",
  async (
    { id, action }: { id: string; action: "accept" | "reject" },
    thunkAPI
  ) => {
    try {
      await resolveReport(id, action);
      return { id, action };
    } catch (err: unknown) {
      return thunkAPI.rejectWithValue(
        (err as { message?: string })?.message || "Failed to resolve report"
      );
    }
  }
);

// ---------------- FETCH STATS ----------------

export const fetchReportsStats = createAsyncThunk(
  "report/fetchReportsStats",
  async (_, thunkAPI) => {
    try {
      const response = await getReportsStats();
      return response.data; // 👈 FIXED
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to fetch reports stats"
      );
    }
  }
);

// ---------------- SLICE ----------------

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // 🔄 FETCH REPORTS
      .addCase(fetchReportsUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportsUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload?.data?.data || action.payload?.data || [];
        state.pagination = action.payload?.data?.pagination || action.payload?.pagination || null;
      })
      .addCase(fetchReportsUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ RESOLVE REPORT (FIXED)
      .addCase(resolveReportThunk.fulfilled, (state, action) => {
        const report = state.reports.find(
          (r) => r._id === action.payload.id
        );

        if (report) {
          report.status =
            action.payload.action === "accept"
              ? "resolve"
              : "reject"; // ❗ fix (tumne pending likha tha)
        }
      })

      // 📊 FETCH STATS
      .addCase(fetchReportsStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchReportsStats.fulfilled, (state, action) => {
        state.statsLoading = false;

        state.stats = {
          pendingReports: action.payload.pendingReports || 0,
          resolvedReports: action.payload.resolvedReports || 0,
          chatroomReports: action.payload.chatroomReports || 0,
          messageReports: action.payload.messageReports || 0,
          postReports: action.payload.postReports || 0,
          commentReports: action.payload.commentReports || 0,
          userReports: action.payload.userReports || 0,
        };
      })
      .addCase(fetchReportsStats.rejected, (state) => {
        state.statsLoading = false;
      });
  },
});

export default reportsSlice.reducer;
