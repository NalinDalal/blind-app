/**
 * @fileoverview Type declarations for redux-persist storage module.
 * Provides TypeScript support for the createWebStorage function.
 * @module types/redux-persist
 */

/**
 * Module declaration for redux-persist's createWebStorage function.
 * Enables TypeScript to recognize and type-check the storage creation utility.
 *
 * @description
 * This declaration allows importing and using createWebStorage without
 * TypeScript compilation errors. The function creates a storage adapter
 * for Redux Persist that works with browser storage APIs.
 *
 * @example
 * import createWebStorage from "redux-persist/lib/storage/createWebStorage";
 *
 * const storage = createWebStorage("local"); // or "session"
 *
 * @see {@link https://github.com/rt2zz/redux-persist} Redux Persist documentation
 */
declare module "redux-persist/lib/storage/createWebStorage";
