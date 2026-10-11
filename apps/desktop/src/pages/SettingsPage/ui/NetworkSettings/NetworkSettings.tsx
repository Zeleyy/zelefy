import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export interface ApiEndpoint {
    path: string;
    method: string;
}

export const NetworkSettings = () => {
    useQuery({
        queryKey: ["endpoints", "profiles"],
        queryFn: async () => {
            return await invoke<ApiEndpoint[]>("get_available_endpoints", {
                service: "Profiles",
            });
        },
    });

    return <div>NetworkSettings</div>;
};
