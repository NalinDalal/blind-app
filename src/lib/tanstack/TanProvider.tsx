"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type React from "react";
import { useState } from "react";

/**
 * Wraps children with a TanStack Query client provider and renders the React Query DevTools.
 *
 * The provider uses a single QueryClient instance configured so queries are considered fresh for 5 minutes
 * (staleTime) and unused query data is eligible for garbage collection after 10 minutes (gcTime).
 *
 * @returns A React element that provides QueryClient context to `children` and includes ReactQueryDevtools.
 */
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
