import type { AppRouter } from "@nth-discount-store/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

// Build the tRPC base URL. If VITE_SERVER_URL is not set (undefined),
// fall back to a relative '/trpc' path so requests are made to the same origin.
const rawServerUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
const serverBase = rawServerUrl ? rawServerUrl.replace(/\/$/, "") : "";
const trpcUrl = serverBase ? `${serverBase}/trpc` : "/trpc";

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: trpcUrl,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
