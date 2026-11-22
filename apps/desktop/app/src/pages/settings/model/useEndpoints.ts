import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface ApiEndpoint {
    path: string;
    method: string;
}

export const useEndpoints = (service: string | null) => {
    return useQuery({
        queryKey: ["endpoints", service],
        enabled: !!service,
        queryFn: () => invoke<ApiEndpoint[]>("get_available_endpoints", { service }),
        staleTime: 5 * 60 * 1000,
    });
};
