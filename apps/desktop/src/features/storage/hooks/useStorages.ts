import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { StorageWithStats } from "@/shared/types";

export const useStorages = () => {
    return useQuery({
        queryKey: ["storage", "list"],
        queryFn: async () => {
            return invoke<StorageWithStats[]>("get_all_storages");
        },
    });
};
