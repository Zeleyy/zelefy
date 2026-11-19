import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { queryClient } from "@/shared/api";

export const useCreateLibrary = () => {
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (path: string) => {
            return await invoke<number>("add_user_library", { path });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["library"] });
            toast.success(t("settings.storage.message.success_added"));
        },
    });
};
