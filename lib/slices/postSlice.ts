"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deletePostById, getCommentById, getPostById, getPosts } from "../api/post.api";


interface PostUser {
  _id: string;
  name: string;
  circleId : string;
}

interface PostCircle {
  _id: string;
  name: string;
}

interface PostMedia {
  _id?: string;
  url?: string;
  type?: "image" | "video";
}

export interface Post {
  comments: any[];
  _id: string;
  circleId: string;
  user: PostUser;
  circle: PostCircle[];
  type: string;
  title: string;
  description: string;
  dateTime: any;
  date: string;
  time: string;
  frequency: string;
  occurrence: number;
  media: PostMedia[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

interface PostState {
  comments: any[];
  posts: Post[];
  postDetail: Post | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  comments: [],
  posts: [],
  postDetail: null,
  pagination: null,
  loading: false,
  error: null,
};

// ─── Thunks ────────────────────────────────────────────────────────────────



interface FetchPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface FetchCommentByIdParams {
  id: string;
  circleId: string;
}

// ✅ Fetch posts thunk
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (params: FetchPostsParams = {}, thunkAPI) => {
    try {
      return await getPosts(params); // API se data fetch karo
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);
// Fetch single post by id
export const fetchPostById = createAsyncThunk<Post, string>(
  "posts/fetchPostById",
  async (id: string, thunkAPI) => {
    try {
      const response = await getPostById(id);
      return response.data; // API returns single Post object
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const fetchDeletePostById = createAsyncThunk(
  "posts/fetchDeletePostById",
  async (id: string, thunkAPI) => {
    try {
      const response = await deletePostById(id);
      return response; // API returns single Post object
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);


export const fetchGetCommentById = createAsyncThunk(
  "posts/fetchGetCommentById",
  async (params: FetchCommentByIdParams, thunkAPI: any) => {
    try {
      const response = await getCommentById(params.id, params.circleId);
      return response; // API returns single Post object
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to get comment"
      );
    }
  }
);
// ─── Slice ────────────────────────────────────────────────────────────────

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch posts";
      })

      // fetchPostById
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.postDetail = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch post";
      })

      .addCase(fetchDeletePostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeletePostById.fulfilled, (state, action) => {
        state.loading = false;
        state.postDetail = action.payload?.data;
      })
      .addCase(fetchDeletePostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete post";
      });

    // fetchGetCommentById
    builder
      .addCase(fetchGetCommentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGetCommentById.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload?.data;
      })
      .addCase(fetchGetCommentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get comment";
      });
  },
});

export default postSlice.reducer;