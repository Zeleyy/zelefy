import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { libraryKeys } from "@/entities/library";

export const useSetLibraryPrimary = () => {
    return useMutation({
        mutationFn: (libraryId: number) => invoke("set_primary_library", { libraryId }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
        },
    });
};
