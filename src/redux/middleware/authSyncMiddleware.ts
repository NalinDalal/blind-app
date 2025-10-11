/**
 * @fileoverview Redux middleware for synchronizing authentication state with cookies.
 * Monitors auth-related actions and manages HTTP-only cookie cleanup.
 * @module redux/middleware/authSyncMiddleware
 */
import type { Middleware } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import type { RootState } from "../store"; // We still need this for the type cast

/**
 * Redux middleware that synchronizes authentication state with browser cookies.
 * Removes the auth-token cookie when the user logs out.
 *
 * @constant {Middleware} authSyncMiddleware
 *
 * @example
 * // In store.ts
 * const store = configureStore({
 *   reducer: rootReducer,
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(authSyncMiddleware),
 * });
 *
 * @description
 * This middleware intercepts Redux actions and performs side effects:
 * - On `auth/login/fulfilled`: Checks if token exists in state
 * - On `auth/logout/fulfilled`: Removes the auth-token cookie
 *
 * The middleware ensures that client-side state stays in sync with
 * the authentication cookie managed by the server.
 *
 * @note Uses js-cookie library for cookie manipulation
 */
export const authSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof action === "object" && action !== null && "type" in action) {
    if (action.type === "auth/login/fulfilled") {
      const state = store.getState() as RootState;
      const _hasToken = Boolean(state.auth?.isAuthenticated);
    }

    if (action.type === "auth/logout/fulfilled") {
      Cookies.remove("auth-token");
    }
  }

  return result;
};
