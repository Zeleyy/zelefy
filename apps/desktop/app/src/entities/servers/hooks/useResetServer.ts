import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { queryClient } from "@/shared/api";
import { trackKeys } from "@/entities/track";
import type { Server } from "../model";
import { serverKeys } from "../api";
import { useActiveServer } from "./useActiveServer";

export const useResetServer = () => {
    const activeServer = useActiveServer();

    return useMutation({
        mutationFn: () => invoke<Server>("reset_server"),
        onSuccess: async (server) => {
            await queryClient.invalidateQueries({ queryKey: serverKeys.all });
            if (activeServer.data?.serverUrl === server.serverUrl) return;
            await queryClient.invalidateQueries({ queryKey: trackKeys.remoteFeeds() });
        },
    });
};
