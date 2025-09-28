"use client";
/**
 A centralized component of all the provider from different libraries
 */

import type React from "react";
import {Provider} from "react-redux";
import {ThemeProvider} from "@/components/ThemeProvider";
import {persistor, store} from "@/redux/store";
import {PersistGate} from "redux-persist/integration/react";

interface ProvidersProps {
    children: React.ReactNode;
}

const Providers = ({children}: ProvidersProps) => {
    return (
        <Provider store={store}>
            <PersistGate persistor={persistor}
                         loading={null}
            >
                <ThemeProvider
                    attribute={"class"}
                    defaultTheme={"system"}
                    enableSystem
                    enableColorScheme
                    disableTransitionOnChange={false}
                    storageKey={"theme"}
                >
                    {children}
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
};
export default Providers;
