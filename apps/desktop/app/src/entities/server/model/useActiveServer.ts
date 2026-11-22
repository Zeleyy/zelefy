import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { serverKeys } from "../api";
import type { Server } from "../model";

export const useActiveServer = () => {
    return useQuery({
        queryKey: serverKeys.active(),
        queryFn: () => invoke<Server>("get_active_server"),
        staleTime: Infinity,
    });
};
