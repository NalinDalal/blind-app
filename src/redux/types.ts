export interface AuthState {
    isAuthenticated: boolean;
    userId: string | null;
    email: string | null;
    anonName: string | null;
    message: AuthMessage | null;
    status: AuthStatus;
    isVerified: boolean;
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
    id?: string;
    email: string;
    anonName: string | null;
    isVerified:boolean;
    errorCode?: string;
    error?: string;
}

export interface FailureLoginResponse {
    error: string;
}
