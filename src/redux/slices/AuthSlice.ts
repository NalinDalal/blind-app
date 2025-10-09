/**
 * @fileoverview Authentication state management slice.
 * Handles user authentication, registration, OTP verification, and anonymous name setting.
 * @module redux/slices/AuthSlice
 */

import {createAsyncThunk, createSlice, type PayloadAction,} from "@reduxjs/toolkit";
import {
    type AuthMessage,
    AuthMessageType,
    type AuthState,
    AuthStatus,
    type LoginCredentials,
    type SuccessLoginResponse,
} from "@/redux/types";
import type {RootState} from "../store";

export const initialState: AuthState = {
    isAuthenticated: false,
    email: null,
    userId: null,
    message: null,
    status: AuthStatus.IDLE,
    anonName: null,
};

/**
 * Async thunk for user login with email and password.
 * Makes a POST request to /api/login and updates the auth state on success.
 *
 * @async
 * @function login
 * @param {LoginCredentials} credentials - User's email and password
 * @returns {Promise<SuccessLoginResponse>} User data including id, email, and anonName
 *
 * @example
 * dispatch(login({
 *   email: "student@oriental.ac.in",
 *   password: "securePassword123"
 * }));
 *
 * @throws {Object} Rejects with error object from API response
 */
export const login = createAsyncThunk<SuccessLoginResponse, LoginCredentials>(
    "auth/login",
    async (credentials: LoginCredentials, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch(`/api/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(credentials),
                credentials: "include",
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }
            dispatch(
                setMessage({text: "Login Successful", type: AuthMessageType.SUCCESS}),
            );
            return data;
        } catch (err: unknown) {
            if (err instanceof Error) {
                return rejectWithValue({error: err.message});
            }
            return rejectWithValue({error: "An Unknown Error Occurred"});
        }
    },
);

/**
 * Async thunk for user registration.
 * Creates a new user account with email and password.
 *
 * @async
 * @function register
 * @param {LoginCredentials} credentials - User's email and password
 * @returns {Promise<SuccessLoginResponse>} Registration confirmation
 *
 * @example
 * dispatch(register({
 *   email: "newstudent@oriental.ac.in",
 *   password: "securePassword123"
 * }));
 *
 * @throws {Object} Rejects with error object from API response
 */
export const register = createAsyncThunk<
    SuccessLoginResponse,
    LoginCredentials
>(
    "auth/register",
    async (credentials: LoginCredentials, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(credentials),
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }
            dispatch(
                setMessage({
                    text: "Registration Successful! Please login.",
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            if (err instanceof Error) {
                return rejectWithValue({error: err.message});
            }
            return rejectWithValue({error: "An Unknown Error Occurred"});
        }
    },
);

/**
 * Async thunk for requesting an OTP code.
 * Sends an OTP to the user's email address.
 *
 * @async
 * @function requestOtp
 * @param {Object} params - Parameters object
 * @param {string} params.email - User's email address
 * @returns {Promise<{success?: boolean, error?: string}>} OTP request result
 *
 * @example
 * dispatch(requestOtp({ email: "student@oriental.ac.in" }));
 *
 * @throws {Object} Rejects with error object from API response
 */
export const requestOtp = createAsyncThunk<
    { success?: boolean; error?: string },
    { email: string }
>(
    "auth/requestOtp",
    async ({email}: { email: string }, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch("/api/request-otp", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }
            dispatch(
                setMessage({
                    text: "OTP has been sent to your email.",
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            if (err instanceof Error) return rejectWithValue({error: err.message});
            return rejectWithValue({error: "An Unknown Error Occurred"});
        }
    },
);

/**
 * Async thunk for verifying OTP and logging in.
 * Verifies the OTP code and obtains a JWT token for authentication.
 *
 * @async
 * @function verifyOtp
 * @param {Object} params - Parameters object
 * @param {string} params.email - User's email address
 * @param {string} params.otp - One-time password code
 * @returns {Promise<SuccessLoginResponse>} User data with authentication token
 *
 * @example
 * dispatch(verifyOtp({
 *   email: "student@oriental.ac.in",
 *   otp: "123456"
 * }));
 *
 * @description
 * This thunk performs a two-step process:
 * 1. Verifies the OTP code with /api/verify-otp
 * 2. Obtains a JWT token from /api/token
 *
 * @throws {Object} Rejects with error object from API response
 */
export const verifyOtp = createAsyncThunk<
    SuccessLoginResponse,
    { email: string; otp: string }
>("auth/verifyOtp", async ({email, otp}, {dispatch, rejectWithValue}) => {
    try {
        // Step 1: Verify the OTP
        const verifyResponse = await fetch("/api/verify-otp", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, otp}),
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok) {
            return rejectWithValue(verifyData);
        }

        // Step 2: Get a JWT for the verified user
        const tokenResponse = await fetch("/api/token", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: verifyData.id, email: verifyData.email}),
        });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            return rejectWithValue(tokenData);
        }

        dispatch(
            setMessage({
                text: "OTP Verified Successfully!",
                type: AuthMessageType.SUCCESS,
            }),
        );
        // Return a payload that matches the successful login response
        return {
            token: tokenData.token,
            id: verifyData.id,
            email: verifyData.email,
            anonName: verifyData.anonName,
        };
    } catch (err: unknown) {
        if (err instanceof Error) return rejectWithValue({error: err.message});
        return rejectWithValue({error: "An Unexpected Error Occured"});
    }
});

/**
 * Async thunk for setting the user's anonymous name.
 * This is a one-time operation that cannot be changed once set.
 *
 * @async
 * @function setAnonName
 * @param {Object} params - Parameters object
 * @param {string} params.anonName - Desired anonymous username
 * @returns {Promise<{anonName: string}>} Confirmation with the set anonymous name
 *
 * @example
 * dispatch(setAnonName({ anonName: "cool_student_123" }));
 *
 * @throws {Object} Rejects with error object from API response
 * @note Requires user to be authenticated (JWT in cookies)
 */
export const setAnonName = createAsyncThunk(
    "auth/setAnonName",
    async (
        {anonName}: { anonName: string },
        {getState, dispatch, rejectWithValue},
    ) => {
        const state = getState() as RootState;

        try {
            const response = await fetch("/api/anon/set", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({anonName}),
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }
            dispatch(
                setMessage({
                    text: `Anonymous name set to ${data.anonName}!`,
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            if (err instanceof Error) return rejectWithValue({error: err.message});
            return rejectWithValue({error: "An Unknown Error"});
        }
    },
);

/**
 * Async thunk for logging out the user.
 * Makes a POST request to /api/logout to clear the server-side session
 * and HttpOnly cookie, then clears the client-side Redux state.
 *
 * @async
 * @function logoutUser
 * @returns {Promise<void>}
 *
 * @example
 * dispatch(logoutUser());
 */

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, {dispatch}) => {
        try {
            // This endpoint is responsible for clearing the HttpOnly cookie
            await fetch("/api/logout", {
                method: "POST",
            });
        } finally {
            dispatch(logout());
            setTimeout(() => {
                dispatch(clearMessage());
            }, 3000)
        }
    },
);

/**
 * Authentication slice containing reducers and extra reducers for auth state.
 *
 * @constant
 */
const authSlice = createSlice({
    name: "auth-state",
    initialState,
    reducers: {
        /**
         * Action to log out the current user.
         * Clears all authentication-related state. Called by the logoutUser thunk.
         *
         * @param {AuthState} state - Current auth state
         */
        logout: (state: AuthState) => {
            state.isAuthenticated = false;
            state.email = null;
            state.userId = null;
            state.anonName = null; // Also clear anonName on logout
            state.status = AuthStatus.IDLE;
        },
        /**
         * Action to set a user-facing message (success, error, info).
         *
         * @param {AuthState} state - Current auth state
         * @param {PayloadAction<AuthMessage>} action - Message payload
         */
        setMessage: (state: AuthState, action: PayloadAction<AuthMessage>) => {
            state.message = action.payload;
        },
        /**
         * Action to clear the current message.
         *
         * @param {AuthState} state - Current auth state
         */
        clearMessage: (state: AuthState) => {
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state: AuthState) => {
            state.status = AuthStatus.LOADING;
            state.message = null;
        };
        const handleAuthSuccess = (
            state: AuthState,
            action: PayloadAction<SuccessLoginResponse>,
        ) => {
            state.isAuthenticated = true;
            state.userId = action.payload.id;
            state.email = action.payload.email;
            state.anonName = action.payload.anonName;
            state.status = AuthStatus.SUCCEEDED;
        };
        const handleFailure = (state: AuthState, action: PayloadAction<any>) => {
            state.status = AuthStatus.FAILED;
            if (
                action.payload &&
                typeof action.payload === "object" &&
                "error" in action.payload
            ) {
                state.message = {
                    text: (action.payload as { error: string }).error,
                    type: AuthMessageType.ERROR,
                };
            } else {
                state.message = {
                    text: "An unknown error occurred.",
                    type: AuthMessageType.ERROR,
                };
            }
        };

        builder
            // Login
            .addCase(login.pending, handlePending)
            .addCase(login.fulfilled, handleAuthSuccess)
            .addCase(login.rejected, handleFailure)
            // Register
            .addCase(register.pending, handlePending)
            .addCase(register.fulfilled, (state) => {
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(register.rejected, handleFailure)
            // Request OTP
            .addCase(requestOtp.pending, handlePending)
            .addCase(requestOtp.fulfilled, (state) => {
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(requestOtp.rejected, handleFailure)
            // Verify OTP (results in login)
            .addCase(verifyOtp.pending, handlePending)
            .addCase(verifyOtp.fulfilled, handleAuthSuccess)
            .addCase(verifyOtp.rejected, handleFailure)
            // Set Anon Name
            .addCase(setAnonName.pending, handlePending)
            .addCase(setAnonName.fulfilled, (state, action) => {
                state.anonName = action.payload.anonName;
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(setAnonName.rejected, handleFailure)
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                // The logout() action is dispatched inside the thunk,
                // so the state is already cleared. We just confirm the status.
                state.status = AuthStatus.IDLE;
            });
    },
});

export const {logout, clearMessage, setMessage} = authSlice.actions;
export default authSlice.reducer;
