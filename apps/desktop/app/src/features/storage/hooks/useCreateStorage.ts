import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import type { NewStorage } from "@/shared/types";

export const useCreateStorage = () => {
    return useMutation({
        mutationFn: async (newStorage: NewStorage) => {
            return await invoke<number>("create_storage", { newStorage });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["storages"] });
        },
    });
};
