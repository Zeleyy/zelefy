import { queryClient } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

export const useUpdateLibraryPath = () => {
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async ({ libraryId, path }: { libraryId: number; path: string }) => {
            return await invoke<number>("update_user_library", { libraryId, path });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["library"] });
            toast.success(t("settings.storage.message.success_updated"));
        },
    });
};
