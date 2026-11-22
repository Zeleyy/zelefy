import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { serverKeys } from "../api";

export const useDefaultServerUrl = () => {
    return useQuery({
        queryKey: serverKeys.defaultUrl(),
        queryFn: () => invoke<string>("get_default_server_url"),
        staleTime: Infinity,
    });
};
