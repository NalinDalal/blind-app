/**
 store to combine all reducers
 */

import {combineReducers, configureStore} from "@reduxjs/toolkit";
import authReducer from "@/redux/slices/AuthSlice";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from 'redux-persist';
import storage from "./storage";
import {authSyncMiddleware} from "@/redux/middleware/authSyncMiddleware";


const persistConfig = {
    key: "root",
    storage,
}

const rootReducer = combineReducers({
    auth: authReducer,
})


const persistedReducer = persistReducer(persistConfig, rootReducer)


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Nest the ignoredActions array inside this object
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(authSyncMiddleware),
    devTools: process.env.NODE_ENV !== "production",
});


export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
