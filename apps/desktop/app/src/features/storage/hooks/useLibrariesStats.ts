import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { libraryKeys, type LibraryStats } from "@/entities/library";

export const useLibrariesStats = () => {
    return useQuery({
        queryKey: libraryKeys.stats(),
        queryFn: () => invoke<LibraryStats[]>("get_libraries_stats"),
    });
};
