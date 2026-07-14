import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUsers,
  getUserById,
  getUserEmergencyContacts,
  getUserPosts,
  getUserReported,
  getUserReports,
  getUserSurvey,
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

interface AsyncSectionLoading {
  emergencyContacts: boolean;
  posts: boolean;
  reported: boolean;
  reports: boolean;
  survey: boolean;
}

interface UserState {
  users: ApiUser[];
  userDetail: ApiUser | null;
  userCheckinfo: any | null;

  emergencyContacts: any[];
  posts: any[];
  reportedPosts: any[];
  reportsAgainstUser: any[];
  surveyData: any | null;
  postsPagination: Pagination | null;
  reportedPagination: Pagination | null;
  reportsPagination: Pagination | null;
  sectionLoading: AsyncSectionLoading;

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
  surveyData: null,
  postsPagination: null,
  reportedPagination: null,
  reportsPagination: null,
  sectionLoading: {
    emergencyContacts: false,
    posts: false,
    reported: false,
    reports: false,
    survey: false,
  },

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
  async (
    params: { id: string; page?: number; limit?: number } | string,
    thunkAPI
  ) => {
    try {
      const normalized =
        typeof params === "string"
          ? { id: params, page: 1, limit: 10 }
          : { id: params.id, page: params.page ?? 1, limit: params.limit ?? 10 };
      return await getUserPosts(normalized.id, {
        page: normalized.page,
        limit: normalized.limit,
      });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchUserReported = createAsyncThunk(
  "users/fetchUserReported",
  async (
    params: { id: string; page?: number; limit?: number } | string,
    thunkAPI
  ) => {
    try {
      const normalized =
        typeof params === "string"
          ? { id: params, page: 1, limit: 10 }
          : { id: params.id, page: params.page ?? 1, limit: params.limit ?? 10 };
      return await getUserReported(normalized.id, {
        page: normalized.page,
        limit: normalized.limit,
      });
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchUserReports = createAsyncThunk(
  "users/fetchUserReports",
  async (
    params: { id: string; page?: number; limit?: number } | string,
    thunkAPI
  ) => {
    try {
      const normalized =
        typeof params === "string"
          ? { id: params, page: 1, limit: 10 }
          : { id: params.id, page: params.page ?? 1, limit: params.limit ?? 10 };
      return await getUserReports(normalized.id, {
        page: normalized.page,
        limit: normalized.limit,
      });
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

export const fetchUserSurvey = createAsyncThunk(
  "users/fetchUserSurvey",
  async (id: string, thunkAPI) => {
    try {
      return await getUserSurvey(id);
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
      state.surveyData = null;
      state.postsPagination = null;
      state.reportedPagination = null;
      state.reportsPagination = null;
      state.sectionLoading = {
        emergencyContacts: false,
        posts: false,
        reported: false,
        reports: false,
        survey: false,
      };
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
    builder
      .addCase(fetchUserEmergencyContacts.pending, (state) => {
        state.sectionLoading.emergencyContacts = true;
      })
      .addCase(fetchUserEmergencyContacts.fulfilled, (state, action) => {
        state.sectionLoading.emergencyContacts = false;
        state.emergencyContacts = action.payload?.data || [];
      })
      .addCase(fetchUserEmergencyContacts.rejected, (state) => {
        state.sectionLoading.emergencyContacts = false;
      });

    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.sectionLoading.posts = true;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.sectionLoading.posts = false;
        state.posts = action.payload?.data || [];
        state.postsPagination = action.payload?.pagination || null;
      })
      .addCase(fetchUserPosts.rejected, (state) => {
        state.sectionLoading.posts = false;
      });

    builder
      .addCase(fetchUserReported.pending, (state) => {
        state.sectionLoading.reported = true;
      })
      .addCase(fetchUserReported.fulfilled, (state, action) => {
        state.sectionLoading.reported = false;
        state.reportedPosts = action.payload?.data?.data || [];
        state.reportedPagination = action.payload?.data?.pagination || null;
      })
      .addCase(fetchUserReported.rejected, (state) => {
        state.sectionLoading.reported = false;
      });

    builder
      .addCase(fetchUserReports.pending, (state) => {
        state.sectionLoading.reports = true;
      })
      .addCase(fetchUserReports.fulfilled, (state, action) => {
        state.sectionLoading.reports = false;
        state.reportsAgainstUser = action.payload?.data?.data || [];
        state.reportsPagination = action.payload?.data?.pagination || null;
      })
      .addCase(fetchUserReports.rejected, (state) => {
        state.sectionLoading.reports = false;
      });

    builder
      .addCase(fetchUserSurvey.pending, (state) => {
        state.sectionLoading.survey = true;
      })
      .addCase(fetchUserSurvey.fulfilled, (state, action) => {
        state.sectionLoading.survey = false;
        state.surveyData = action.payload?.data || null;
      })
      .addCase(fetchUserSurvey.rejected, (state) => {
        state.sectionLoading.survey = false;
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
