import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getNotification as getNotificationApi, createNotification as createNotificationApi, markAllNotificationsReadApi, deleteAllNotificationsApi } from "../api/notification.api";

interface Notification {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface NotificationState {
  notifications: Notification[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  pagination: null,
  loading: false,
  error: null,
};

interface NotificationFetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async ({ page = 1, limit = 10, search = "" }: NotificationFetchParams) => {
    const response = await getNotificationApi(page, limit, search);
    console.log(response)
    return response; 
    
  }
);
export const createNotification = createAsyncThunk(
  "notification/createNotification",
  async (data: { title: string; description: string;  when?: string }) => {
    const response = await createNotificationApi(data);
    return response; 
  }
);
export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async () => {
    const response = await markAllNotificationsReadApi();
    return response; 
  }
);

export const deleteAllNotifications = createAsyncThunk(
  "notification/deleteAllNotifications",
  async () => {
    const response = await deleteAllNotificationsApi();
    return response; 
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        // API response structure
        state.notifications = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch notifications";
      });
      
      builder.addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.push(action.payload);
      })
      
      builder.addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to create notification";
      });
      
      builder.addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
      })
      
      builder.addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to mark all notifications as read";
      });
      
      builder.addCase(deleteAllNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = [];
      })
      
      builder.addCase(deleteAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to delete all notifications";
      });
  },
});

export default notificationSlice.reducer;