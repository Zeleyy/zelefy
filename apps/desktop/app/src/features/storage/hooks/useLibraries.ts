import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { LibraryWithStats } from "@/shared/types";

export const useLibraries = () => {
    return useQuery({
        queryKey: ["library", "list"],
        queryFn: async () => {
            return invoke<LibraryWithStats[]>("get_all_libraries");
        },
    });
};
