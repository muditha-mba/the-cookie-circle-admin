"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { getErrorMessage } from "@/lib/api/error-message";
import { appToast } from "@/lib/toast";

type QueryProviderProps = {
  children: ReactNode;
};

function shouldSilenceError(meta: Record<string, unknown> | undefined): boolean {
  return meta?.silentError === true || meta?.silent === true;
}

function getSuccessMessage(meta: Record<string, unknown> | undefined): string | null {
  const message = meta?.successMessage;
  return typeof message === "string" && message.trim() ? message : null;
}

function shouldShowQueryError(meta: Record<string, unknown> | undefined): boolean {
  return meta?.errorToast === true;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const message = getSuccessMessage(mutation.meta);
            if (message) {
              appToast.success(message);
            }
          },
          onError: (error, _variables, _context, mutation) => {
            if (shouldSilenceError(mutation.meta)) {
              return;
            }
            appToast.error(getErrorMessage(error));
          },
        }),
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (!shouldShowQueryError(query.meta)) {
              return;
            }
            appToast.error(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            meta: {
              silentError: false,
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
