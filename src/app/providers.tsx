"use client";
/**
 A centralized component of all the provider from different libraries
 */

import type React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/components/ThemeProvider";
import { store } from "@/redux/store";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <Provider store={store}>
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
    </Provider>
  );
};
export default Providers;
