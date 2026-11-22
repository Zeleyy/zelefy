import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { libraryKeys, type Library } from "@/entities/library";

export const useLibraries = () => {
    return useQuery({
        queryKey: libraryKeys.lists(),
        queryFn: () => invoke<Library[]>("get_libraries"),
    });
};
