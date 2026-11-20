import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { queryClient } from "@/shared/api";
import { libraryKeys } from "@/entities/library";

export const useCreateLibrary = () => {
    const { t } = useTranslation();

    return useMutation({
        mutationFn: (path: string) => invoke<number>("add_user_library", { path }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: libraryKeys.all });
            toast.success(t("settings.storage.message.success_added"));
        },
    });
};
