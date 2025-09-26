/**
 store to combine all reducers
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/AuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
