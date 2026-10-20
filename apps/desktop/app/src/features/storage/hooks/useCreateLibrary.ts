import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { toast } from "sonner";

export const useCreateLibrary = () => {
    return useMutation({
        mutationFn: async (path: string) => {
            return await invoke<number>("add_user_library", { path });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["storage"] });
            toast.message("Библиотека успешно добавлена");
        },
    });
};
