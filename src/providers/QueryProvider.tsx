"use client";

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { ReactNode } from "react";
import { showErrorToast } from "@/lib/errors/toastErrorHandler";
import { ApiError } from "@/lib/errors";

interface QueryProviderProps {
	children: ReactNode;
}

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000, // 1 minute
				gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
				refetchOnWindowFocus: false,
				refetchOnMount: false,
				retry: (failureCount, error) => {
					// Don't retry on 4xx errors
					const apiError = ApiError.fromError(error);
					if (apiError.status >= 400 && apiError.status < 500) {
						return false;
					}
					return failureCount < 3;
				},
			},
			mutations: {
				retry: false,
			},
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				// Skip if query has custom error handler
				if (query.options.meta?.skipGlobalErrorHandler) {
					return;
				}
				// For background refetches, don't show toast
				if (query.state.data !== undefined) {
					return;
				}
				showErrorToast(error, {
					fallback: "Failed to load data",
				});
			},
		}),
		mutationCache: new MutationCache({
			onError: (error, _variables, _context, mutation) => {
				// Skip if mutation has custom onError handler or skipGlobalErrorHandler meta
				if (mutation.options.onError || mutation.options.meta?.skipGlobalErrorHandler) {
					return;
				}
				showErrorToast(error, {
					fallback: "Operation failed",
				});
			},
		}),
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	} else {
		if (!browserQueryClient) browserQueryClient = makeQueryClient();
		return browserQueryClient;
	}
}

export function QueryProvider({ children }: QueryProviderProps) {
	const queryClient = getQueryClient();

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
