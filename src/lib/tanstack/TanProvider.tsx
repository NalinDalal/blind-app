"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { useState } from "react";

// This component replaces the need to have the setup directly in your RootLayout
export default function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // We use useState to ensure the QueryClient is only created once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default staleTime of 5 minutes. Data will be considered fresh for this long.
            staleTime: 1000 * 60 * 5,
            // Default time to keep unused query data in memory
            gcTime: 1000 * 60 * 10,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
