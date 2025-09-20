/**
 Auth SLick to maintain authentication related state across the app
 */

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    AuthMessage,
    AuthMessageType,
    AuthState,
    AuthStatus,
    LoginCredentials,
    SuccessLoginResponse
} from "@/redux/types";


const initialState: AuthState = {
    isAuthenticated: false,
    jwt: null,
    email: null,
    userId: null,
    message: null,
    status: AuthStatus.IDLE,
}

// async thunk for API fetching
export const login = createAsyncThunk("auth/login",
    async (credentials: LoginCredentials, {dispatch, rejectWithValue}) => {
        try {
            const response = await fetch(`/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({credentials})
            })
            const data = await response.json();
            if (!response.ok || !data.token || !data.id) {
                dispatch(setMessage({
                    text: data?.error ?? `Failed to login!`,
                    type: AuthMessageType.ERROR
                }))
                throw new Error(data.error || "Server responded with an error!")
            }
            dispatch(setMessage({
                text: "Login Successful",
                type: AuthMessageType.SUCCESS
            }))
            return data; // payload
        } catch (err: any) {
            return rejectWithValue(err.message); // payload
        }
    }
)

const authSlice = createSlice({
    name: "auth-state",
    initialState,
    reducers: {
        logout: (state: AuthState) => {
            state.isAuthenticated = false;
            state.email = null;
            state.jwt = null;
            state.userId = null;
        },
        setMessage: (state: AuthState, action: PayloadAction<AuthMessage>) => {
            state.message = action.payload;
        },
        clearMessage: (state: AuthState) => {
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state: AuthState) => {
                clearMessage();
                state.status = AuthStatus.LOADING
            })
            .addCase(login.fulfilled, (state: AuthState, action: PayloadAction<SuccessLoginResponse>) => {
                state.isAuthenticated = true;
                state.jwt = action.payload.token;
                state.userId = action.payload.id;
                state.email = action.payload.email;
                state.status = AuthStatus.SUCCEEDED;
            })
            .addCase(login.rejected, (state: AuthState, action) => {
                state.isAuthenticated = false;
                state.jwt = null;
                state.userId = null;
                state.email = null;
                state.status = AuthStatus.FAILED;
                setMessage({
                    text: action.payload as string ?? `Something went wrong`,
                    type: AuthMessageType.ERROR
                })
            })
    }
})

export const {logout, clearMessage, setMessage} = authSlice.actions;
export default authSlice.reducer;
