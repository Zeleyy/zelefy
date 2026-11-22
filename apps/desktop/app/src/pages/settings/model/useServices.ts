import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useServices = () => {
    return useQuery({
        queryKey: ["endpoints"],
        queryFn: async () => {
            return await invoke<string[]>("get_available_services");
        },
    });
};
