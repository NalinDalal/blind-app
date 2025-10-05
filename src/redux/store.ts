/**
 store to combine all reducers
 */

import { type AnyAction, configureStore } from "@reduxjs/toolkit";
import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  persistReducer,
  persistStore,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import type { PersistPartial } from "redux-persist/es/persistReducer";
import { authSyncMiddleware } from "@/redux/middleware/authSyncMiddleware";
import authReducer, { type initialState } from "@/redux/slices/AuthSlice";
import storage from "./storage";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = (
  state: { auth: typeof initialState } | undefined,
  action: AnyAction,
) => {
  return {
    auth: authReducer(state?.auth, action),
  };
};

// Strip sensitive fields from persisted auth state
const authSanitizer = createTransform(
  (inboundState: typeof initialState) => {
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
export type RootState = ReturnType<typeof rootReducer> & PersistPartial;
