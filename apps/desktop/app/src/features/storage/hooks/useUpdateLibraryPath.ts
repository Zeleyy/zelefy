import { queryClient } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export const useUpdateLibraryPath = () => {
    return useMutation({
        mutationFn: async ({ storageId, path }: { storageId: number; path: string }) => {
            return await invoke<number>("update_user_library", { storageId, path });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["storage"] });
            toast.message("Библиотека успешно обновлена");
        },
    });
};
