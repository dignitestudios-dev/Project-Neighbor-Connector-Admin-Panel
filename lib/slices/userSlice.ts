import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  getUserById,
  getUserEmergencyContacts,
  getUserPosts,
  getUserReported,
  getUserReports,
  toggleUserBlock,
} from "../api/user.api";

// ---------------- TYPES ----------------

export interface ApiUser {
  _id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  homeAddress?: string | null;
  lastCheckInStatus?: string | null;
  joinedGroup?: boolean | null;
  accountStatus?: string | null;
  bio: string | null;
  profilePicture: string | null;
  uid: string | null;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  isPasswordSet?: boolean;
  isSurveyCompleted?: boolean;
  isSurveyV2Completed?: boolean;
  isDeactivatedByAdmin?: boolean;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  __v?: number;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

interface UserState {
  users: ApiUser[];
  userDetail: ApiUser | null;
  userCheckinfo: any | null;

  emergencyContacts: any[];
  posts: any[];
  reportedPosts: any[];
  reportsAgainstUser: any[];

  pagination: Pagination | null;

  loading: boolean;
  detailLoading: boolean;

  error: string | null;
}

const initialState: UserState = {
  users: [],
  userDetail: null,
  userCheckinfo: null,

  emergencyContacts: [],
  posts: [],
  reportedPosts: [],
  reportsAgainstUser: [],

  pagination: null,

  loading: false,
  detailLoading: false,

  error: null,
};

// ---------------- THUNKS ----------------

// ✅ Users List
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params: any, thunkAPI) => {
    try {
      return await getUsers(params);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// ✅ Single User
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, thunkAPI) => {
    try {
      return await getUserById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Other APIs
export const fetchUserEmergencyContacts = createAsyncThunk(
  "users/fetchUserEmergencyContacts",
  async (id: string, thunkAPI) => {
    try {
      return await getUserEmergencyContacts(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  "users/fetchUserPosts",
  async (id: string, thunkAPI) => {
    try {
      return await getUserPosts(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchUserReported = createAsyncThunk(
  "users/fetchUserReported",
  async (id: string, thunkAPI) => {
    try {
      return await getUserReported(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  "users/fetchUserReports",
  async (id: string, thunkAPI) => {
    try {
      return await getUserReports(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const toggleUserBlockStatus = createAsyncThunk(
  "users/toggleUserBlock",
  async (
    { id, toggle }: { id: string; toggle: boolean },
    thunkAPI
  ) => {
    try {
      return await toggleUserBlock(id, toggle);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
// ---------------- SLICE ----------------

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserDetail: (state) => {
      state.userDetail = null;
      state.posts = [];
      state.reportedPosts = [];
      state.reportsAgainstUser = [];
      state.emergencyContacts = [];
    },
  },
  extraReducers: (builder) => {
    
    // ===== USERS LIST =====
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 IMPORTANT FIX
        state.users = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ===== USER DETAIL =====
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.userDetail = action.payload?.data?.users || null;
        state.userCheckinfo = action.payload?.data?.userCheckinfo || null;
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.detailLoading = false;
      });

    // ===== EXTRA DATA =====
    builder.addCase(fetchUserEmergencyContacts.fulfilled, (state, action) => {
      state.emergencyContacts = action.payload?.data || [];
    });

    builder.addCase(fetchUserPosts.fulfilled, (state, action) => {
      state.posts = action.payload?.data || [];
    });

    builder.addCase(fetchUserReported.fulfilled, (state, action) => {
      state.reportedPosts = action.payload?.data?.data || [];
    });

    builder.addCase(fetchUserReports.fulfilled, (state, action) => {
      state.reportsAgainstUser = action.payload.data.data || [];
    });
    builder.addCase(toggleUserBlockStatus.fulfilled, (state, action) => {
      const updatedUser = action.payload;

      state.users = state.users.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      );
    });
  },
});

export const { clearUserDetail } = userSlice.actions;
export default userSlice.reducer;
