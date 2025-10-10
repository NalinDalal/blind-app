/**
 * @fileoverview Authentication state management slice.
 * Handles user registration, login, email verification via OTP, and anonymous name setting.
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

export const initialState: AuthState = {
    isAuthenticated: false,
    email: null,
    userId: null,
    message: null,
    status: AuthStatus.IDLE,
    anonName: null,
    isVerified: false,
};

// =================================================================
// ASYNC THUNKS
// =================================================================

/**
 * Async thunk for user registration.
 * On success, it does not authenticate the user but prepares the state
 * for the mandatory email verification step.
 *
 * @async
 * @function register
 * @param {LoginCredentials} credentials - User's email and password.
 * @returns {Promise<SuccessLoginResponse>} Partial user data, indicating verification is required.
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
            // Immediately request OTP for verification after successful registration
            dispatch(requestOtpEmailVerification({email: data.email}));
            return data; // The API should return { id, email, isVerified: false, anonName: null }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error Occurred";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk for user login.
 * If the user's email is not verified, it will trigger the verification flow.
 * Otherwise, it authenticates the user and proceeds to the app or anon-name setup.
 *
 * @async
 * @function login
 * @param {LoginCredentials} credentials - User's email and password.
 * @returns {Promise<SuccessLoginResponse>} Full user data on success.
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
            const data: SuccessLoginResponse = await response.json();
            if (!response.ok) {
                return rejectWithValue(data);
            }

            // If the user is not verified, trigger the verification flow.
            if (!data.isVerified) {
                dispatch(requestOtpEmailVerification({email: data.email}));
            } else {
                dispatch(
                    setMessage({
                        text: "Login Successful",
                        type: AuthMessageType.SUCCESS,
                    }),
                );
            }
            return data;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error Occurred";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk for requesting an OTP for passwordless login.
 *
 * @async
 * @function requestOtp
 * @param {{ email: string }} params - User's email address.
 * @returns {Promise<{ success?: boolean }>} OTP request result.
 */
export const requestOtp = createAsyncThunk<
    { success?: boolean },
    { email: string }
