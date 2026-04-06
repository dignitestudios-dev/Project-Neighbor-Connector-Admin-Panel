import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import userReducer from './slices/userSlice';
import notificationReducer from './slices/notificationSlice';
import circleReducer from './slices/circleSlice';
import postReducer from './slices/postSlice';
import reportsSlice from './slices/reportsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    notification: notificationReducer,
    circles: circleReducer,
    posts: postReducer,
    report:reportsSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;