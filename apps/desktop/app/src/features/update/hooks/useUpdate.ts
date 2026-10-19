import { useMutation, useQuery } from "@tanstack/react-query";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";

export const useUpdate = () => {
    const currentVersionQuery = useQuery({
        queryKey: ["version", "current"],
        queryFn: () => getVersion(),
        staleTime: Infinity,
    });

    const checkUpdateQuery = useQuery({
        queryKey: ["version", "last"],
        queryFn: async () => {
            return await check();
        },
        enabled: false,
        staleTime: 0,
    });

    const installMutation = useMutation({
        mutationFn: async () => {
            const update = checkUpdateQuery.data;
            if (!update) {
                throw new Error("No update available");
            }
            await update.downloadAndInstall();
            await relaunch();
        },
    });

    const checkForUpdates = () => {
        checkUpdateQuery.refetch();
    };

    return {
        currentVersion: currentVersionQuery.data,
        isLoadingCurrentVersion: currentVersionQuery.isLoading,

        updateInfo: checkUpdateQuery.data,
        latestVersion: checkUpdateQuery.data?.version,
        hasUpdate: !!checkUpdateQuery.data,

        isChecking: checkUpdateQuery.isFetching,
        isCheckError: checkUpdateQuery.isError,

        installUpdate: installMutation.mutate,
        isInstalling: installMutation.isPending,
        isInstallError: installMutation.isError,

        checkForUpdates,
    };
};