>(
    "auth/requestOtp",
    async ({email}, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch("/api/request-otp", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);

            dispatch(
                setMessage({
                    text: "OTP has been sent to your email for login.",
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error Occurred";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk for verifying a passwordless login OTP and authenticating.
 *
 * @async
 * @function verifyOtp
 * @param {{ email: string; otp: string }} params - Email and OTP code.
 * @returns {Promise<SuccessLoginResponse>} Full user data on success.
 */
export const verifyOtp = createAsyncThunk<
    SuccessLoginResponse,
    { email: string; otp: string }
>("auth/verifyOtp", async ({email, otp}, {dispatch, rejectWithValue}) => {
    try {
        // This thunk should ideally hit a single endpoint that verifies the OTP
        // and returns a full login session (with a JWT in a cookie).
        const response = await fetch("/api/verify-otp-and-login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, otp}),
            credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) return rejectWithValue(data);

        dispatch(
            setMessage({
                text: "OTP Verified Successfully!",
                type: AuthMessageType.SUCCESS,
            }),
        );
        return data;
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "An Unexpected Error Occurred";
        return rejectWithValue({error: message});
    }
});

/**
 * Async thunk for requesting an OTP for email verification (post-registration).
 *
 * @async
 * @function requestOtpEmailVerification
 * @param {{ email: string }} params - The email to send the verification OTP to.
 */
export const requestOtpEmailVerification = createAsyncThunk(
    "auth/requestEmailVerificationOtp",
    async ({email}: { email: string }, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch("/api/otp/send", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);
            dispatch(
                setMessage({
                    text: "A verification OTP has been sent to your email.",
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error Occurred";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk to verify the user's email with an OTP.
 * On success, this should log the user in to proceed to the next step (set anon name).
 *
 * @async
 * @function verifyEmailOtp
 * @param {{ email: string, otp: string }} credentials - The user's email and the OTP.
 * @returns {Promise<SuccessLoginResponse>} Full user data, establishing an authenticated session.
 */
export const verifyEmailOtp = createAsyncThunk<
    SuccessLoginResponse,
    { email: string; otp: string }
>(
    "auth/verifyEmailOtp",
    async (credentials, {dispatch, rejectWithValue}) => {
        try {
            // SUGGESTION: This API endpoint should verify the OTP, mark the user as verified,
            // and return a full login payload with a session cookie (JWT).
            const response = await fetch("/api/otp/verify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(credentials),
                credentials: "include", // Ensure cookie is set
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);

            dispatch(
                setMessage({
                    text: "Email verified successfully!",
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data; // This should be a SuccessLoginResponse payload
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error Occurred";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk for setting the user's anonymous name.
 *
 * @async
 * @function setAnonName
 * @param {{ anonName: string }} params - The desired anonymous name.
 * @returns {Promise<{ anonName: string }>} Confirmation with the set name.
 */
export const setAnonName = createAsyncThunk(
    "auth/setAnonName",
    async ({anonName}: { anonName: string }, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch("/api/anon/set", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({anonName}),
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data);

            dispatch(
                setMessage({
                    text: `Anonymous name set to ${data.anonName}!`,
                    type: AuthMessageType.SUCCESS,
                }),
            );
            return data;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "An Unknown Error";
            return rejectWithValue({error: message});
        }
    },
);

/**
 * Async thunk for logging out the user.
 *
 * @async
 * @function logoutUser
 */
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, {dispatch}) => {
        try {
            await fetch("/api/logout", {method: "POST"});
        } finally {
            dispatch(logout()); // Ensure client state is always cleared
        }
    },
);

// =================================================================
// SLICE DEFINITION
// =================================================================

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.email = null;
            state.userId = null;
            state.anonName = null;
            state.isVerified = false;
            state.status = AuthStatus.IDLE;
        },
        setMessage: (state, action: PayloadAction<AuthMessage>) => {
            state.message = action.payload;
        },
        clearMessage: (state) => {
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        // ================== SHARED REDUCER LOGIC ==================
        const handlePending = (state: AuthState) => {
            state.status = AuthStatus.LOADING;
            state.message = null;
        };

        const handleFailure = (state: AuthState, action: PayloadAction<any>) => {
            state.status = AuthStatus.FAILED;
            state.message = {
                text: action.payload?.error || "An unknown error occurred.",
                type: AuthMessageType.ERROR,
            };
        };

        /** Handles a fully successful authentication, setting all user details. */
        const handleAuthSuccess = (
            state: AuthState,
            action: PayloadAction<SuccessLoginResponse>,
        ) => {
            state.isAuthenticated = true;
            state.userId = action.payload.id;
            state.email = action.payload.email;
            state.anonName = action.payload.anonName;
            state.isVerified = action.payload.isVerified;
            state.status = AuthStatus.SUCCEEDED;
        };

        /** Handles state when a user is not verified. Sets email for the OTP UI. */
        const handleVerificationRequired = (
            state: AuthState,
            action: PayloadAction<SuccessLoginResponse>,
        ) => {
            state.isAuthenticated = false; // Not yet authenticated
            state.isVerified = false;
            state.email = action.payload.email; // Keep email for verification step
            state.userId = action.payload.id;
            state.status = AuthStatus.SUCCEEDED;
            // Message is dispatched from the thunk to be more specific
        };

        // ================== THUNK LIFECYCLE HANDLING ==================
        builder
            // REGISTER: Leads to verification step
            .addCase(register.pending, handlePending)
            .addCase(register.fulfilled, handleVerificationRequired)
            .addCase(register.rejected, handleFailure)

            // LOGIN: Can lead to auth success OR verification step
            .addCase(login.pending, handlePending)
            .addCase(login.fulfilled, (state, action) => {
                if (action.payload.isVerified) {
                    handleAuthSuccess(state, action);
                } else {
                    handleVerificationRequired(state, action);
                }
            })
            .addCase(login.rejected, handleFailure)

            // PASSWORDLESS OTP LOGIN: Leads to auth success
            .addCase(verifyOtp.pending, handlePending)
            .addCase(verifyOtp.fulfilled, handleAuthSuccess)
            .addCase(verifyOtp.rejected, handleFailure)

            // EMAIL VERIFICATION OTP: Leads to auth success
            .addCase(verifyEmailOtp.pending, handlePending)
            .addCase(verifyEmailOtp.fulfilled, handleAuthSuccess)
            .addCase(verifyEmailOtp.rejected, handleFailure)

            // SET ANON NAME: Updates name for an already-authed user
            .addCase(setAnonName.pending, handlePending)
            .addCase(setAnonName.fulfilled, (state, action) => {
                state.anonName = action.payload.anonName;
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(setAnonName.rejected, handleFailure)

            // LOGOUT: Clears state
            .addCase(logoutUser.fulfilled, (state) => {
                state.status = AuthStatus.IDLE;
            })

            // Simple status updates for OTP requests
            .addCase(requestOtp.pending, handlePending)
            .addCase(requestOtp.rejected, handleFailure)
            .addCase(requestOtp.fulfilled, (state) => {
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(requestOtpEmailVerification.pending, handlePending)
            .addCase(requestOtpEmailVerification.rejected, handleFailure)
            .addCase(requestOtpEmailVerification.fulfilled, (state) => {
                state.status = AuthStatus.SUCCEEDED;
            });
    },
});

export const {logout, clearMessage, setMessage} = authSlice.actions;
export default authSlice.reducer;