/**
 * @fileoverview Storage configuration for Redux Persist.
 * Provides a storage adapter that works in both browser and server environments.
 * @module redux/storage
 */
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/**
 * Creates a no-op (no operation) storage adapter for server-side rendering.
 * Returns empty promises to prevent errors when Redux Persist runs on the server.
 *
 * @function createNoopStorage
 * @returns {Object} Storage adapter with getItem, setItem, and removeItem methods
 *
 * @description
 * This adapter is used during SSR (Server-Side Rendering) where localStorage
 * is not available. All methods return resolved promises without performing
 * any actual storage operations.
 */
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: unknown) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

/**
 * Storage adapter for Redux Persist.
 * Uses sessionStorage in browser environments and a no-op adapter on the server.
 *
 * @constant {Object} storage
 *
 * @example
 * import storage from "@/redux/storage";
 *
 * const persistConfig = {
 *   key: "root",
 *   storage, // Uses sessionStorage in browser, no-op on server
 * };
 *
 * @description
 * - Browser: Uses sessionStorage to persist state within the browser tab
 * - Server: Uses no-op adapter to prevent SSR errors
 *
 * Data persisted in sessionStorage is cleared when the browser tab is closed.
 */
const storage =
  typeof window !== "undefined"
    ? createWebStorage("session")
    : createNoopStorage();

export default storage;
