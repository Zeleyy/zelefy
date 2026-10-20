import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : typeof error === "string"
                      ? error
                      : "Operation failed";
            toast.error(message);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
        },
    },
});
