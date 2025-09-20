export interface AuthState {
    isAuthenticated: boolean;
    jwt: string | null;
    userId: string | null;
    email: string | null;
    message: AuthMessage | null;
    status: AuthStatus;
}

export enum AuthMessageType {
    SUCCESS = "success",
    ERROR = "error",
    INFO = "info",
}

export enum AuthStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
}

export interface AuthMessage {
    text: string | null;
    type?: AuthMessageType | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SuccessLoginResponse {
    token: string;
    id: string;
    email: string;
}

export interface FailureLoginResponse {
    error: string;
}