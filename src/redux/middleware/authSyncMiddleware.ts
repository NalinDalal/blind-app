import type { Middleware } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import type { RootState } from "../store"; // We still need this for the type cast

// Add the generic 'Middleware' type annotation here
export const authSyncMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // After this, you need to check if 'action' is a valid object
  // to safely access its 'type' property.
  if (typeof action === "object" && action !== null && "type" in action) {
    if (action.type === "auth/login/fulfilled") {
      // Use a type cast to tell TypeScript the shape of the state
      const state = store.getState() as RootState;
      const hasToken = Boolean(state.auth?.isAuthenticated);
    }

    if (action.type === "auth/logout/fulfilled") {
      Cookies.remove("auth-token");
    }
  }

  return result;
};
