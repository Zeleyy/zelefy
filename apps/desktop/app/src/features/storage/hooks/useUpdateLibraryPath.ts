import { queryClient } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export const useUpdateLibraryPath = () => {
    return useMutation({
        mutationFn: async ({ libraryId, path }: { libraryId: number; path: string }) => {
            return await invoke<number>("update_user_library", { libraryId, path });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library"] });
            toast.message("Библиотека успешно обновлена");
        },
    });
};
