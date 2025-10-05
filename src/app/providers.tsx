"use client";
/**
 A centralized component of all the provider from different libraries
 */

import type React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import TanstackQueryProvider from "@/lib/tanstack/TanProvider";
import { persistor, store } from "@/redux/store";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <TanstackQueryProvider>
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
        </TanstackQueryProvider>
      </PersistGate>
    </Provider>
  );
};
export default Providers;
