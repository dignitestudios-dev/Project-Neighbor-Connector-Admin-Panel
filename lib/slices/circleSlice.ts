import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCircles,
  getCircleById,
  getCircleMembers,
  getCirclePosts,
  updateCircleName,
  updateCircleInvite,
  toggleCircleAdmin,
  removeMemberFromCircle,
} from "../api/circle.api";

// ---------------- TYPES ----------------

interface ApiCircle {
  _id: string;
  chatRoom: string;
  name: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usersCount: number;
}

interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

interface CircleState {
  circles: ApiCircle[];
  circleDetail: ApiCircle | null;
  members: any[];
  posts: any[];
  pagination: Pagination | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  membersLoading: boolean;
  postsLoading: boolean;
  adminloading: boolean;
}

const initialState: CircleState = {
  circles: [],
  circleDetail: null,
  members: [],
  posts: [],
  pagination: null,
  loading: false,
  detailLoading: false,
  error: null,
  membersLoading: false,
  postsLoading: false,
  adminloading: false,
};

// ---------------- THUNKS ----------------

// ✅ Circles List
export const fetchCircles = createAsyncThunk(
  "circles/fetchCircles",
  async (params: any, thunkAPI) => {
    try {
      return await getCircles(params);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Circle Detail
export const fetchCircleById = createAsyncThunk(
  "circles/fetchCircleById",
  async (id: string, thunkAPI) => {
    try {
      return await getCircleById(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Members
export const fetchCircleMembers = createAsyncThunk(
  "circles/fetchCircleMembers",
  async (id: string, thunkAPI) => {
    try {
      return await getCircleMembers(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Posts
export const fetchCirclePosts = createAsyncThunk(
  "circles/fetchCirclePosts",
  async (id: string, thunkAPI) => {
    try {
      return await getCirclePosts(id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Update Name
export const updateCircleNameThunk = createAsyncThunk(
  "circles/updateCircleName",
  async (
    { id, name }: { id: string; name: string },
    thunkAPI
  ) => {
    try {
      return await updateCircleName(id, name);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Update Invite
export const updateCircleInviteThunk = createAsyncThunk(
  "circles/updateCircleInvite",
  async (
    { id, inviteCode }: { id: string; inviteCode: string },
    thunkAPI
  ) => {
    try {
      return await updateCircleInvite(id, inviteCode);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const toggleCircleAdminThunk = createAsyncThunk(
  "circles/toggleCircleAdmin",
  async (
    { id, userId, toggle }: { id: string; userId: string; toggle: boolean }, // backend ke hisaab se "user"
    thunkAPI
  ) => {
    try {
      // API function me "user" key send kar rahe hain
      const response = await toggleCircleAdmin(id, userId, toggle);
      return response; // updated member ya circle data backend se
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeMemberFromCircleThunk = createAsyncThunk(
  "circles/removeMemberFromCircle",
  async (
    { id, userId, toggle }: { id: string; userId: string; toggle: boolean }, // backend ke hisaab se "user"
    thunkAPI
  ) => {
    try {
      // API function me "user" key send kar rahe hain
      const response = await removeMemberFromCircle(id, userId, toggle);
      return response; // updated member ya circle data backend se
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// ---------------- SLICE ----------------

const circleSlice = createSlice({
  name: "circles",
  initialState,
  reducers: {
    clearCircleDetail: (state) => {
      state.circleDetail = null;
    },
  },
  extraReducers: (builder) => {
    // ✅ Circles List
    builder
      .addCase(fetchCircles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCircles.fulfilled, (state, action) => {
        state.loading = false;
        state.circles = action.payload?.data?.data || [];
        state.pagination = action.payload?.data?.pagination || null;
      })
      .addCase(fetchCircles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ✅ Detail
    builder
      .addCase(fetchCircleById.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchCircleById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.circleDetail = action.payload?.data || null;
      })
      .addCase(fetchCircleById.rejected, (state) => {
        state.detailLoading = false;
      });

    // ✅ Members
    builder.addCase(fetchCircleMembers.pending, (state) => {
      state.membersLoading = true;
    });
    builder.addCase(fetchCircleMembers.fulfilled, (state, action) => {
      state.membersLoading = false;
      state.members = action.payload?.data || [];
    });


    // ✅ Posts
    builder.addCase(fetchCirclePosts.pending, (state) => {
      state.postsLoading = true;
    });
    builder.addCase(fetchCirclePosts.fulfilled, (state, action) => {
      state.postsLoading = false;
      state.posts = action.payload?.data || [];
    });

    // ✅ Update Name (🔥 FULL FIX)
    builder
      .addCase(updateCircleNameThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCircleNameThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedCircle = action.payload?.data;

        // detail update
        state.circleDetail = updatedCircle;

        // list update
        state.circles = state.circles.map((circle) =>
          circle._id === updatedCircle._id ? updatedCircle : circle
        );
      })
      .addCase(updateCircleNameThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ✅ Update Invite
    builder
      .addCase(updateCircleInviteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCircleInviteThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedCircle = action.payload?.data;

        state.circleDetail = updatedCircle;

        state.circles = state.circles.map((circle) =>
          circle._id === updatedCircle._id ? updatedCircle : circle
        );
      })
      .addCase(updateCircleInviteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
    // ✅ Toggle Admin
    builder
      .addCase(toggleCircleAdminThunk.pending, (state) => {
        state.adminloading = true;
      })
      .addCase(toggleCircleAdminThunk.fulfilled, (state, action) => {
        state.adminloading = false;
        
        // Update members list
        state.members = state.members.map((member) =>
          member._id === action.payload?.data?._id ? action.payload?.data : member
        );
      })
      .addCase(toggleCircleAdminThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCircleDetail } = circleSlice.actions;
export default circleSlice.reducer;