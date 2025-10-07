/**
 * @fileoverview Redux store configuration with persistence.
 * Configures the Redux store with auth state, persistence, and middleware.
 * @module redux/store
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

/**
 * Redux Persist configuration.
 * Specifies the storage mechanism and root key for persisted state.
 *
 * @constant {Object} persistConfig
 * @property {string} key - Root key for persisted state in storage
 * @property {Object} storage - Storage adapter (sessionStorage or no-op)
 */
const persistConfig = {
  key: "root",
  storage,
};

/**
 * Root reducer combining all slice reducers.
 * Currently only manages authentication state.
 *
 * @function rootReducer
 * @param {Object|undefined} state - Current state
 * @param {AnyAction} action - Dispatched action
 * @returns {Object} New state after applying the action
 */
const rootReducer = (
  state: { auth: typeof initialState } | undefined,
  action: AnyAction,
) => {
  return {
    auth: authReducer(state?.auth, action),
  };
};

/**
 * Transform to sanitize auth state before persistence.
 * Removes sensitive data from the persisted state if needed.
 *
 * @constant {Transform} authSanitizer
 *
 * @description
 * Currently passes through the state as-is since sensitive data (JWT)
 * is stored in HTTP-only cookies rather than Redux state.
 * This transform can be extended to strip additional sensitive fields.
 */
const authSanitizer = createTransform(
  (inboundState: typeof initialState) => {
    return inboundState;
  },
  (outboundState: typeof initialState) => outboundState,
  { whitelist: ["auth"] },
);

/**
 * Persisted reducer with sanitization transform applied.
 * Wraps the root reducer with Redux Persist functionality.
 *
 * @constant {Function} persistedReducer
 */
const persistedReducer = persistReducer(
  { ...persistConfig, transforms: [authSanitizer] },
  rootReducer,
);

/**
 * Configured Redux store with persistence and custom middleware.
 *
 * @constant {Store} store
 *
 * @example
 * import { store } from "@/redux/store";
 *
 * // In your app root
 * <Provider store={store}>
 *   <App />
 * </Provider>
 *
 * @description
 * Features:
 * - Redux Persist for state persistence across sessions
 * - Auth sync middleware for cookie management
 * - DevTools enabled in development mode
 * - Serializable check configured for Redux Persist actions
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authSyncMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

/**
 * Persistor for the Redux store.
 * Manages rehydration of persisted state on app initialization.
 *
 * @constant {Persistor} persistor
 *
 * @example
 * import { persistor } from "@/redux/store";
 * import { PersistGate } from "redux-persist/integration/react";
 *
 * <PersistGate loading={null} persistor={persistor}>
 *   <App />
 * </PersistGate>
 */
export const persistor = persistStore(store);

/**
 * Type of the dispatch function with all middleware applied.
 * @typedef {typeof store.dispatch} AppDispatch
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Type representing the entire Redux state tree.
 * @typedef {ReturnType<typeof rootReducer> & PersistPartial} RootState
 */
export type RootState = ReturnType<typeof rootReducer> & PersistPartial;
