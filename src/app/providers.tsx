"use client";
/**
 A centralized component of all the provider from different libraries
 */

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "@/components/ThemeProvider";

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
