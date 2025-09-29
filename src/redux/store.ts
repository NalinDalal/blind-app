/**
 store to combine all reducers
 */

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  persistReducer,
  persistStore,
  REGISTER,
  REHYDRATE,
  createTransform,
} from "redux-persist";
import { authSyncMiddleware } from "@/redux/middleware/authSyncMiddleware";
import authReducer from "@/redux/slices/AuthSlice";
import storage from "./storage";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
});

// Strip sensitive fields from persisted auth state
const authSanitizer = createTransform(
  (inboundState: any) => {
    const { jwt, ...rest } = inboundState ?? {};
    return rest;
  },
  (outboundState: any) => outboundState,
  { whitelist: ["auth"] },
);

const persistedReducer = persistReducer(
  { ...persistConfig, transforms: [authSanitizer] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Nest the ignoredActions array inside this object
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authSyncMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
