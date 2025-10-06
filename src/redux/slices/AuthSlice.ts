/**
 Auth Slick to maintain authentication related state across the app
 */

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  type AuthMessage,
  AuthMessageType,
  type AuthState,
  AuthStatus,
  type LoginCredentials,
  type SuccessLoginResponse,
} from "@/redux/types";
import type { RootState } from "../store";

export const initialState: AuthState = {
  isAuthenticated: false,
  email: null,
  userId: null,
  message: null,
  status: AuthStatus.IDLE,
  anonName: null,
};

// Login with email and password
export const login = createAsyncThunk<SuccessLoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      dispatch(
        setMessage({ text: "Login Successful", type: AuthMessageType.SUCCESS }),
      );
      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue({ error: err.message });
      }
      return rejectWithValue({ error: "An Unknown Error Occurred" });
    }
  },
);

// Register a new user
export const register = createAsyncThunk<SuccessLoginResponse, LoginCredentials>(
  "auth/register",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        return rejectWithValue({ error: err.message });
      }
      return rejectWithValue({ error: "An Unknown Error Occurred" });
    }
  },
);

// Request an OTP code
export const requestOtp = createAsyncThunk<{ success?: boolean; error?: string }, { email: string }>(
  "auth/requestOtp",
  async ({ email }: { email: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      if (err instanceof Error) return rejectWithValue({ error: err.message });
      return rejectWithValue({ error: "An Unknown Error Occurred" });
    }
  },
);

// Verify OTP and log the user in by fetching a JWT
export const verifyOtp = createAsyncThunk<
  SuccessLoginResponse,
  { email: string; otp: string }
>("auth/verifyOtp", async ({ email, otp }, { dispatch, rejectWithValue }) => {
  try {
    // Step 1: Verify the OTP
    const verifyResponse = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) {
      return rejectWithValue(verifyData);
    }

    // Step 2: Get a JWT for the verified user
    const tokenResponse = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: verifyData.id, email: verifyData.email }),
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
    if (err instanceof Error) return rejectWithValue({ error: err.message });
    return rejectWithValue({ error: "An Unexpected Error Occured" });
  }
});

// Set the user's anonymous name
export const setAnonName = createAsyncThunk(
  "auth/setAnonName",
  async (
    { anonName }: { anonName: string },
    { getState, dispatch, rejectWithValue },
  ) => {
    const state = getState() as RootState;

    try {
      const response = await fetch("/api/anon/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ anonName }),
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
      if (err instanceof Error) return rejectWithValue({ error: err.message });
      return rejectWithValue({ error: "An Unknown Error" });
    }
  },
);

const authSlice = createSlice({
  name: "auth-state",
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.email = null;
      state.userId = null;
    },
    setMessage: (state: AuthState, action: PayloadAction<AuthMessage>) => {
      state.message = action.payload;
    },
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
      .addCase(setAnonName.rejected, handleFailure);
  },
});

export const { logout, clearMessage, setMessage } = authSlice.actions;
export default authSlice.reducer;
