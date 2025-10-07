/**
 * @fileoverview Custom typed Redux hooks for the application.
 * Provides type-safe alternatives to the standard Redux hooks.
 * @module redux/hooks
 */
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "./store";

/**
 * Typed version of the `useDispatch` hook.
 * Use this throughout the app instead of the plain `useDispatch` for type safety.
 *
 * @function useAppDispatch
 * @returns {AppDispatch} Typed dispatch function
 *
 * @example
 * import { useAppDispatch } from "@/redux/hooks";
 * import { login } from "@/redux/slices/AuthSlice";
 *
 * function LoginComponent() {
 *   const dispatch = useAppDispatch();
 *   const handleLogin = () => {
 *     dispatch(login({ email: "user@example.com", password: "password123" }));
 *   };
 * }
 *
 * @description
 * This hook provides TypeScript autocomplete for all available actions
 * and ensures type-safe dispatch calls.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of the `useSelector` hook.
 * Use this throughout the app instead of the plain `useSelector` for type safety.
 *
 * @constant {TypedUseSelectorHook<RootState>}
 *
 * @example
 * import { useAppSelector } from "@/redux/hooks";
 *
 * function UserProfile() {
 *   const email = useAppSelector((state) => state.auth.email);
 *   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
 *   return <div>Welcome {email}</div>;
 * }
 *
 * @description
 * This hook provides TypeScript autocomplete for the entire state tree
 * and ensures type-safe state access.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
