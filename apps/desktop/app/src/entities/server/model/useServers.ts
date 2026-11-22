import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { serverKeys } from "../api";
import type { Server } from "../model";

export const useServers = () => {
    return useQuery({
        queryKey: serverKeys.lists(),
        queryFn: () => invoke<Server[]>("get_servers"),
        staleTime: Infinity,
    });
};
